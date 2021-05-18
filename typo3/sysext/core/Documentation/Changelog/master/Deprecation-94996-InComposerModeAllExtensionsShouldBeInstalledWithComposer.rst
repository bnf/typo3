.. include:: ../../Includes.txt

========================================================================================
Deprecation: #94996 - In Composer Mode, all Extensions should be installed with Composer
========================================================================================

See :issue:`94996`

Description
===========

In Composer Mode extensions not being installed with Composer are deprecated.

TYPO3 Extensions are Composer packages and therefore Composer mechanisms should be used to install them properly in the project, and not placed manually in their target location `typo3conf/ext`


Impact
======

A deprecation message is show for any extension, that is not installed with Composer.


Affected Installations
======================

Composer based TYPO3 projects, that have extensions directly in `typo3conf/ext` under version control.


Migration
=========

Composer based TYPO3 projects, that have extensions directly in `typo3conf/ext` under version control, should migrate them to be installed using the Composer path repository mechanism:


.. code-block:: json

    {
        "repositories": [
            {
                "type": "path",
                "url": "./packages/*/"
            },
        ],
        "require": {
            "my/example-extension": "@dev",
        }
    }


Now, when `example-extension` is located `packages/example-extension`, it picked
up by composer and symlinked into `typo3conf/ext/example_extension`.

.. index:: CLI, NotScanned, ext:core
