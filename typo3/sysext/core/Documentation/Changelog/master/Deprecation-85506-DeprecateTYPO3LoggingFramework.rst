.. include:: ../../Includes.txt

=======================================================
Deprecation: #85506 - Deprecate TYPO3 logging framework
=======================================================

See :issue:`85506`

Description
===========

The TYPO3 logging framework has been deprecated in favor of native monolog support.


Impact
======

The TYPO3 logging framework will log a deprecation warning and suggest to use
monolog. Logging continues to work but will be replaced by monolog in v12.0.


Affected Installations
======================

Installations that upgrade from previous TYPO3 versions will be affected and
should update to monolog.
New TYPO3 installations will automatically default to activate logging via
monolog.

Custom extensions that register custom LogWriters need to implement
monolog handlers in order to support monolog based logging.


Migration
=========

Set :php:`$GLOBALS['TYPO3_CONF_VARS']['SYS']['features']['monolog'] = true` in
:file:`LocalConfiguration.php` and migrate possible custom logger configuration
as described in
:doc:`AddMonologAsAlternativeLoggerImplementation (Feature) <Feature-85506-AddMonologAsAlternativeLoggerImplementation>`.

Related
=======

 *  :doc:`AddMonologAsAlternativeLoggerImplementation (Feature) <Feature-85506-AddMonologAsAlternativeLoggerImplementation>`

.. index:: LocalConfiguration, NotScanned, ext:core
