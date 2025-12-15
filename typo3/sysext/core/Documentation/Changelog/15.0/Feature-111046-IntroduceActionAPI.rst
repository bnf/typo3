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
            route: 'my-extension/page/{uid}/titles',
            type: ActionType::fetch,
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

:php:`route`
    The route path of the action. Placeholders like `{uid}` are filled
    from the parameter of the same name. Actions of different type or
    version may share a route.

:php:`type`
    An :php:`\TYPO3\CMS\Core\Action\ActionType`: :php:`fetch`
    (default), :php:`create`, :php:`replace`, :php:`update`,
    :php:`delete` or :php:`dispatch`. It defines the HTTP method the
    action is exposed with (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`,
    `POST`).

:php:`id`
    The identifier of the action, which names it in the OpenAPI
    specification (`operationId`) and as tool for AI agents. If omitted,
    it is derived from type, route and version, e.g.
    `fetch_my_extension_page_by_uid_titles`, with a suffix like `_v2`
    from version 2 on. An identifier starts with a letter, consists of
    letters, digits, `_` and `-` and is at most 64 characters long. It
    can be set explicitly to keep it stable when the route changes, or
    if the derived identifier is too long.

:php:`summary`, :php:`description`, :php:`tag`
    Human readable information describing the action.

:php:`scopes`
    A list of scope classes the caller must be granted to invoke the
    action.

:php:`version`
    The version of the action (default `1`), which prefixes the route
    path, e.g. `v1/my-extension/page/{uid}/titles`. Every action is
    versioned on its own: an incompatible change is provided as a new
    version of the same :php:`route`, while the previous version stays
    available. :php:`null` exposes the action without version prefix,
    which is meant for protocol endpoints only.

:php:`deprecated`
    The unix timestamp of the deprecation of the action. Deprecated
    actions announce the date in the `Deprecation` HTTP response header
    (RFC 9745) and are marked as deprecated in their description.

:php:`targets`
    The channels through which the action is offered, a list of
    :php:`\TYPO3\CMS\Core\Action\Target` cases: :php:`backend`
    (backend user interface, authenticated by the session of the
    backend user) and :php:`http` (HTTP API for external applications,
    authenticated by access tokens, part of the OpenAPI specification).
    By default, an action is offered through all targets. Actions
    specific to the backend user interface, like setting a temporary
    mount point of the page tree, are restricted to
    :php:`[Target::backend]`.

:php:`location`
    A :php:`\TYPO3\CMS\Core\Action\Link` to the action providing the
    resource created by an action of type :php:`create`, referenced by
    its class and method name. Its parameters
    are runtime expressions as known from OpenAPI link objects:
    `$request.path.<name>`, `$request.query.<name>` and
    `$request.body#/<name>` refer to arguments of the action,
    `$response.body#/<pointer>` to a value of its result. The URL of the
    created resource is announced in the `Location` HTTP response header.

    ..  code-block:: php

        #[AsAction(
            route: 'my-extension/news',
            type: ActionType::create,
            location: new Link([NewsActions::class, 'show'], [
                'uid' => '$response.body#/news/uid',
            ]),
        )]

A parameter of type :php:`\TYPO3\CMS\Core\Action\ActionContext` is
not part of the public schema. It is passed in automatically and
provides the TYPO3 :php:`Context`, the authenticated user, a translator,
the current request and the granted scopes.

Actions report errors by throwing an exception implementing
:php:`\TYPO3\CMS\Core\Action\ActionExceptionInterface`, which
defines the HTTP status code of the response. TYPO3 Core ships
:php:`\TYPO3\CMS\Core\Action\Error\NotFoundError` (404),
:php:`\TYPO3\CMS\Core\Action\Error\PermissionDeniedError` (403),
:php:`\TYPO3\CMS\Core\Action\Error\InsufficientScopeError` (403) and
:php:`\TYPO3\CMS\Core\Action\Error\InvalidRequestError` (400).
:php:`InsufficientScopeError` reports a scope that is required for the
accessed data, like a specific record, in addition to the scopes of the
action. The scope is announced in the `WWW-Authenticate` header (RFC 6750).

Errors are answered as problem details (`application/problem+json`, see
RFC 9457) with the message of the exception as `detail`. The problem `type`
is the URL of the exception code in the TYPO3 exception reference, for
example `https://typo3.org/go/exception/CMS/1791975434`, which makes the
exception code of an action error part of its API. Invalid parameters
of a request are listed in the member `errors`, each with a `detail` and
the JSON `pointer` into the request body or the name of the `parameter`.
Other exceptions are logged and answered with status 500 and the ID of the
request, without revealing internal details.

Every error an action may report must be declared with a :php:`@throws`
annotation on the action method. The errors are read when the dependency
injection container is compiled and are part of the description of the
action.

Scopes
------

Scopes grant coarse access to groups of actions. A scope implements
:php:`\TYPO3\CMS\Core\Scope\ScopeInterface` and is registered with
its identifier via Symfony's :php:`#[AsTaggedItem]` attribute. TYPO3 Core
ships the scopes `content:read` and `content:write` by default, and the
scope `admin` for administrative tasks, which is only granted to
administrators.

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
`/typo3/api/`, prefixed by their version, for example
`GET /typo3/api/v1/my-extension/page/42/titles`.
Requests have to be authenticated with a bearer token bound to the
logged-in backend user. Request bodies of `POST`, `PUT` and `PATCH`
requests must be sent as `application/json`.

Successful requests are answered with status `200` and the result as
JSON, or with `204` if the action returns nothing. Actions of type
:php:`create` that declare a :php:`location` are answered with `201`
and the `Location` header.

The JavaScript module :js:`@typo3/core/action/request` adds the token
automatically:

..  code-block:: javascript

    import { action } from '@typo3/core/action/request.js';

    const response = await action('/v1/my-extension/page/{uid}/titles', { uid: '42' }).get();
    const titles = await response.resolve();

Impact
======

Extensions can provide self-describing actions with validated input and
output by adding the :php:`#[AsAction]` attribute to service methods,
and call them from backend JavaScript via
:js:`@typo3/core/action/request`. The JSON Schema descriptions are the
foundation for exposing actions via OpenAPI and MCP in the future.

..  index:: Backend, JavaScript, PHP-API, NotScanned, ext:core, ext:backend
