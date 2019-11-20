.. include:: ../../Includes.txt

==================================================================
Feature: #85506 - Add monolog as alternative logger implementation
==================================================================

See :issue:`85506`

Description
===========

Both the (now) legacy TYPO3 logging framework and monolog are PSR-3
compatible, thus there is no change in actual log calls. However,
there is a change regarding the configuration of monolog in TYPO3.

As monolog configuration (and logging) format is different to
the current TYPO3 logging implementation, the monolog usage
is hidden behind a feature flag `monolog`.

Monolog will be used for new installations, upgraded
installations will stick with the legacy logging framework.

It is likely that the traditional logging framework
will be deprecated until 11.5 LTS.

The configuration and logging service definition format is
inspired by the symfony monolog-bundle format.

Monolog processors and channels are defined via Service tags.
Monolog handlers are configured via TYPO3_CONF_VARS. The
handler configuration defines the handler type, destination,
related channels, and the desired formatter:

.. code-block:: php

    // ...
    'monolog' => [
        'handlers' => [
            'main' => [
                'type' => 'stream',
                'level' => 'warning',
                'excluded_channels' => [
                    'security',
                    'deprecations',
                ],
                'formatter' => 'monolog.formatter.line',
            ],
            'deprecations' => [
                'type' => 'stream',
                'level' => 'notice',
                'disabled' => true,
                'channels' => ['deprecations'],
                'formatter' => 'monolog.formatter.line',
            ],
        ],
    ],
    // ...

The respective type needs to be implemented by a HandlerFactory.
TYPO3 doesn't provide a factory for every monolog handler, as handlers
can also be defined via dependency injection service definition:

.. code-block:: yaml
    monolog.handler.syslog:
      class: Monolog\Handler\SyslogHandler
      arguments:
        $ident: 'My TYPO3'
        $level: 'debug'
      tags:
        - name: monolog.handler
          channels: default,security


Monolog channels can be defined via the service tag `monolog.logger`:

.. code-block:: yaml

    # Configuration/Services.yaml
    services:
      logger.security:
        tags:
          - name: monolog.logger
            channel: security


Monolog processor can be defined via the service tag `monolog.processor`.
By default they are applied to all channels. If a `channel` or `handler` tag
attribute is defined, the processor is tied to the respective type of service:

.. code-block:: yaml

    # Configuration/Services.yaml
    services:
      # MyProcessor, processors all log record of all channels and handlers
      Monolog\Processor\HostnameProcessor:
        tags:
          - name: monolog.processor
      # Hostname processor, added to channel default only
      Monolog\Processor\HostnameProcessor:
        tags:
          - name: monolog.processor
            channel: default
      # ProcessIdProcessor, added to channel default only
      Monolog\Processor\ProcessIdProcessor:
        tags:
          - name: monolog.processor
             handler: main


Impact
======

Monolog integration will enable usage of the wide range of existing monolog
handlers. It will lighten the TYPO3 codebase by replacing the home grown logging
system with this shared library.

.. index:: PHP-API, ext:core
