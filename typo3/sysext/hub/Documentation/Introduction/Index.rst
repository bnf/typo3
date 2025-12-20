..  include:: /Includes.rst.txt

..  _introduction:

============
Introduction
============

This system extension adds the possibility to receive webhooks in TYPO3.

A webhook is defined as an authorized POST request to the TYPO3 backend.

It offers a backend module, :guilabel:`System > Integrations > Hub`, that can be used
to configure hub triggered by a webhook.

The extensions provides a basic default app that can be used to
:ref:`create database records <create-database-record>` triggered and enriched
by data from the caller.

Additionally, the Core provides the
:php:`\TYPO3\CMS\Hub\App\AppInterface`
to allow extension authors to add their own app types.

Any app record is defined by a unique identifier and also requires a
secret. Both information are generated in the backend. The secret is only
visible once and stored in the database as an encrypted value like a backend
user password.
