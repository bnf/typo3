.. include:: ../../Includes.txt

================================================
Feature: #93436 - Introduce cache:warmup command
================================================

See :issue:`93436`

Description
===========

It is now possible to warmup TYPO3 caches using the command line.

The administrator can use the following CLI command:

.. code-block:: bash

   ./typo3/sysext/core/bin/typo3 cache:warmup

Specific cache groups can be defined via the first command line argument.
The usage is described as this:

 .. code-block:: bash

    cache:warmup <all|system|di|pages|…>

All available cache groups can be supplied as argument. The command defaults to
warm all available cache groups.

Extensions that register custom caches are encouraged to implement cache warmers
via :php:`TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent`.

Note: TYPO3 frontend caches will not be warmed by TYPO3 core, such functionality
could be added by third party extensions with the help of
:php:`TYPO3\CMS\Core\Cache\Event\CacheWarmupEvent`.

Impact
======

It is common practice to clear all caches during deployment of TYPO3 instance
updates. This means that the first request after a deployment usually takes
a major amount of time and blocks other requests due to cache-locks.

TYPO3 caches can now be warmed during deployment in release preparatory steps,
in order to enable fast first requests with all caches being prepared and warmed.

.. index:: CLI, ext:core
