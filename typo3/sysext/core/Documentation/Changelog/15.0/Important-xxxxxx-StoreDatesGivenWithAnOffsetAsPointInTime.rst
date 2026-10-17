..  include:: /Includes.rst.txt

..  _important-xxxxxx-1792338000:

======================================================================
Important: #xxxxxx - Store dates given with an offset as point in time
======================================================================

See :issue:`xxxxxx`

Description
===========

A value for a TCA :php:`type => 'datetime'` field that comes with a timezone
offset, for instance :php:`'2020-11-25T00:00:00+02:00'` passed to the
:php-short:`\TYPO3\CMS\Core\DataHandling\DataHandler` or a
:php:`\DateTimeInterface` object of an Extbase model, is now stored as the
same point in time in every field.

Previously, a field with :php:`'format' => 'date'`, :php:`'time'` or
:php:`'timesec'`, or with :php:`'dbType' => 'date'` or :php:`'time'`, took
the date or time as given in the offset of the value, while a date with time
was converted to the timezone of the server. An integer date field stored
midnight in the offset of the value, which a server in another timezone read
as a time on the day before or after.

Now every value is converted to the timezone of the server before the date or
time is cut from it. On a server in Europe/Berlin, the example above is stored
as :sql:`2020-11-24` in a date field, since 2020-11-25T00:00:00+02:00 is
2020-11-24 23:00 there. Values without an offset, as FormEngine sends them,
are server localtime and are not affected.

..  index:: Database, PHP-API, ext:core, ext:extbase
