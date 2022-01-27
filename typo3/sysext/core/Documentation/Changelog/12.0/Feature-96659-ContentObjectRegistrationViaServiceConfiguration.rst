.. include:: ../../Includes.txt

======================================================================
Feature: #96659 - ContentObject Registration via service configuration
======================================================================

See :issue:`96659`

Description
===========

ContentObjects such as `TEXT` or `COA` for rendering content blocks in TYPO3
Frontend via TypoScript are now registered via the service configuration.

This way registration is done during build-time and not on every TYPO3 request.

The registration was previously done in an extensions' :file:`ext_localconf.php`
via :php:`$GLOBALS['TYPO3_CONF_VARS']['FE']['ContentObjects']`.


Impact
======

Registering a custom ContentObject is now done in an extensions'
:file:`Configuration/Services.yaml`:

.. code-block:: yaml

    MyCompany\MyPackage\ContentObject\CustomContentObject:
        tags:
            - name: frontend.contentobject
              identifier: 'MY_OBJ'

.. index:: Frontend, ext:frontend
