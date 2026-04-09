..  include:: /Includes.rst.txt

..  _feature-111047-1791976157:

===============================================================
Feature: #111047 - Provide API access for external applications
===============================================================

See :issue:`111047`

Description
===========

The new system extension `typo3/cms-hub` provides access to
the :ref:`Action API <feature-111046-1791975433>` for external
applications like scripts, integrations, MCP clients or AI agents,
without a backend session.

External applications are configured as "apps" (database table
:sql:`sys_app`) in the new backend module
:guilabel:`System > Integrations > Hub`, which is available to
administrators. Two types of apps are supported:

Static token
    The app acts on behalf of a backend user selected in the app record
    and is granted the scopes selected in the app record. An
    administrator generates a static bearer token in the app record. The
    token is valid until the app is disabled or its secret is changed.

OAuth
    The app uses the OAuth 2.0 authorization code flow including refresh
    tokens, implemented with :composer:`league/oauth2-server`. A backend
    user grants the app access to the requested scopes on a consent
    screen at `/typo3/oauth/authorize` and the app retrieves its tokens
    from `/typo3/oauth/token`. Actions are executed on behalf of the
    granting backend user.

Requests to Action API endpoints below `/typo3/api/` that do not carry a
backend session cookie are authenticated with the token passed in the
`Authorization` header:

..  code-block:: bash

    curl -H 'Authorization: Bearer <token>' \
        https://example.org/typo3/api/my-extension/page/42/titles

Clients can discover the OAuth endpoints and the supported scopes via the
OAuth 2.0 Authorization Server Metadata
(`RFC 8414 <https://datatracker.ietf.org/doc/html/rfc8414>`__), available
at `/.well-known/oauth-authorization-server`.

Impact
======

Administrators can grant external applications access to the Action API
in the context of a backend user, restricted to selected scopes, either
with a static token or via OAuth 2.0. All actions provided by TYPO3 Core
and extensions become available to these applications.

..  index:: Backend, Database, PHP-API, NotScanned, ext:hub
