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

namespace TYPO3\CMS\Hub\Authorization;

use League\OAuth2\Server\AuthorizationValidators\AuthorizationValidatorInterface;
use League\OAuth2\Server\Exception\OAuthServerException;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Hub\Model\AccessToken;
use TYPO3\CMS\Hub\Repository\OAuth\AccessTokenRepository;
use TYPO3\CMS\Hub\Repository\OAuth\ClientRepository;
use TYPO3\CMS\Hub\Repository\OAuth\ScopeRepository;

final readonly class AuthorizationValidation implements AuthorizationValidatorInterface
{
    use JwtTrait;

    public function __construct(
        private AccessTokenRepository $accessTokenRepository,
        private ClientRepository $clientRepository,
        private ScopeRepository $scopeRepository,
    ) {}

    /**
     * Determine the access token in the authorization header and append OAuth
     * properties to the request as attributes.
     */
    public function validateAuthorization(ServerRequestInterface $request): ServerRequestInterface
    {
        if ($request->hasHeader('authorization') === false) {
            throw OAuthServerException::accessDenied('Missing "Authorization" header');
        }

        $header = $request->getHeader('authorization');
        $jwt = trim((string)preg_replace('/^\s*Bearer\s/i', '', $header[0]));

        if ($jwt === '') {
            throw OAuthServerException::accessDenied('Missing "Bearer" token');
        }

        try {
            $data = self::decodeJwt($jwt, self::createSigningKeyFromEncryptionKey(AccessToken::class));
        } catch (\InvalidArgumentException|\DomainException $exception) {
            throw OAuthServerException::accessDenied($exception->getMessage(), null, $exception);
        } catch (\UnexpectedValueException $exception) {
            throw OAuthServerException::accessDenied('Access token could not be verified', null, $exception);
        }

        if (!isset($data->jti, $data->aud, $data->sub, $data->scopes)) {
            var_dump($data);
            throw OAuthServerException::accessDenied('Missing claims in JWT');
        }

        $uniqueIdentifier = $data->jti;
        $audience = $data->aud;
        $subject = $data->sub;
        $scopes = $data->scopes;

        // Check if token has been revoked
        if ($this->accessTokenRepository->isAccessTokenRevoked($uniqueIdentifier)) {
            throw OAuthServerException::accessDenied('Access token has been revoked');
        }

        $client = $this->clientRepository->getClientEntity($audience);
        $token = new AccessToken();
        //$token->subject = $subject;
        $token->setClient($client);
        foreach ($scopes as $scope) {
            $token->addScope($this->scopeRepository->getScopeEntityByIdentifier($scope));
        }
        $token->setUserIdentifier($subject);

        if ($data->mode === 'static') {
            $token->secret = $data->secret;
            $token->mode = 'static';
        }

        return $request->withAttribute('api.access_token', $token);

        /*
        // Return the request with additional attributes
        return $request
            ->withAttribute('oauth_access_token_id', $uniqueIdentifier)
            ->withAttribute('oauth_client_id', $audience)
            ->withAttribute('oauth_user_id', $subject)
            ->withAttribute('oauth_scopes', $scopes);
         */
    }
}
