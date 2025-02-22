<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Core\Tests\Acceptance\Application\Impexp;

use Codeception\Scenario;
use TYPO3\CMS\Core\Tests\Acceptance\Support\ApplicationTester;
use TYPO3\CMS\Core\Tests\Acceptance\Support\Helper\PageTree;

/**
 * Various context menu related tests
 */
class UsersCest extends AbstractCest
{
    protected string $inPageTree = '#typo3-pagetree-treeContainer .nodes';
    protected string $inModuleHeader = '.module-docheader';
    protected string $inModuleTabs = '#ImportExportController .nav-tabs';
    protected string $inModuleTabsBody = '#ImportExportController .tab-content';

    protected string $buttonUser = '#typo3-cms-backend-backend-toolbaritems-usertoolbaritem';
    protected string $buttonLogout = '#typo3-cms-backend-backend-toolbaritems-usertoolbaritem button.btn.btn-danger';
    protected string $contextMenuMore = '#contentMenu0 li.list-group-item-submenu';
    protected string $contextMenuExport = '#contentMenu1 li.list-group-item[data-callback-action=exportT3d]';
    protected string $contextMenuImport = '#contentMenu1 li.list-group-item[data-callback-action=importT3d]';
    protected string $buttonViewPage = 'span[data-identifier="actions-view-page"]';
    protected string $tabUpload = 'a[href="#import-upload"]';
    protected string $checkboxForceAllUids = 'input#checkForce_all_UIDS';

    /**
     * @throws \Exception
     */
    public function _before(ApplicationTester $I): void
    {
        $I->useExistingSession('admin');
        $I->click('List');
        $I->waitForElement('svg .nodes .node');
    }

    /**
     * @throws \Exception
     */
    public function doNotShowImportAndExportInContextMenuForNonAdminUser(ApplicationTester $I, PageTree $pageTree, Scenario $scenario): void
    {
        $selectedPageTitle = 'Root';
        $selectedPageIcon = '//*[text()=\'' . $selectedPageTitle . '\']/../*[contains(@class, \'node-icon-container\')]';

        $this->setPageAccess($I, $pageTree, [$selectedPageTitle], 1);
        $this->setModAccess($I, 1, ['web_list' => true]);
        $isComposerMode = str_contains($scenario->current('env'), 'composer');
        $userId = $isComposerMode ? 3 : 2;
        $this->setUserTsConfig($I, $scenario, $userId, '');
        $I->useExistingSession('editor');

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore]);
        $I->waitForElementVisible('#contentMenu1', 5);
        $I->dontSeeElement($this->contextMenuExport);
        $I->dontSeeElement($this->contextMenuImport);

        $I->useExistingSession('admin');
    }

    /**
     * @throws \Exception
     */
    public function showImportExportInContextMenuForNonAdminUserIfFlagSet(ApplicationTester $I, Scenario $scenario): void
    {
        $selectedPageTitle = 'Root';
        $selectedPageIcon = '//*[text()=\'' . $selectedPageTitle . '\']/../*[contains(@class, \'node-icon-container\')]';

        $isComposerMode = str_contains($scenario->current('env'), 'composer');
        $userId = $isComposerMode ? 3 : 2;
        $this->setUserTsConfig($I, $scenario, $userId, "options.impexp.enableImportForNonAdminUser = 1\noptions.impexp.enableExportForNonAdminUser = 1");
        $I->useExistingSession('editor');

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore]);
        $I->waitForElementVisible('#contentMenu1', 5);
        $I->seeElement($this->contextMenuImport);
        $I->seeElement($this->contextMenuExport);

        $I->useExistingSession('admin');
    }

    /**
     * @throws \Exception
     */
    public function hideImportCheckboxForceAllUidsForNonAdmin(ApplicationTester $I): void
    {
        $selectedPageTitle = 'Root';
        $selectedPageIcon = '//*[text()=\'' . $selectedPageTitle . '\']/../*[contains(@class, \'node-icon-container\')]';
        $importPageSectionTitle = 'Select file to import';

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->seeElement($this->checkboxForceAllUids);

        $I->useExistingSession('editor');

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->waitForText($importPageSectionTitle);
        $I->dontSeeElement($this->checkboxForceAllUids);

        $I->useExistingSession('admin');
    }

    /**
     * @throws \Exception
     */
    public function hideUploadTabAndImportPathIfNoImportFolderAvailable(ApplicationTester $I, PageTree $pageTree, Scenario $scenario): void
    {
        $selectedPageTitle = 'Root';
        $selectedPageIcon = '//*[text()=\'' . $selectedPageTitle . '\']/../*[contains(@class, \'node-icon-container\')]';
        $importPageSectionTitle = 'Select file to import';

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->see('From path:', $this->inModuleTabsBody);
        $I->seeElement($this->inModuleTabs . ' ' . $this->tabUpload);

        $I->useExistingSession('editor');

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->waitForText($importPageSectionTitle);
        $I->dontSee('From path:', $this->inModuleTabsBody);
        $I->dontSeeElement($this->inModuleTabs . ' ' . $this->tabUpload);

        $I->useExistingSession('admin');

        $this->setPageAccess($I, $pageTree, ['Root'], 0);
        $this->setModAccess($I, 1, ['web_list' => false]);
        $isComposerMode = str_contains($scenario->current('env'), 'composer');
        $userId = $isComposerMode ? 3 : 2;
        $this->setUserTsConfig($I, $scenario, $userId, '');
    }

    /**
     * @throws \Exception
     */
    public function checkVisualElements(ApplicationTester $I, PageTree $pageTree, Scenario $scenario): void
    {
        $selectedPageTitle = 'Root';
        $selectedPageIcon = '//*[text()=\'' . $selectedPageTitle . '\']/../*[contains(@class, \'node-icon-container\')]';
        $importPageSectionTitle = 'Select file to import';

        $I->click($this->inPageTree . ' #identifier-0_0 .node-icon-container');
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->waitForText($importPageSectionTitle);
        $I->dontSeeElement($this->inModuleHeader . ' ' . $this->buttonViewPage);

        $I->switchToMainFrame();

        $I->click('List');
        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->seeElement($this->inModuleHeader . ' ' . $this->buttonViewPage);

        $this->setPageAccess($I, $pageTree, ['Root'], 1);
        $this->setModAccess($I, 1, ['web_list' => true]);
        $isComposerMode = str_contains($scenario->current('env'), 'composer');
        $userId = $isComposerMode ? 3 : 2;
        $this->setUserTsConfig($I, $scenario, $userId, 'options.impexp.enableImportForNonAdminUser = 1');
        $I->useExistingSession('editor');

        $I->click($selectedPageIcon);
        $this->selectInContextMenu($I, [$this->contextMenuMore, $this->contextMenuImport]);
        $I->switchToContentFrame();
        $I->seeElement($this->inModuleHeader . ' ' . $this->buttonViewPage);

        $I->useExistingSession('admin');

        $this->setPageAccess($I, $pageTree, ['Root'], 0);
        $this->setModAccess($I, 1, ['web_list' => false]);
        $isComposerMode = str_contains($scenario->current('env'), 'composer');
        $userId = $isComposerMode ? 3 : 2;
        $this->setUserTsConfig($I, $scenario, $userId, '');
    }
}
