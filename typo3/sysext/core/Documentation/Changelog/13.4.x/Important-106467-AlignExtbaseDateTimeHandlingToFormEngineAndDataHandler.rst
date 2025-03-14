..  include:: /Includes.rst.txt

..  _important-106467-1743452295:

==================================================================================
Important: #106467 - Align Extbase DateTime handling to FormEngine and DataHandler
==================================================================================

See :issue:`106467`

Description
===========

Extbase handling of :php:`\DateTimeInterface` domain model properties has been
aligned with the persistence and database value interpretation behavior of
FormEngine and DataHandler.

Since this change addresses bugs and value interpretation differences that
existed since the introduction of Extbase and there are many workarounds use in
projects, a feature flag :php:`'extbase.consistentDateTimeHandling'` is
introduced which allows to enable the new behavior.

Existing TYPO3 v13 instances will use the old behavior by default and are
advised to enable the new feature flag via InstallTool or via:

..  code-block:: php

    $GLOBALS['TYPO3_CONF_VARS']['SYS']['features']['extbase.consistentDateTimeHandling'] = true;

TYPO3 v14 and new v13 instances will enable the constent DateTime handling by
default, but the feature can still be disabled manually.

The following cases are addressed by the feature flag:


Map date and datetime with named timezone instead of offset
-----------------------------------------------------------

Ensure that Extbase DataMapper converts dates from integer based
database fields to DateTime instances that use the current server date
timezone (e.g., Europe/Berlin) and not just the time offset of the
current server timezone (e.g., +01:00).

This prevents timezone shifts when modifying the resulting :php:`\DateTime`
object across daylight saving time boundaries.


Interpret integer based time fields as seconds without timezone offset
----------------------------------------------------------------------

The Extbase DataMapper will interpret `format=time` or `format=timesec`
datetime fields as seconds without timezone offset, like FormEngine and
DataHandler do. That means the database value is not considered as
a UNIX timestamp, but an offset from midnight from 1970-01-01 in localtime.


Interpret 00:00:00 as non empty time value for nullable time properties
-----------------------------------------------------------------------

Nnullable `format=time`, `format=timesec` or `dbType=time` fields can
use 00:00:00 to represent midnight (this value has been used in
non-nullable fields to represent an empty value). Adapt the DateTime
mapper to understand this format.


Construct `format=time` and `dbType=time` properties based on 1970-01-01
------------------------------------------------------------------------

DateTime objects that map to native TIME fields or integer based
fields configured with `format=time` are now initialized with
1970-01-01 as day-part instead of the current day, as this is what
the database value refers to and results in consistent values
independent from the day where the query is performed.


Align persistence to database to match DataHandler algorithm
------------------------------------------------------------

Use the DataHandler algorithm for the mapping of DateTime objects
to database values.
This causes non-localtime timezone offsets in `\DateTime` objects
(e.g. Supplied by a frontend datepicker) to be respected for native
datetime fields, like already done for integer datetime fields.
Not that the offset is not stored as-is, but mapped to PHP localtime, but it
is no longer cropped off.


..  index:: Database, PHP-API, ext:extbase
