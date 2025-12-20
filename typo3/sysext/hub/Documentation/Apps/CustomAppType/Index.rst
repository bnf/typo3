..  include:: /Includes.rst.txt

..  _custom-app-type:

====================
Custom app type
====================

A custom app type may be useful, if the
:ref:`create database record <create-database-record>` type is not sufficient.

As an example the following scenario is used:

We want to synchronize products from an external system into TYPO3. As the
synchronization may be time-consuming (think of synchronizing images), the
real work is done by a command. Therefore, the app receives an ID from
a product which was added or changed. This ID is stored in the
:sql:`sys_registry` table.

A command (which is not part of this example) runs regularly and synchronizes
every product ID stored in the registry entry into TYPO3.

You can find the implemented app type in the :t3ext:`examples` extension.

..  _create-app-type:

Create the app type
========================

To create a custom app type, we add a class which implements the
:t3src:`hub/Classes/App/AppInterface.php`:

..  literalinclude:: _ExampleAppType.php
    :language: php
    :caption: EXT:examples/Classes/App/ExampleAppType.php

You can use :ref:`constructor injection <t3coreapi:Constructor-injection>` to
inject necessary dependencies.

..  _add-app-type:

Add app type to select list in backend module
==================================================

In a next step we add the newly created app type to the list of
app types in the backend:

..  literalinclude:: _sys_app.php
    :language: php
    :caption: EXT:examples/Configuration/TCA/Overrides/sys_app.php

Now, our newly created type is displayed and can be selected:

..  figure:: /Images/CustomAppType.png
    :alt: Selecting our custom app type
    :class: with-shadow

    Selecting our custom app type
