..  include:: /Includes.rst.txt

..  _feature-111048-1791976923:

==========================================================================
Feature: #111048 - Introduce standalone redirect option for backend routes
==========================================================================

See :issue:`111048`

Description
===========

Backend routes can be configured to be restored after a login via the
:php:`redirect` route option (see :ref:`feature-93988`). So far, the
user is always sent to the backend main view after the login, which then
loads the requested route inside the content frame.

Routes that render a complete page on their own – for example a consent
screen an external application sends the user to – must not be wrapped
in the backend main view. For these routes, the new option
:php:`'standalone' => true` redirects the user directly to the requested
route with its parameters after the login.

..  code-block:: php
    :caption: EXT:my_extension/Configuration/Backend/Routes.php

    use MyVendor\MyExtension\Controller\ConsentController;

    return [
        'my_extension_consent' => [
            'path' => '/my-extension/consent',
            'target' => ConsentController::class . '::handle',
            'redirect' => [
                'enable' => true,
                'standalone' => true,
                'parameters' => [
                    'client_id' => true,
                ],
            ],
        ],
    ];

Impact
======

Backend routes can be redirected to directly after the login, without
being embedded into the backend main view, by setting the option
:php:`'standalone' => true` in their :php:`redirect` configuration.

..  index:: Backend, PHP-API, NotScanned, ext:backend
