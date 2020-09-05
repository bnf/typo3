.. include:: ../../Includes.txt

==========================================================================
Feature: #96510 - Add infrastructure for JavaScript modules and importmaps
==========================================================================

See :issue:`96510`

Description
===========

ES6 modules may now be used instead of AMD modules,
both in backend and frontend context.

RequireJs is shimmed to prefer ES6 modules if available, allowing any extension
to ship ES6 modules by providing an importmap configuration in
:file:`Configuration/JavaScriptModules.php` while providing full backwards
compatibility support for extensions that load modules via RequireJS.


Impact
======

The custom module loader RequireJS can be removed and the native browsers module
loading can be approached in order to speed up module loading and
use the platform.

.. index:: JavaScript, ext:core
