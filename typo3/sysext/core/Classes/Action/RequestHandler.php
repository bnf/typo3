<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Core\Action;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Exclude;
use TYPO3\CMS\Core\Action\Error\InvalidRequestError;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Core\RequestId;
use TYPO3\CMS\Core\JsonSchema\Hydrator;
use TYPO3\CMS\Core\JsonSchema\SchemaNarrower;

/**
 * @internal
 */
#[Exclude]
final readonly class RequestHandler implements RequestHandlerInterface
{
    public function __construct(
        private ActionDescriptor $action,
        private ActionRegistry $actionRegistry,
        private ActionInvoker $actionInvoker,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private Context $context,
        private LoggerInterface $logger,
        private SchemaNarrower $schemaNarrower,
        private LinkResolver $linkResolver,
        private ProblemResponseFactory $problemResponseFactory,
        private RequestId $requestId,
        private ?ActionUriGeneratorInterface $uriGenerator = null,
    ) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        // Released after handling, the shutdown function must not keep the handler alive
        $fatalErrorHandling = [
            // Memory to free for the response to a fatal error, e.g. on memory exhaustion
            'reservedMemory' => new \SplFixedArray(187500),
            'handler' => $this,
        ];
        register_shutdown_function(static function () use (&$fatalErrorHandling): void {
            if ($fatalErrorHandling === null) {
                return;
            }
            $handler = $fatalErrorHandling['handler'];
            $fatalErrorHandling = null;
            $handler->respondToFatalError(error_get_last());
        });
        try {
            $response = $this->handleAction($request);
        } catch (\Throwable $e) {
            // Details of unexpected errors are internal, they are logged to be found by the request ID
            $this->logger->error('Action {id} failed', [
                'id' => $this->action->id,
                'exception' => $e,
            ]);
            $response = $this->createInternalErrorResponse();
        } finally {
            $fatalErrorHandling = null;
        }
        if ($this->action->deprecated !== null) {
            // Structured field date, see RFC 9745
            $response = $response->withHeader('Deprecation', '@' . $this->action->deprecated);
        }
        return $response;
    }

    private function handleAction(ServerRequestInterface $request): ResponseInterface
    {
        $id = $this->action->id;

        $currentScopes = $request->getAttribute('api.scopes', []);
        foreach ($this->action->scopes as $scope) {
            if (!isset($currentScopes[$scope])) {
                return $this->problemResponseFactory->createResponse(403, 'Missing scope: ' . $scope)
                    ->withHeader('WWW-Authenticate', sprintf('Bearer error="insufficient_scope", scope="%s"', $scope));
            }
        }

        $requireJsonContentType = !in_array($request->getMethod(), ['GET', 'HEAD', 'DELETE'], true);
        if ($requireJsonContentType) {
            $contentType = $request->getHeader('Content-Type');
            if (count($contentType) !== 1) {
                return $this->problemResponseFactory->createResponse(415, 'The request body must be of type application/json');
            }
            $mediaType = explode(';', $contentType[0], 2)[0];
            if ($mediaType !== 'application/json') {
                /*
                // @todo add Accept-Post/Accept-Patch
                $isPost = $request->getMethod() === 'POST';
                $isPatch = $request->getMethod() === 'PATCH';
                */
                return $this->problemResponseFactory->createResponse(415, 'The request body must be of type application/json');
            }
        }
        try {
            $arguments = $this->mapArgumentsFromRequest($request);
        } catch (InvalidRequestError $e) {
            return $this->problemResponseFactory->createErrorResponse($e);
        }
        $context = new ActionContext(
            $this->context,
            $GLOBALS['BE_USER'],
            $GLOBALS['LANG'],
            $request,
            $request->getAttribute('api.scopes', []),
        );
        try {
            $result = $this->actionInvoker->invoke($this->action->id, (object)$arguments, $context, true, false);
            $location = $this->linkResolver->resolveLocation($this->action, $arguments, $result);
        } catch (SchemaValidationException $e) {
            return $this->problemResponseFactory->createErrorResponse(new InvalidRequestError(
                'The request contains invalid parameters',
                1793870604,
                array_map($this->createErrorOfArguments(...), $e->errors),
                $e,
            ));
        } catch (\InvalidArgumentException $e) {
            return $this->problemResponseFactory->createResponse(400, $e->getMessage());
        } catch (ActionExceptionInterface $e) {
            return $this->problemResponseFactory->createErrorResponse($e);
        }

        // Without Location, 201 would announce the request URI as the created resource (RFC 9110)
        $isCreated = $this->action->type === ActionType::create->value && $location !== null;
        $response = $result === null
            ? $this->responseFactory->createResponse($isCreated ? 201 : 204)
            : $this->jsonResponse($result, $isCreated ? 201 : 200);
        if ($location !== null) {
            if ($this->uriGenerator === null) {
                throw new \LogicException(sprintf('Action "%s" announces a location, which requires an URI generator', $id), 1793709242);
            }
            $response = $response->withHeader('Location', $this->uriGenerator->generate($location['action'], $location['arguments']));
        }
        return $response;
    }

    /**
     * @throws InvalidRequestError
     */
    private function mapArgumentsFromRequest(ServerRequestInterface $request): object
    {
        $arguments = new \stdClass();
        $errors = [];
        $requestBody = null;
        $routing = $request->getAttribute('routing');
        foreach ($this->action->parameters as $name => $parameter) {
            $value = null;
            $hasValue = false;
            $source = $parameter['http']['source'];
            $schema = $parameter['schema'];
            $jsonEncoded = false;
            if ($source === 'body') {
                $requestBody ??= $this->getJsonRequestBody($request);
                if (isset($requestBody->{$name})) {
                    $hasValue = true;
                    $value = $requestBody->{$name};
                }
            } elseif ($source === 'route') {
                if (isset($routing->getArguments()[$name])) {
                    $hasValue = true;
                    $value = $routing->getArguments()[$name];
                }
            } else {
                if (isset($request->getQueryParams()[$name])) {
                    $hasValue = true;
                    $value = $request->getQueryParams()[$name];
                    if ($parameter['http']['jsonEncoded']) {
                        try {
                            $value = json_decode($value, false, 512, JSON_THROW_ON_ERROR);
                        } catch (\JsonException $e) {
                            $errors[] = $this->createErrorOfParameter($name, '', 'Misformed JSON: ' . $e->getMessage());
                            continue;
                        }
                    }
                }
            }

            if (!$hasValue) {
                if (!$parameter['optional']) {
                    $errors[] = $this->createErrorOfParameter($name, '', 'Missing parameter value');
                }
                continue;
            }

            $schema = $this->actionRegistry->provideRefs($schema);

            $hydrator = new Hydrator();
            if (is_string($value)) {
                $value = $hydrator->coerceScalars($value, $schema);
            }
            $schema = $this->schemaNarrower->narrow($value, $schema);

            try {
                $this->actionInvoker->validate($value, $schema->toPlainObject());
            } catch (SchemaValidationException $e) {
                foreach ($e->errors as $error) {
                    $errors[] = $this->createErrorOfParameter($name, $error['pointer'], $error['detail']);
                }
                continue;
            }
            $arguments->{$name} = $value;
        }
        if ($errors !== []) {
            throw new InvalidRequestError('The request contains invalid parameters', 1793870606, $errors);
        }
        return $arguments;
    }

    /**
     * @param array{pointer: string, detail: string} $error Error with a pointer into the arguments
     * @return array<string, string>
     */
    private function createErrorOfArguments(array $error): array
    {
        $segments = explode('/', $error['pointer'], 3);
        $name = str_replace(['~1', '~0'], ['/', '~'], $segments[1] ?? '');
        return $this->createErrorOfParameter($name, isset($segments[2]) ? '/' . $segments[2] : '', $error['detail']);
    }

    /**
     * Refers to a value of the request body by JSON pointer, to other values by the name of the parameter
     *
     * @return array<string, string>
     */
    private function createErrorOfParameter(string $name, string $pointer, string $detail): array
    {
        if (($this->action->parameters[$name]['http']['source'] ?? null) === 'body') {
            return [
                'pointer' => '#/' . str_replace(['~', '/'], ['~0', '~1'], $name) . $pointer,
                'detail' => $detail,
            ];
        }
        return [
            'parameter' => $name,
            ...($pointer !== '' ? ['pointer' => '#' . $pointer] : []),
            'detail' => $detail,
        ];
    }

    /**
     * @throws InvalidRequestError
     */
    private function getJsonRequestBody(ServerRequestInterface $request): \stdClass
    {
        $bodyContent = null;
        if ($request->getHeaderLine('Content-Type') === 'application/json') {
            $body = (string)$request->getBody();
            try {
                $bodyContent = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException $e) {
                throw new InvalidRequestError('Misformed JSON in request body: ' . $e->getMessage(), 1793870605, [], $e);
            }
        }
        if (!$bodyContent instanceof \stdClass) {
            throw new InvalidRequestError('Invalid request body', 1766057432);
        }
        return $bodyContent;
    }

    /**
     * @param array{type: int, message: string, file: string, line: int}|null $error
     */
    private function respondToFatalError(?array $error): void
    {
        if ($error === null || !in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            return;
        }
        $this->logger->critical('Action {id} failed with a fatal error: {message} in {file}:{line}', [
            'id' => $this->action->id,
            'message' => $error['message'],
            'file' => $error['file'],
            'line' => $error['line'],
        ]);
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        // Errors that are displayed have already been sent along with the headers
        if (headers_sent()) {
            return;
        }
        $response = $this->createInternalErrorResponse();
        http_response_code($response->getStatusCode());
        header('Content-Type: ' . $response->getHeaderLine('Content-Type'));
        echo $response->getBody();
    }

    private function createInternalErrorResponse(): ResponseInterface
    {
        return $this->problemResponseFactory->createResponse(
            500,
            'The action failed, the error is logged with request ID ' . $this->requestId,
            ['requestId' => (string)$this->requestId],
        );
    }

    private function jsonResponse(mixed $data, int $status = 200): ResponseInterface
    {
        return $this->responseFactory
            ->createResponse($status)
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withBody(
                $this->streamFactory->createStream(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE))
            );
    }
}
