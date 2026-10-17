..  include:: /Includes.rst.txt

..  _important-xxxxxx-1792252800:

============================================================================
Important: #xxxxxx - Extbase looks for empty dates as the column stores them
============================================================================

See :issue:`xxxxxx`

Description
===========

A TCA :php:`type => 'datetime'` field stores no date as SQL :sql:`NULL` if the
field is nullable, and as its empty value otherwise: :sql:`0` in an integer
column, :sql:`'0000-00-00'`, :sql:`'0000-00-00 00:00:00'` or
:sql:`'00:00:00'` in a native one.

An Extbase query for :php:`$query->equals('date', null)`, its negation and the
lookup of an already persisted value object now look for exactly the way the
database column stores no date. They compare with SQL :sql:`NULL` only where
the column allows :sql:`NULL`, and with the empty value only where the field
is not nullable or the column does not allow :sql:`NULL`. Both are only
compared where the TCA and :file:`ext_tables.sql` disagree, for instance a
field that is not nullable in a column declared :sql:`DEFAULT NULL`.

A native :sql:`DATE` or :sql:`DATETIME` field that is nullable may still hold
the zero date :sql:`'0000-00-00'` in rows written before it was nullable.
Extbase still reads such a value as no date, but a query for :php:`null` no
longer finds it. The upgrade wizard "Migrate zero dates of nullable date
fields to NULL" (:php:`zeroDateToNullUpdateWizard`) updates these values to
:sql:`NULL`. Run it after updating the database schema.

..  index:: Database, ext:extbase
