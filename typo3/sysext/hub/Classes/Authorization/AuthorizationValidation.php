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
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Security\JwtTrait;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Hub\Model\AccessToken;
use TYPO3\CMS\Hub\Model\Client;
use TYPO3\CMS\Hub\Repository\AccessTokenRepository;
use TYPO3\CMS\Hub\Repository\ClientRepository;
use TYPO3\CMS\Hub\Repository\ScopeRepository;
use TYPO3\CMS\Hub\Type\AppType;

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
            $tokenData = self::decodeJwt($jwt, self::createSigningKeyFromEncryptionKey(AccessToken::class));
            // NOTE: php-jwt will throw \UnexpectedValueException in case token is expired or not yet valid
            // @todo InvalidArgumentException|\DomainException can probably be removed
            // @todo2 only catch JWTExceptionWithPayloadInterface?
        } catch (\UnexpectedValueException|\InvalidArgumentException|\DomainException $exception) {
            throw OAuthServerException::accessDenied($exception->getMessage(), null, $exception);
        }

        if (!isset($tokenData->jti, $tokenData->aud, $tokenData->sub, $tokenData->scopes)) {
            throw OAuthServerException::accessDenied('Missing claims in JWT');
        }

        $uniqueIdentifier = $tokenData->jti;
        $audience = $tokenData->aud;
        $subject = $tokenData->sub;

        // Check if token has been revoked
        if ($this->accessTokenRepository->isAccessTokenRevoked($uniqueIdentifier)) {
            throw OAuthServerException::accessDenied('Access token has been revoked');
        }

        $client = $this->clientRepository->getClientEntity($audience);
        $token = new AccessToken();
        $token->setClient($client);

        $rawScopes = [];

        if ($tokenData->mode === 'oauth') {
            // Intersect with client scopes, since scopes may have been revoked
            // since the token was issued
            // @todo should such an update invalidate all access tokens instead? technically it is not required…
            $rawScopes = array_values(array_intersect($tokenData->scopes, $client->getScopes()));
            $token->mode = AppType::OAUTH;
            $token->setUserIdentifier($subject);
        } else { /* if ($tokenData->mode === AppType::STATIC) */
            if (!$this->isSecretValid($client, $tokenData->secret)) {
                throw OAuthServerException::accessDenied('Secret key is (no longer?) valid, please generate a new token');
            }

            $rawScopes = $client->getScopes();
            $token->mode = AppType::STATIC;
            $token->setUserIdentifier('be_users:' . (string)$client->getImpersonateUser());
        }

        $scopes = [];
        foreach ($rawScopes as $scope) {
            $instance = $this->scopeRepository->getScopeByIdentifier($scope);
            $token->addScope($instance);
            $scopes[$scope] = $instance->scope;
        }

        return $request
            ->withAttribute('api.access_token', $token)
            ->withAttribute('api.scopes', $scopes);
    }

    private function isSecretValid(Client $client, string $secret): bool
    {
        $hashInstance = GeneralUtility::makeInstance(PasswordHashFactory::class)->getDefaultHashInstance('BE');
        return $hashInstance->checkPassword($secret, $client->getSecret());
    }
}
