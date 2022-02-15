.. include:: ../../Includes.txt

==============================================================
Feature: #96939 - Introduce Fluid Styled Content Css variables
==============================================================

See :issue:`96939`

Description
===========

The system extension fluid_styled_content now includes the following TypoScript
styling options as Css variables in the frontend:

*  :typoscript:`styles.content.textmedia.borderWidth` -> :css:`--fsc-textmedia-border-width`
*  :typoscript:`styles.content.textmedia.borderColor` -> :css:`--fsc-textmedia-border-color`
*  :typoscript:`styles.content.textmedia.borderPadding` -> :css:`--fsc-textmedia-border-padding`
*  :typoscript:`styles.content.textmedia.textMargin` -> :css:`--fsc-textmedia-text-margin`
*  :typoscript:`styles.content.textmedia.columnSpacing` -> :css:`--fsc-textmedia-column-spacing`
*  :typoscript:`styles.content.textmedia.rowSpacing` -> :css:`--fsc-textmedia-row-spacing`

The default fluid styled content stylesheets make use of these variables. Note,
that these styles are only included, if the optional TypoScript template
"Fluid Content Elements CSS (optional)" is included in the static includes.

Scss files
----------

The system extension fluid_styled_content now comes with source scss files for
its default styling. It is possible to include them in your own build process
by importing them via scss imports or simply copying them:

*  `typo3/sysext/fluid_styled_content/Build/Scss/gallery.scss`
*  `typo3/sysext/fluid_styled_content/Build/Scss/global.scss`
*  `typo3/sysext/fluid_styled_content/Build/Scss/headline.scss`
*  `typo3/sysext/fluid_styled_content/Build/Scss/table.scss`
*  `typo3/sysext/fluid_styled_content/Build/Scss/uploads.scss`

These should create seperate CSS files with the same name. For example
gallery.scss -> gallery.css. Do not merge them into one file! Then
define the path to your CSS folder with the new TypoScript constant:

:typoscript:`styles.content.cssPath`

By default `EXT:fluid_styled_content/Resources/Public/Css` is used. There should
be **no** trailing slash.

Impact
======

The default CSS output for fluid_styled_content has changed. It now makes use of
CSS variables for its styling options. Stylesheets are added by the
AssetCollector on a per-element basis. Integrators may make use of the new CSS
variables for their own stylesheets. They can also provide an own path for the
CSS stylesheets, which then will be used instead. Scss files can be found in the
Build folder of the system extension fluid_styled_content, which can be imported
or copied for usage in own build processes.

.. index:: Frontend, ext:fluid_styled_content
