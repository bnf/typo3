..  include:: /Includes.rst.txt

..  _list-widget:

===========
List Widget
===========

..  php:namespace:: TYPO3\CMS\Dashboard\Widgets
..  php:class:: TYPO3\CMS\Dashboard\Widgets\ListWidget

Widgets using this class will show a simple list of items provided by a data
provider.

Example
-------

..  code-block:: yaml
    :caption: Excerpt from EXT:dashboard/Configuration/Services.yaml

    services:

      dashboard.widget.testList:
        class: 'TYPO3\CMS\Dashboard\Widgets\ListWidget'
        arguments:
          $dataProvider: '@Vendor\Ext\Widgets\Provider\TestListWidgetDataProvider'
          $view: '@dashboard.views.widget'
          $options:
            refreshAvailable: true
        tags:
          - name: dashboard.widget
            identifier: 'testList'
            groupNames: 'general'
            title: 'List widget'
            description: 'Description of widget'
            iconIdentifier: 'content-widget-list'
            height: 'large'
            width: 'large'

Options
-------

..  include:: Options/RefreshAvailable.rst.txt

Dependencies
------------

..  confval:: $dataProvider
    :type: :php:`\TYPO3\CMS\Dashboard\Widgets\NumberWithIconDataProviderInterface`
    :name: list-widget-dataProvider

    This class should provide the items to show.
    This data provider needs to implement the
    :php-short:`\TYPO3\CMS\Dashboard\Widgets\NumberWithIconDataProviderInterface`.

..  confval:: $view
    :name: list-widget-view

    Used to render a Fluid template.
    This should not be changed.
    The default is to use the pre configured Fluid StandaloneView for EXT:dashboard.

    See :ref:`implement-new-widget-fluid` for further information.
