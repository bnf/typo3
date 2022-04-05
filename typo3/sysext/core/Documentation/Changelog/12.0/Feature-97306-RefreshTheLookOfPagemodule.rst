.. include:: /Includes.rst.txt

=================================================================================
Feature: #97306 - Refresh the look of pagemodule
=================================================================================

See :issue:`97306`

Description
===========

The patch simplifies and optimizes the readability of the page module interface.
It is based on the UX Team's concept of improving user experience for editors.

Further links to the Page Module concept and official communication.

First step page module simplification_ with screenshots

.. _https://typo3.org/article/structured-content-initiative-what-happened-between-july-and-november

Promotion of page module pilot_

.. _https://typo3.org/article/structured-content-initiative-feedback-wanted


Impact
======

* underlying CSS was refactored and optimised for future adaptations
* content element boxes and their header buttons are visually simplified
* hidden content elements are now differenciated with a better opacity
  and a dotted border
* New Content buttons were placed in the centre in preparation
  for implementation of later concepts
* new button for the content element context menu is added in the content
  element header right button bar, in place of the delete button
* Based on common UI concepts, the delete button has been moved to the
  context menu

.. index:: Backend, ext:backend
