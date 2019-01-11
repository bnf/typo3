.. include:: ../../Includes.txt

===================================================================
Feature: #84112 - Symfony dependency injection for core and extbase
===================================================================

See :issue:`84112`

Description
===========

The PHP library `symfony/dependency-injection` has been integrated and is used
to manage system wide dependency management for classes.
It is intended to replace the Extbase dependency injection container.
Therefore :php:`Extbase\Object\ObjectManager` makes use of the system wide
object container.

Extensions need to define their classes (or better class paths) explictly to be
taken into account for dependency injection. A symfony flavored yaml or php
service configuration can used.

The suggested :file:`Configuration/Services.yaml` file looks like:

.. code-block:: yaml
	# Configuration/Services.yaml
	services:
	  _defaults:
	    autowire: true
	    autoconfigure: true
	    public: false
       # todo: add shared: false here?

	  Your\Namespace\:
	    resource: '../Classes/*'

As most extensions will have used extbase dependency injections in the past
most extensions will want to enable `autowire` to let symfony calculate the
required dependencies. These calculated recipes for creating autowiring
classes is cached as php code. Though: An extension doesn't need to use
autowiring, and can hand-wire the provided services (classes), if desired.

It's suggest to enable `autoconfigure` as that will automatically add symfony
service tags based on implemented interfaces or base classes. E.g. it sets
Controllers to be public if needed to be used in dispatchers and can
auto-register some services to registries.

`public: false` is suggested because that's a performance optimzation
(but not enabled by default by symfony for backwards compatibility reasons).


Impact
======

TODO


.. index:: PHP-API, ext:core
