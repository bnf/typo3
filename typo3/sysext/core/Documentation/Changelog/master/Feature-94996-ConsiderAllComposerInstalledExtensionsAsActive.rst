.. include:: ../../Includes.txt

======================================================================
Feature: #94996 - Consider all Composer installed extensions as active
======================================================================

See :issue:`94996`

Description
===========

All TYPO3 extensions installed with Composer are now considered to be active and therefore can and will interact with TYPO3 API.

At Composer install time a persistent artefact is created, holding the information of which extensions are installed and the path where these reside. This makes the `typo3conf/PackageStates.php` file obsolete and it is neither created nor evaluated any more.

Any extension present in the `typo3conf/ext` folder, but not installed by Composer, will still be considered and marked as part of TYPO3 packages when doing a `composer install`. The only requirement here is, that such extensions need a `composer.json` file nontheless.
Note that this behaviour is deprecated and will be removed with TYPO3 12.

Because all extensions present in the system are considered to be active, the Extension Manager UI is adapted to
not allow to change the active state of extensions any more.
Respectively the commands `extension:activate` and
`extension:deactivate` are disabled in Composer managed
systems as well.

A new command `extension:setup` is introduced, which supersedes both, the extension manager UI as well as the activate/deactivate commands. It performs all steps that were peformed during activation and deactivation (the active-state is of course not changed).

With the command `extension:setup` *all* extensions are set up in terms of database schema changes, static data import, distribution files imports, etc.

Any installed Composer package, that defines an `extra.typo3/cms` section in their `composer.json` file, will be considered a TYPO3 extension and have full access to TYPO3 API.
However because these Composer packages reside in the `vendor` folder, they can not deliver public resources.
This remains exclusive for TYPO3 extensions installed into `typo3conf/ext` for now.


Impact
======

In Composer mode this has the following impact:

The `PackageState.php` file is completely ignored. When migrating projects, which still have this file e.g. under version control,
it is recommended to remove this file.

Projects with extensions that reside directly in `typo3conf/ext`, and therefore are not installed with Composer, should consider migrating them to a local path repository.
In any case, such extensions now require to have a `composer.json` file. Such file can be created by using the according UI in the Extension Manager.

When working on a Composer based project and adding new extensions via the Composer cli tool during development, all added extensions are considered active automatically, but are not yet set up in terms of database schema changes for example. Therefore in such situations the TYPO3 cli command `extension:setup` needs to be executed additionallty. `extension:setup` can and should also be used, when deploying a TYPO3 project to make sure database schema is up to date.

The `ext_emconf.php` file of extensions is now obsolete and therefore completely ignored. Make sure the information in the `composer.json` file is in sync with the one in your `ext_emconf.php` file in case you want to provide one for compatibility with non Composer mode.

.. index:: CLI, Composer, ext:core
