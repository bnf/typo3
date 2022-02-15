.. include:: ../../Includes.txt

===============================================================
Breaking: #96939 - Introduce Fluid Styled Content Css variables
===============================================================

See :issue:`96939`

Description
===========

The default CSS styling for fluid_styled_content has changed. It is now splitted
into seperate stylesheets, which will be only included, if the corresponding
content element is present. The default styling now also makes use of CSS
variables.

Affected Installations
======================

All installations, which have included the static TypoScript template
"Fluid Content Elements CSS (optional)".

Impact
======

CSS variables do not work in Internet Explorer 11.

If one has used the default fluid styled content styling in own html templates,
the styling might be missing now.

Migration
=========

If IE11 support is still necessary, the default CSS can be copied from an older
TYPO3 version. The static TypoScript can then be removed.

If you have HTML that depends on the styling to be globally available, include
`EXT:fluid_styled_content/Resources/Public/Css/global.css` via AssetCollector
in your layout.

.. index:: Frontend, ext:fluid_styled_content, NotScanned
