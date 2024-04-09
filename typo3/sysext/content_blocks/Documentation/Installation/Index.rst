.. include:: /Includes.rst.txt
.. _extension_installation:


.. _installation:

============
Installation
============

This extension is part of the TYPO3 Core, but not installed by default.

..  contents:: Table of contents
    :local:

Installation with Composer
==========================

Check whether you are already using the extension with:

..  code-block:: bash

    composer show | grep content-blocks

This should either give you no result or something similar to:

..  code-block:: none

    typo3/cms-content-blocks       v13.0.0

If it is not installed yet, use the ``composer require`` command to install
the extension:

..  code-block:: bash

    // System Extension TYPO3 v13
    composer require typo3/cms-content-blocks

    // TYPO3 v12 backport
    composer require contentblocks/content-blocks

The given version depends on the version of the TYPO3 Core you are using.

Installation without Composer
=============================

In an installation without Composer, the extension is already shipped but might
not be activated yet. Activate it as follows:

#.  In the backend, navigate to the :guilabel:`Admin Tools > Extensions`
    module.
#.  Click the :guilabel:`Activate` icon for the Content-Blocks extension.

Next steps
==========

Head to the :ref:`Introduction <introduction>` page or learn how to
:ref:`migrate from using mask <migrations-mask>`.
