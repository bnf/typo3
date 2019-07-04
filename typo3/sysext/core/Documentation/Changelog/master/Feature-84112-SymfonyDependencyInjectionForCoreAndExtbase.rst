.. include:: ../../Includes.txt

===================================================================
Feature: #84112 - Symfony dependency injection for core and extbase
===================================================================

See :issue:`84112`

Description
===========

The PHP library `symfony/dependency-injection` has been integrated and is used
to manage system wide dependency management and injection for classes.
It features support for extbase and non extbase classes and is thus intended to
replace the Extbase dependency injection container.
Therefore :php:`\TYPO3\CMS\Extbase\Object\ObjectManager` now resorts to the
new system wide system container and priorizes its entries over classical
extbase based dependency injection (which is still available).

Extensions are encouraged to configure their classes to make use of the new
dependency injection. A symfony flavored yaml or php service configuration
file may be used to do so.

A :file:`Configuration/Services.yaml` which pretty much reflects the
current feature set of extbase DI file looks like:

.. code-block:: yaml
	# Configuration/Services.yaml
	services:
	  _defaults:
	    autowire: true
	    autoconfigure: true
	    public: false

	  Your\Namespace\:
	    resource: '../Classes/*'

As many extensions will have used extbase dependency injections in the past,
these extensions will want to enable `autowire` which instructs symfony to
calculate the required dependencies from type declaration of constructor
and inject method. This calculation yields to a service initialization recipe
which is cached using the core php code cache.
Note: An extension doesn't need to use autowiring, it is free to manually
wire dependencies in the service configuration file.

It is suggested to enable `autoconfigure` option as that will automatically
add symfony service tags based on implemented interfaces or base classes. E.g.
it sets classes that implement :php:`\TYPO3\CMS\Core\SingletonInterface` to be publicly available
in the symfony container (required for legacy singleton lookups through
:php:`\TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance()`).

`public: false` is a performance optimzation and is therefore suggested to be
enabled in extensions (symfony does not enable this by default for backwards
compatibility reasons).


Impact
======

 * Symfony automatically resolves interfaces to classes when only one class
   implementing an interface is given. Otherwise an explicit alias is required.
   That means you SHOULD define an alias for interface to class mappings where
   the implementation defaults to the interface minus the trailing Interface
   suffix.

 * Dependency Injection can be added to services without being breaking.
   `GeneralUtility::makeInstance(ServiceName::class)` will keep working,
   as `makeInstance` is adapted to resort to the symfony container.

 * Cyclic dependencies are not supported


.. index:: PHP-API, ext:core
