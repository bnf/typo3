.. include:: /Includes.rst.txt

.. _feature-103437-1712062105:

=====================================================
Feature: #103437 - Introduce Site Profiles & Settings
=====================================================

See :issue:`103437`

Description
===========

Profiles are intended to ship settings, TypoScript, TSConfig, Templates and
enabled Content Elements. They are composed of sub-profiles and can be applied
to sites.

Sites with profiles behave similar to TypoScript `sys_template` records that are
marked with `root` and `clear` flags. That means sites implictly form a
TypoScript root record that delivers TypoScript from the activated site profiles.

Extensions can provide multiple profiles in order to ship presets for different
sites or subprofiles (think of frameworks) where selected features are exposed
as a subprofile (example: `typo3/seo-xml-sitemap`).

Profile Definition
------------------

A profile is defined in an extensions subfolder in
:file:`EXT:my_extension/Configuration/Profiles/MyProfile/profile.yaml`.

The folder name in :file:`Configuration/Profiles/` is arbitrary, significant
is the `name` defined in :file:`profile.yaml`. The `name` used a `vendor/name`
scheme by convention, and *should* use the same vendor as the extension. It may
differ if needed for compatibility reasons (e.g. when profiles are moved to
other extensions).


..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Profiles/MyProfile/profile.yaml

    name: my-vendor/my-profile
    version: 1
    label: My Profile

    # Load TypoScript, TSconfig and settings from dependencies
    dependencies:
      - typo3/fluid-styled-content
      - typo3/felogin
      - typo3/seo-xml-sitemap

    # Load local TypoScript from a sepcific folder (instead of loading
    # setup.typoscript and constants.typoscript from the profile folder)
    typoscript: EXT:my_extension/Configuration/TypoScript


Profile Settings Definitions
----------------------------

Profile settings definitions are placed in a :file:`settings.definitions.yaml`
next to the profile file :file:`profile.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Profiles/MyProfile/settings.definitions.yaml

    version: 1
    settings:
      foo.bar.baz:
        label: 'My example baz setting'
        description: 'Configure baz to be used in bar'
        type: int
        default: 5


Profile Settings
----------------

Settings for subprofiles (e.g. to configure settings in declared dependencies)
can be shipped via :file:`settings.yaml` when placed next to the profile file
:file:`profile.yaml`.

Note that default values for settings provided by the profile do not need to be
defined here, as defaults are to be provided within
:file:`settings.definitions.yaml`)

Here is an example where the setting `styles.content.defaultHeaderType` — as
provided by `typo3/fluid-styled-content` — is configured via
:file:`settings.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/Profiles/MyProfile/settings.yaml

    styles:
      content:
        defaultHeaderType: 1


This setting will be exposed as site setting whenever the profile
`my-vendor/my-profile` is applied to a site config.


Profile TypoScript
------------------

Profile level TypoScript can be shipped within a profile. The files
:file:`setup.typoscript` and :file:`constants.typoscript` (placed next to the
:file:`profile.yaml` file) will be loaded (if available).
They are inserted (similar to `static_file_include`) into the TypoScript chain
of the site TypoScript that will be defined by a site that is using profiles.

In contrast to `static_file_include` dependencies are to be included via
(recursive) profiles. This mechanism supersedes the previous
static_file_include's and manual `@import` statements as profiles are
automatically ordered and deduplicated. That means TypoScript will not be loaded
multiple times, if a shared dependency is loaded by multiple profiles.

Note that `@import` statements are still fine to be used for local included, but
should be avoided for cross-profile/extensions dependencies.


Impact
======

Sites can be composed of profiles where relevant configuration, assets and
setting definitions are combined in a central place and applied to sites as one
logical volume.

Profiles have dependency management and therefore allow sharing code between
multiple TYPO3 sites and extensions in a flexible way.


.. index:: Backend, Frontend, PHP-API, TSConfig, TypoScript, YAML, ext:core
