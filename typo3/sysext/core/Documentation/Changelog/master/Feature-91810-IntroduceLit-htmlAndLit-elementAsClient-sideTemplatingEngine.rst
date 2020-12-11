.. include:: ../../Includes.txt

=====================================================================================
Feature: #91810 - Introduce lit-html and lit-element as client-side templating engine
=====================================================================================

See :issue:`91810`

Description
===========

To avoid custom jQuery template building a new slim client-side templating
engine `lit-html`_ together with `lit-element_` is introduced.

This templating engine supports conditions, iterations, events, virtual DOM,
data-binding and mutation/change detections in templates.

.. _lit-html: https://lit-html.polymer-project.org/
.. _lit-element: https://lit-element.polymer-project.org/


Impact
======

Individual client-side templates can be processed in JavaScript directly
using moder web technologies like template-strings_ and template-elements_.

.. _template-strings: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
.. _template-elements: https://developer.mozilla.org/de/docs/Web/HTML/Element/template

Rendering is handled by the AMD-modules `lit-html` and `lit-element`.
Please consult the `lit-html` template-reference_ and lit-element-guide_ for more
information.

.. _template-reference: https://lit-html.polymer-project.org/guide/template-reference
.. _lit-element-guide: https://lit-element.polymer-project.org/guide

.. index:: Backend, JavaScript, ext:backend
