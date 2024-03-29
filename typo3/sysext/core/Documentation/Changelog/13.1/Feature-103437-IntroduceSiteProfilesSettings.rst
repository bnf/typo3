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

Profiles create a new rendering context and behave similar to TypoScript
`sys_template` records that are marked with `root` and `clear` flags.

Extensions can provide multiple profiles in order to ship presets for different
sites or subprofiles (think of frameworks) where selected features are exposed
as a subprofile (example: `typo3/seo-xml-sitemap`).

Profile Definition
------------------

A profile is defined in an extensions subfolder
:file:`EXT:my_extension/Configuration/MyProfile/profile.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/MyProfile/profile.yaml

    name: my-vendor/my-profile
    version: 1
    label: My Profile

    # Load TypoScript, TSconfig and settings from dependencies
    dependencies:
      - typo3/fluid-styled-content
      - typo3/felogin
      - typo3/seo-xml-sitemap


Profile Settings Definitions
----------------------------

Profile settings definitions are placed in a :file:`settings.definitions.yaml`
next to the profile file :file:`profile.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/MyProfile/settings.definitions.yaml

    version: 1
    settings:
      foo.bar.baz:
        label: 'My example baz setting'
        description: 'Configure baz to be used in bar'
        type: int
        default: 5


Profile Settings
----------------

Default settings (e.g. to configure settings in declared dependencies) can
be shipped via :file:`settings.yaml` when placed next to the profile file
:file:`profile.yaml`.

(Note that default values do not need to be defined here, as defaults are to be
provided within :file:`settings.definitions.yaml`)

Here is an example where the setting `styles.content.defaultHeaderType` — as
provided by `typo3/fluid-styled-content` — is configured via
:file:`settings.yaml`.

..  code-block:: yaml
    :caption: EXT:my_extension/Configuration/MyProfile/settings.yaml

    styles:
      content:
        defaultHeaderType: 1


This setting will be exposed as site setting whenever the profile
`my-vendor/my-profile` is applied to a site config.


Impact
======

Sites can be composed of profiles where relevant configuration, assets and
setting definitions are combined in a central place and applied to sites as one
logical volume.

Profiles have dependency management and therefore allow sharing code between
multiple TYPO3 sites and extensions in a flexible way.


.. index:: Backend, Frontend, PHP-API, TSConfig, TypoScript, YAML, ext:core
