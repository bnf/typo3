.. include:: ../../Includes.txt

=====================================================================================
Deprecation: #89139 - Console Commands configuration migrated to Symfony service tags
=====================================================================================

See :issue:`89139`

Description
===========

The following Signal Slots have been replaced by new PSR-14 events
which can be used as 1:1 equivalents:

- :php:`TYPO3\CMS\Backend\Backend\ToolbarItems\SystemInformationToolbarItem::getSystemInformation`
- :php:`TYPO3\CMS\Backend\Backend\ToolbarItems\SystemInformationToolbarItem::loadMessages`
- :php:`TYPO3\CMS\Backend\LoginProvider\UsernamePasswordLoginProvider::getPageRenderer`
- :php:`TYPO3\CMS\Backend\Controller\EditDocumentController::preInitAfter`
- :php:`TYPO3\CMS\Backend\Controller\EditDocumentController::initAfter`
- :php:`TYPO3\CMS\Backend\Utility\BackendUtility::getPagesTSconfigPreInclude`
- :php:`TYPO3\CMS\Beuser\Controller\BackendUserController::switchUser`
- :php:`TYPO3\CMS\Core\Database\SoftReferenceIndex::setTypoLinkPartsElement`
- :php:`TYPO3\CMS\Core\Database\ReferenceIndex::shouldExcludeTableFromReferenceIndex`
- :php:`TYPO3\CMS\Core\Imaging\IconFactory::buildIconForResourceSignal`
- :php:`TYPO3\CMS\Core\Tree\TableConfiguration\DatabaseTreeDataProvider::PostProcessTreeData`
- :php:`TYPO3\CMS\Core\Utility\ExtensionManagementUtility::tcaIsBeingBuilt`
- :php:`TYPO3\CMS\Impexp\Utility\ImportExportUtility::afterImportExportInitialisation`
- :php:`TYPO3\CMS\Install\Service\SqlExpectedSchemaService::tablesDefinitionIsBeingBuilt`
- :php:`TYPO3\CMS\Lang\Service\TranslationService::postProcessMirrorUrl`
- :php:`TYPO3\CMS\Linkvalidator\LinkAnalyzer::beforeAnalyzeRecord`
- :php:`TYPO3\CMS\Seo\Canonical\CanonicalGenerator::beforeGeneratingCanonical`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GenerateDataArray_BeforeCaching`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GenerateDataArray_PostProcesss`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GetDataArray_PostProcesss`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_SortDataArray_PostProcesss`

In addition, the following public constants, marking a signal name, are deprecated:

- :php:`TYPO3\CMS\Core\Tree\TableConfiguration\DatabaseTreeDataProvider::SIGNAL_PostProcessTreeData`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GenerateDataArray_BeforeCaching`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GenerateDataArray_PostProcesss`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_GetDataArray_PostProcesss`
- :php:`TYPO3\CMS\Workspaces\Service\GridDataService::SIGNAL_SortDataArray_PostProcesss`

Impact
======

Using the mentioned signals will trigger a deprecation warning.
Providing a command configuration in :php:`Confguration/Commands.php` will trigger
a deprecation warning when the same respective commands have not already been
defined by symfony service tags.

Extensions that provide both, the deprecated and the new format


Affected Installations
======================

TYPO3 installations with custom extensions that configure symfony console commands
via :php:`Confguration/Commands.php` and have not been migrated to add symfony
service tags.


Migration
=========

Add the `console.command` tag to command classes.
Use the tag attribute `command` to specify the command name.
The optional tag attribute `schedulable` may be set to false
to exclude the command from the TYPO3 scheduler.

.. code-block:: yaml

    services:
      _defaults:
        autowire: true
        autoconfigure: true
        public: false

      MyVendor\MyExt\Commands\FooCommand
        tags:
          - { name: 'console.command', command: 'my:command', schedulable: false }

Command aliases are to be configured as separate tags.
The optonal tag attribute `alias` should be set to true for alias commands.

.. code-block:: yaml

      MyVendor\MyExt\Commands\BarCommand
        tags:
          - { name: 'console.command', command: 'my:bar' }
          - { name: 'console.command', command: 'my:old-bar-command', alias: true, schedulable: false }

.. index:: CLI, PHP-API, PartiallyScanned, ext:core
