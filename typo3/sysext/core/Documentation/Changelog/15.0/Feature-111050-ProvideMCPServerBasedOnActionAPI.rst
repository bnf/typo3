..  include:: /Includes.rst.txt

..  _feature-111050-1791977541:

=========================================================
Feature: #111050 - Provide MCP server based on Action API
=========================================================

See :issue:`111050`

Description
===========

TYPO3 Core provides a server for the
`Model Context Protocol (MCP) <https://modelcontextprotocol.io/>`__,
which AI clients and agents use to discover and call tools of external
systems.

The MCP server exposes all actions of the
:ref:`Action API <feature-111046-1791975433>` as MCP tools. Each tool is
described with title, description, input and output JSON Schema and
the hints `readOnlyHint`, `destructiveHint` and `idempotentHint`, derived
from the type of the action. Only tools whose scopes are granted to the
caller are listed and can be called. The MCP methods `initialize`,
`tools/list` and `tools/call` are supported.

Availability via EXT:hub
------------------------

The MCP server is not a separate endpoint: it is implemented as an
action itself and therefore available as Action API route at
`POST /typo3/api/mcp`, requiring the new scope `mcp`.

External MCP clients reach this route through the system extension
`typo3/cms-hub` (see :ref:`feature-111047-1791976157`), which
provides the OAuth 2.0 authorization server for the Action API:

*   MCP clients discover the authorization server via
    `/.well-known/oauth-authorization-server`.
*   A backend user grants the MCP client access on the OAuth consent
    screen, including the scope `mcp` and the scopes of the tools the
    client may use.
*   The MCP client calls `/typo3/api/mcp` with the issued access token
    and acts on behalf of that backend user.

Alternatively, an administrator can create a static token app in
:guilabel:`System > Integrations > Hub` and configure the token in the
MCP client.

Without EXT:hub, the MCP route is only accessible within a backend
session.

Local usage via stdio
---------------------

For MCP clients running on the same machine, the CLI command
`mcp:serve` serves MCP over standard input and output. By default, the
server acts as the CLI backend user `_cli_`. The option `--user` selects
another backend user by username, whose permissions and scopes then
apply to all tool calls. The command fails if the user does not exist or
is disabled.

..  code-block:: json
    :caption: Example MCP client configuration using stdio

    {
        "mcpServers": {
            "typo3": {
                "command": "vendor/bin/typo3",
                "args": ["mcp:serve", "--user=editor"]
            }
        }
    }

Impact
======

With `typo3/cms-hub` installed, MCP clients can connect to
TYPO3 via OAuth 2.0 and use every functionality provided as action –
by TYPO3 Core or by extensions via :php:`#[AsAction]` – without
additional integration code.

..  index:: CLI, PHP-API, NotScanned, ext:core, ext:hub
