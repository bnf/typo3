.. include:: ../../Includes.txt

===================================================================
Feature: #84112 - Symfony dependency injection for core and extbase
===================================================================

See :issue:`84112`

Description
===========

The PHP library `symfony/dependency-injection` has been integrated and is used
to manage system wide dependency management and injection for classes.
It is intended to provide a dependency injection for extbase and non extbase
classes and is thus inteded to replace the Extbase dependency injection container.
Therefore :php:`Extbase\Object\ObjectManager` now resorts to the new system wide
system container and priorizes entries.

Extensions are encouraged to configure their class paths to be taken into account
for dependency injection. A symfony flavored yaml or php service configuration
file may be used.

The suggested :file:`Configuration/Services.yaml` file looks like:

.. code-block:: yaml
	# Configuration/Services.yaml
	services:
	  _defaults:
	    autowire: true
	    autoconfigure: true
	    public: false

	  Your\Namespace\:
	    resource: '../Classes/*'

As most extensions will have used extbase dependency injections in the past
most extensions will want to enable `autowire` which instructs symfony to
calculate the required dependencies. The calculated recipes for initialization
of classes is cached as php code. Note: An extension doesn't need to use
autowiring.

It is suggested to enable `autoconfigure` option as that will automatically
add symfony service tags based on implemented interfaces or base classes. E.g.
it sets controllers to be public to be usable in dispatchers.

`public: false` is a performance optimzation and is therefore suggested to be
enabled in extensions (it is not enabled by default by symfony for backwards
compatibility reasons).


Impact
======

TODO


.. index:: PHP-API, ext:core
