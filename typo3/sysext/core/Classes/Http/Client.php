<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Http;

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

use GuzzleHttp\ClientInterface as GuzzleClientInterface;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\RequestOptions;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Client\NetworkExceptionInterface;
use Psr\Http\Client\RequestExceptionInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

/**
 * PSR-18 adapter for Guzzle\ClientInterface
 *
 * @internal
 */
class Client implements ClientInterface
{
    /**
     * @var GuzzleClientInterface
     */
    private $guzzle;

    public function __construct(GuzzleClientInterface $guzzle)
    {
        $this->guzzle = $guzzle;
    }

    /**
     * Sends a PSR-7 request and returns a PSR-7 response.
     *
     * @param RequestInterface $request
     * @return ResponseInterface
     * @throws ClientExceptionInterface If an error happens while processing the request.
     */
    public function sendRequest(RequestInterface $request): ResponseInterface
    {
        try {
            return $this->guzzle->send($request, [
                RequestOptions::HTTP_ERRORS => false,
                RequestOptions::ALLOW_REDIRECTS => false,
            ]);
        } catch (RequestException $e) {
            throw new class($e->getMessage(), $e->getRequest(), null, $e) extends RequestException implements RequestExceptionInterface {
            };
        } catch (ConnectException $e) {
            throw new class($e->getMessage(), $e->getRequest(), null, $e) extends ConnectException implements NetworkExceptionInterface {
            };
        } catch (GuzzleException $e) {
            throw new class($e->getMessage(), 1566909448, $e) extends \RuntimeException implements ClientExceptionInterface {
            };
        }
    }
}
