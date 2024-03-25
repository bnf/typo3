.. include:: /Includes.rst.txt

.. _feature-103437-1712062105:

======================================
Feature: #103437 - Introduce Site Sets
======================================

See :issue:`103437`

Description
===========

Sets are intended to ship settings, TypoScript, TSConfig, Templates and
enabled Content Elements. They are composed of sub-sets and can be applied
to sites.

Sites with sets behave similar to TypoScript `sys_template` records that are
marked with `root` and `clear` flags. That means sites implictly form a
TypoScript root record that delivers TypoScript from the activated site sets.

Extensions can provide multiple sets in order to ship presets for different
sites or subsets (think of frameworks) where selected features are exposed
as a subset (example: `typo3/seo-xml-sitemap`).

Set Definition
--------------

A set is defined in an extensions subfolder in
:file:`EXT:my_extension/Configuration/Sets/MySet/config.yaml`.

The folder name in :file:`Configuration/Sets/` is arbitrary, significant
is the `name` defined in :file:`config.yaml`. The `name` used a `vendor/name`
scheme by convention, and *should* use the same vendor as the extension. It may
differ if needed for compatibility reasons (e.g. when sets are moved to
other extensions).


..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Sets/MySet/config.yaml

    name: my-vendor/my-set
    version: 1
    label: My Set

    # Load TypoScript, TSconfig and settings from dependencies
    dependencies:
      - typo3/fluid-styled-content
      - typo3/felogin
      - typo3/seo-xml-sitemap

    # Load local TypoScript from a sepcific folder (instead of loading
    # setup.typoscript and constants.typoscript from the set folder)
    typoscript: EXT:my_extension/Configuration/TypoScript

    # Load Page TSconfig from a defined file
    # (instead of page.tsconfig from the set folder, if available)
    pagets: EXT:my_extension/Configuration/TSconfig/legacy-file.tsconfig


Settings Definitions
--------------------

Set settings definitions are placed in a :file:`settings.definitions.yaml`
next to the set file :file:`config.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Sets/MySet/settings.definitions.yaml

    version: 1
    settings:
      foo.bar.baz:
        label: 'My example baz setting'
        description: 'Configure baz to be used in bar'
        type: int
        default: 5


Settings for subsets
--------------------

Settings for subsets (e.g. to configure settings in declared dependencies)
can be shipped via :file:`settings.yaml` when placed next to the set file
:file:`config.yaml`.

Note that default values for settings provided by the set do not need to be
defined here, as defaults are to be provided within
:file:`settings.definitions.yaml`)

Here is an example where the setting `styles.content.defaultHeaderType` — as
provided by `typo3/fluid-styled-content` — is configured via
:file:`settings.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Sets/MySet/settings.yaml

    styles:
      content:
        defaultHeaderType: 1


This setting will be exposed as site setting whenever the set
`my-vendor/my-set` is applied to a site config.


Set TypoScript
------------------

Set level TypoScript can be shipped within a set. The files
:file:`setup.typoscript` and :file:`constants.typoscript` (placed next to the
:file:`config.yaml` file) will be loaded (if available).
They are inserted (similar to `static_file_include`) into the TypoScript chain
of the site TypoScript that will be defined by a site that is using sets.

In contrast to `static_file_include` dependencies are to be included via
(recursive) sets. This mechanism supersedes the previous
static_file_include's and manual `@import` statements as sets are
automatically ordered and deduplicated. That means TypoScript will not be loaded
multiple times, if a shared dependency is loaded by multiple sets.

Note that `@import` statements are still fine to be used for local included, but
should be avoided for cross-set/extensions dependencies.


Set Page TSconfig
---------------------

Set Page TSConfig is loaded from :file:`page.tsconfig` if placed next to
the :file:`config.yaml` file. An alternative filename can be provided in
set configuration `pagets`:

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/MySet/config.yaml

    name: my-vendor/my-set
    version: 1

    # Load Page TSconfig from a defined file
    # (instead of page.tsconfig from the set folder, if available)
    pagets: EXT:my_extension/Configuration/TSconfig/legacy-file.tsconfig


Impact
======

Sites can be composed of sets where relevant configuration, assets and
setting definitions are combined in a central place and applied to sites as one
logical volume.

Sets have dependency management and therefore allow sharing code between
multiple TYPO3 sites and extensions in a flexible way.


.. index:: Backend, Frontend, PHP-API, TSConfig, TypoScript, YAML, ext:core
