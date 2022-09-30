.. include:: /Includes.rst.txt

.. _breaking-98481-1664541985:

==================================================================
Breaking: #98481 - Hash package version into public resource paths
==================================================================

See :issue:`98481`

Description
===========

TYPO3 extensions in composer mode installations are stored in `vendor/` while
their public resources are linked to the common folder `public/_assets/` when
typo3/cms-composer-installers version 4 is used.

The symlink name in public/_assets/ is now extended to be not
just a hash of the relative path to the vendor folder, but also
acts as a cacheHash, by including the package version into the
symlink name.

That means an extension update of packages/extensions
will trigger a new symlink name.
This has the drawback that that names in public/_assets/ are
no longer predictable, but brings the benefit that this will allow
TYPO3 to skip modification-timstamp-lookups in
:php:`GeneralUtility::createVersionNumberedFilename()` and to generate
performant JavaScript importmaps via trailing slashes syntax.


Impact
======

Upon updating packages via `composer update`, the symlink names in
`public/_assets` will change, which means the hashes must not be hardcoded
by the integrator.


Affected installations
======================

TYPO3 composer mode installations that use typo3/cms-composer-installers in
version 4.


Migration
=========

Instead of hardcoding an extension path, the TYPO3 API :php:`PathUtility`
should be used:

.. code-block:: php

   PathUtility::getPublicResourceWebPath('EXT:myext/Resources/Public/MyFile.txt');

.. index:: ext:core, NotScanned
