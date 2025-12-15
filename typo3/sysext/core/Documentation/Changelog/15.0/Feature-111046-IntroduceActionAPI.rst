..  include:: /Includes.rst.txt

..  _feature-111046-1791975433:

=======================================
Feature: #111046 - Introduce Action API
=======================================

See :issue:`111046`

Description
===========

TYPO3 Core provides a new Action API: a typed RPC mechanism that allows
remote systems – for example JavaScript in the backend, HTTP API or
AI agents – to invoke functionality of TYPO3 and its extensions.

A public method of a service becomes an action by adding the PHP
attribute :php:`\TYPO3\CMS\Core\Attribute\AsAction`. The JSON
Schema of its parameters and of its return value is derived from the
method signature, including PHPDoc types like :php:`list<string>` or
array shapes, when the dependency injection container is compiled.
Incoming arguments are validated and hydrated based on that schema, and
the result of the action is validated against it, too.

..  code-block:: php
    :caption: EXT:my_extension/Classes/Action/PageTitleAction.php

    use TYPO3\CMS\Core\Action\ActionContext;
    use TYPO3\CMS\Core\Action\ActionType;
    use TYPO3\CMS\Core\Action\Error\NotFoundError;
    use TYPO3\CMS\Core\Attribute\AsAction;
    use TYPO3\CMS\Backend\Scope\ContentReadScope;

    final readonly class PageTitleAction
    {
        /**
         * @return list<string>
         * @throws NotFoundError if the page does not exist
         */
        #[AsAction(
            type: ActionType::fetch,
            name: 'my-extension/page/{uid}/titles',
            summary: 'Fetch the titles of a page and its translations',
            scopes: [ContentReadScope::class],
        )]
        public function titles(int $uid, ActionContext $context): array
        {
            // …
            throw new NotFoundError('Page not found', 1791975434);
        }
    }

The attribute accepts the following arguments:

:php:`type`
    An :php:`\TYPO3\CMS\Core\Action\ActionType`: :php:`fetch`
    (default), :php:`create`, :php:`replace`, :php:`update`,
    :php:`delete` or :php:`dispatch`. It defines the HTTP method the
    action is exposed with (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`,
    `POST`).

:php:`name`
    The identifier of the action, which is also used as route path
    unless :php:`route` is given. Placeholders like `{uid}` are filled
    from the parameter of the same name.

:php:`summary`, :php:`description`, :php:`tag`
    Human readable information describing the action.

:php:`route`
    An optional route path, differing from :php:`name`.

:php:`scopes`
    A list of scope classes the caller must be granted to invoke the
    action.

A parameter of type :php:`\TYPO3\CMS\Core\Action\ActionContext` is
not part of the public schema. It is passed in automatically and
provides the TYPO3 :php:`Context`, the authenticated user, a translator,
the current request and the granted scopes.

Actions report errors by throwing an exception implementing
:php:`\TYPO3\CMS\Core\Action\ActionExceptionInterface`, which
defines the HTTP status code of the response. TYPO3 Core ships
:php:`\TYPO3\CMS\Core\Action\Error\NotFoundError` (404) and
:php:`\TYPO3\CMS\Core\Action\Error\PermissionDeniedError` (403).

Every error an action may report must be declared with a :php:`@throws`
annotation on the action method. The errors are read when the dependency
injection container is compiled and are part of the description of the
action.

Scopes
------

Scopes grant coarse access to groups of actions. A scope implements
:php:`\TYPO3\CMS\Core\Scope\ScopeInterface` and is registered with
its identifier via Symfony's :php:`#[AsTaggedItem]` attribute. TYPO3 Core
ships the scopes `content:read` and `content:write` by default.

..  code-block:: php
    :caption: EXT:my_extension/Classes/Scope/NewsReadScope.php

    use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
    use TYPO3\CMS\Core\Scope\ScopeInterface;
    use TYPO3\CMS\Core\Scope\ScopeUser;

    #[AsTaggedItem(index: 'my-extension:news:read')]
    final class NewsReadScope implements ScopeInterface
    {
        public function getName(): string
        {
            return 'Read access to news';
        }

        public function getDescription(): string
        {
            return 'Read news records.';
        }

        public function getIcon(): string
        {
            return 'content-news';
        }

        public function allowedForUser(ScopeUser $user): bool
        {
            return true;
        }
    }

Backend endpoints
-----------------

All actions are available as JSON endpoints in the TYPO3 backend below
`/typo3/api/`, for example `GET /typo3/api/my-extension/page/42/titles`.
Requests have to be authenticated with a bearer token bound to the
logged-in backend user. Request bodies of `POST`, `PUT` and `PATCH`
requests must be sent as `application/json`.

The JavaScript module :js:`@typo3/core/action/request` adds the token
automatically:

..  code-block:: javascript

    import { action } from '@typo3/core/action/request.js';

    const response = await action('/my-extension/page/{uid}/titles', { uid: '42' }).get();
    const titles = await response.resolve();

Impact
======

Extensions can provide self-describing actions with validated input and
output by adding the :php:`#[AsAction]` attribute to service methods,
and call them from backend JavaScript via
:js:`@typo3/core/action/request`. The JSON Schema descriptions are the
foundation for exposing actions via OpenAPI and MCP in the future.

..  index:: Backend, JavaScript, PHP-API, NotScanned, ext:core, ext:backend
