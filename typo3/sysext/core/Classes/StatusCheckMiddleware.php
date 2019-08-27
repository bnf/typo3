<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core;

use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class StatusCheckMiddleware implements MiddlewareInterface
{
    /** @var ResponseFactory */
    private $responseFactory;

    /** @var RequestFactory */
    private $requestFactory;

    /** @var ClientInterface */
    private $client;

    public function __construct(
        ResponseFactoryInterface $responseFactory,
        RequestFactoryInterface $requestFactory,
        ClientInterface $client
    ) {
        $this->responseFactory = $responseFactory;
        $this->requestFactory = $requestFactory;
        $this->client = $client;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($request->getRequestTarget() === '/check') {
            $res = $this->client->sendRequest(
                $this->requestFactory->createRequest('GET', 'https://www.qbus.de/internal/mittwald-accounts.json')
            );
            $content = json_decode((string)$res->getBody());
            $data = [
                'status' => 'ok',
                'content' => $content,
            ];
            $response = $this->responseFactory->createResponse()
                ->withHeader('Content-Type', 'application/json; charset=utf-8');
            $response->getBody()->write(json_encode($data));
            return $response;
        }
        return $handler->handle($request);
    }
}
