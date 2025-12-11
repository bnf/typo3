..  include:: /Includes.rst.txt

..  _feature-111264-1793187788:

=========================================
Feature: #111264 - Provide Record Actions
=========================================

See :issue:`111264`

Description
===========

The :ref:`Action API <feature-111046-1791975433>` provides actions to
read and modify records of all tables described by TCA. They are
available as HTTP endpoints below `/typo3/api/` and as MCP tools.

`GET /typo3/api/records/{schema}`
    Lists the records of a table: `uid`, `pid`, label, record type,
    visibility and language of each record. The list can be narrowed by
    `search` (label field), `pid`, `type` (e.g. the `CType` of
    `tt_content`) and `language`, and is paginated with `limit` and
    `cursor`, which takes the `next` value of the previous page.

`GET /typo3/api/records/{schema}/{identifier}`
    Fetches a record by its uid, with all fields the user may read.

`POST /typo3/api/records/{schema}/{pid}`
    Creates a record on the given page, including inline children.

`PATCH /typo3/api/records/{schema}/{identifier}`
    Updates a record. Only the given fields are changed.

`DELETE /typo3/api/records/{schema}/{identifier}`
    Deletes a record.

..  code-block:: shell
    :caption: Change the header of a content element

    curl -X PATCH 'https://example.com/typo3/api/records/tt_content/42' \
        -H 'Authorization: Bearer <token>' \
        -H 'Content-Type: application/json' \
        -d '{"record": {"_schema": "tt_content", "header": "New header"}}'

The input and output of each action is described by a JSON Schema that
is derived from TCA per table and record type, for example only the
fields of the content type `text` for a `tt_content` record of that
type. Relations are represented as references with `_schema` and `uid`,
system properties like language and workspace version are grouped in
`_system`. The OpenAPI document and the MCP tools carry these schemas,
so that clients know which fields a record has.

Permissions
-----------

The actions act on behalf of the authenticated backend user. Reading
respects the table, field and page permissions of the user. Records are
written through the :php:`DataHandler`, which applies all of its
permission checks.

The actions require the scopes `content:read` and, for creating,
updating and deleting records, `content:write`. These scopes are
only granted to backend users that may access one of the backend
modules :guilabel:`Content > Layout`, :guilabel:`Content > Records` or
:guilabel:`Media`. `content:write` additionally requires modify
permission for a table, or file permissions together with access to
:guilabel:`Media`.

The classes
:php:`\TYPO3\CMS\Backend\Scope\ContentReadScope` and
:php:`\TYPO3\CMS\Backend\Scope\ContentWriteScope` are provided by
EXT:backend.

Workspaces
----------

All record actions accept the query parameter `workspace`, which
selects the workspace of that request, for example `?workspace=0` for
the live workspace. It defaults to the current workspace of the user,
and fails with `403` if the user has no access to the given workspace.
The stored workspace of the user is not changed.

Impact
======

Remote systems, JavaScript in the backend and AI agents can read and
modify records of TYPO3 Core and of extensions without additional
integration code, in the permission boundaries of the backend user.

..  index:: Backend, PHP-API, NotScanned, ext:backend
