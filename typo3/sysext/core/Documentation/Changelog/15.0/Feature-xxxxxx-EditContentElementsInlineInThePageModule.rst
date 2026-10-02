..  include:: /Includes.rst.txt

..  _feature-xxxxxx-1791021600:

==================================================================
Feature: #xxxxxx - Edit content elements inline in the page module
==================================================================

See :issue:`xxxxxx`

Description
===========

Content elements can now be edited directly within the
:guilabel:`Content > Layout` module. Clicking the edit button of a content
element or its linked title in the preview, or double-clicking the preview,
turns the preview into a reduced edit form containing the most relevant fields
of the element. Editors stay in the context of the page and see the
surrounding content while editing.

Changes are saved without leaving the page module: :guilabel:`Save` stores
the record, closes the form and refreshes only the edited content element.
The keyboard shortcut :kbd:`Ctrl` + :kbd:`S` saves and keeps the form open.
:guilabel:`Discard`, the :kbd:`Escape` key and another click on the edit
button close the form; unsaved changes have to be confirmed first. The action
:guilabel:`Open full editing view` continues editing with all fields of the
record in the contextual edit sheet, or in the full editing view if the
contextual edit sheet is disabled in the user settings.

The fields offered for inline editing are configured via page TSconfig. The
default configuration is:

..  code-block:: typoscript
    :caption: EXT:my_sitepackage/Configuration/page.tsconfig

    mod.web_layout.inlineEditing {
      enabled = 1
      fields {
        default = header, subheader, bodytext, assets, image, media
      }
    }

:typoscript:`fields.default`
    Comma-separated list of fields offered for all content types.

:typoscript:`fields.<CType>`
    Comma-separated list of fields for a specific content type, replacing
    :typoscript:`fields.default`, for example:

    ..  code-block:: typoscript

        mod.web_layout.inlineEditing.fields.textmedia = header, assets

:typoscript:`enabled`
    Set to :typoscript:`0` to disable inline editing.

Only fields that are part of the content type, that the editor has access to
and that are not disabled via :typoscript:`TCEFORM` are rendered.

Impact
======

The edit button of a content element in the page module opens the inline edit
form by default, regardless of whether the contextual edit sheet is disabled in
the user settings. Content elements without any field to be rendered inline
are still edited in the contextual edit sheet.

..  index:: Backend, TSConfig, ext:backend
