import $ from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import SecurityUtility from '../../../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import { AbstractInteractableModule } from '../AbstractInteractableModule.esm.js';
import Severity from '../../Renderable/Severity.esm.js';
import InfoBox from '../../Renderable/InfoBox.esm.js';
import ProgressBar from '../../Renderable/ProgressBar.esm.js';
import Router from '../../Router.esm.js';
import FlashMessage from '../../Renderable/FlashMessage.esm.js';

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
/**
 * Module: TYPO3/CMS/Install/Module/UpgradeWizards
 */
class UpgradeWizards extends AbstractInteractableModule {
    constructor() {
        super();
        this.selectorOutputWizardsContainer = '.t3js-upgradeWizards-wizards-output';
        this.selectorOutputDoneContainer = '.t3js-upgradeWizards-done-output';
        this.selectorWizardsBlockingAddsTemplate = '.t3js-upgradeWizards-blocking-adds-template';
        this.selectorWizardsBlockingAddsRows = '.t3js-upgradeWizards-blocking-adds-rows';
        this.selectorWizardsBlockingAddsExecute = '.t3js-upgradeWizards-blocking-adds-execute';
        this.selectorWizardsBlockingCharsetTemplate = '.t3js-upgradeWizards-blocking-charset-template';
        this.selectorWizardsBlockingCharsetFix = '.t3js-upgradeWizards-blocking-charset-fix';
        this.selectorWizardsDoneBodyTemplate = '.t3js-upgradeWizards-done-body-template';
        this.selectorWizardsDoneRows = '.t3js-upgradeWizards-done-rows';
        this.selectorWizardsDoneRowTemplate = '.t3js-upgradeWizards-done-row-template table tr';
        this.selectorWizardsDoneRowMarkUndone = '.t3js-upgradeWizards-done-markUndone';
        this.selectorWizardsDoneRowTitle = '.t3js-upgradeWizards-done-title';
        this.selectorWizardsListTemplate = '.t3js-upgradeWizards-list-template';
        this.selectorWizardsListRows = '.t3js-upgradeWizards-list-rows';
        this.selectorWizardsListRowTemplate = '.t3js-upgradeWizards-list-row-template';
        this.selectorWizardsListRowTitle = '.t3js-upgradeWizards-list-row-title';
        this.selectorWizardsListRowExplanation = '.t3js-upgradeWizards-list-row-explanation';
        this.selectorWizardsListRowExecute = '.t3js-upgradeWizards-list-row-execute';
        this.selectorWizardsInputTemplate = '.t3js-upgradeWizards-input';
        this.selectorWizardsInputTitle = '.t3js-upgradeWizards-input-title';
        this.selectorWizardsInputHtml = '.t3js-upgradeWizards-input-html';
        this.selectorWizardsInputPerform = '.t3js-upgradeWizards-input-perform';
        this.securityUtility = new SecurityUtility();
    }
    static removeLoadingMessage($container) {
        $container.find('.alert-loading').remove();
    }
    static renderProgressBar(title) {
        return ProgressBar.render(Severity.loading, title, '');
    }
    initialize(currentModal) {
        this.currentModal = currentModal;
        this.getData().done(() => {
            this.doneUpgrades();
        });
        // Mark a done wizard undone
        currentModal.on('click', this.selectorWizardsDoneRowMarkUndone, (e) => {
            this.markUndone(e.target.dataset.identifier);
        });
        // Execute "fix default mysql connection db charset" blocking wizard
        currentModal.on('click', this.selectorWizardsBlockingCharsetFix, () => {
            this.blockingUpgradesDatabaseCharsetFix();
        });
        // Execute "add required fields + tables" blocking wizard
        currentModal.on('click', this.selectorWizardsBlockingAddsExecute, () => {
            this.blockingUpgradesDatabaseAddsExecute();
        });
        // Get user input of a single upgrade wizard
        currentModal.on('click', this.selectorWizardsListRowExecute, (e) => {
            this.wizardInput(e.target.dataset.identifier, e.target.dataset.title);
        });
        // Execute one upgrade wizard
        currentModal.on('click', this.selectorWizardsInputPerform, (e) => {
            this.wizardExecute(e.target.dataset.identifier, e.target.dataset.title);
        });
    }
    getData() {
        const modalContent = this.getModalBody();
        return (new AjaxRequest(Router.getUrl('upgradeWizardsGetData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.empty().append(data.html);
                this.blockingUpgradesDatabaseCharsetTest();
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error);
        });
    }
    blockingUpgradesDatabaseCharsetTest() {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Checking database charset...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsBlockingDatabaseCharsetTest')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            if (data.success === true) {
                if (data.needsUpdate === true) {
                    modalContent.find(this.selectorOutputWizardsContainer)
                        .append(modalContent.find(this.selectorWizardsBlockingCharsetTemplate)).clone();
                }
                else {
                    this.blockingUpgradesDatabaseAdds();
                }
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    blockingUpgradesDatabaseCharsetFix() {
        const $outputContainer = $(this.selectorOutputWizardsContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Setting database charset to UTF-8...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsBlockingDatabaseCharsetFix')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            if (data.success === true) {
                if (Array.isArray(data.status) && data.status.length > 0) {
                    data.status.forEach((element) => {
                        const message = InfoBox.render(element.severity, element.title, element.message);
                        $outputContainer.append(message);
                    });
                }
            }
            else {
                const message = FlashMessage.render(Severity.error, 'Something went wrong', '');
                UpgradeWizards.removeLoadingMessage($outputContainer);
                $outputContainer.append(message);
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    blockingUpgradesDatabaseAdds() {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Check for missing mandatory database tables and fields...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsBlockingDatabaseAdds')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            if (data.success === true) {
                if (data.needsUpdate === true) {
                    const adds = modalContent.find(this.selectorWizardsBlockingAddsTemplate).clone();
                    if (typeof (data.adds.tables) === 'object') {
                        data.adds.tables.forEach((element) => {
                            const title = 'Table: ' + this.securityUtility.encodeHtml(element.table);
                            adds.find(this.selectorWizardsBlockingAddsRows).append(title, '<br>');
                        });
                    }
                    if (typeof (data.adds.columns) === 'object') {
                        data.adds.columns.forEach((element) => {
                            const title = 'Table: ' + this.securityUtility.encodeHtml(element.table)
                                + ', Field: ' + this.securityUtility.encodeHtml(element.field);
                            adds.find(this.selectorWizardsBlockingAddsRows).append(title, '<br>');
                        });
                    }
                    if (typeof (data.adds.indexes) === 'object') {
                        data.adds.indexes.forEach((element) => {
                            const title = 'Table: ' + this.securityUtility.encodeHtml(element.table)
                                + ', Index: ' + this.securityUtility.encodeHtml(element.index);
                            adds.find(this.selectorWizardsBlockingAddsRows).append(title, '<br>');
                        });
                    }
                    modalContent.find(this.selectorOutputWizardsContainer).append(adds);
                }
                else {
                    this.wizardsList();
                }
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error);
        });
    }
    blockingUpgradesDatabaseAddsExecute() {
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Adding database tables and fields...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsBlockingDatabaseExecute')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            if (data.success === true) {
                if (Array.isArray(data.status) && data.status.length > 0) {
                    data.status.forEach((element) => {
                        const message = InfoBox.render(element.severity, element.title, element.message);
                        $outputContainer.append(message);
                    });
                    this.wizardsList();
                }
            }
            else {
                const message = FlashMessage.render(Severity.error, 'Something went wrong', '');
                UpgradeWizards.removeLoadingMessage($outputContainer);
                $outputContainer.append(message);
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    wizardsList() {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        $outputContainer.append(UpgradeWizards.renderProgressBar('Loading upgrade wizards...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsList')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            const list = modalContent.find(this.selectorWizardsListTemplate).clone();
            list.removeClass('t3js-upgradeWizards-list-template');
            if (data.success === true) {
                let numberOfWizardsTodo = 0;
                let numberOfWizards = 0;
                if (Array.isArray(data.wizards) && data.wizards.length > 0) {
                    numberOfWizards = data.wizards.length;
                    data.wizards.forEach((element) => {
                        if (element.shouldRenderWizard === true) {
                            const aRow = modalContent.find(this.selectorWizardsListRowTemplate).clone();
                            numberOfWizardsTodo = numberOfWizardsTodo + 1;
                            aRow.removeClass('t3js-upgradeWizards-list-row-template');
                            aRow.find(this.selectorWizardsListRowTitle).empty().text(element.title);
                            aRow.find(this.selectorWizardsListRowExplanation).empty().text(element.explanation);
                            aRow.find(this.selectorWizardsListRowExecute).attr('data-identifier', element.identifier).attr('data-title', element.title);
                            list.find(this.selectorWizardsListRows).append(aRow);
                        }
                    });
                    list.find(this.selectorWizardsListRows + ' hr:last').remove();
                }
                let percent = 100;
                const $progressBar = list.find('.progress-bar');
                if (numberOfWizardsTodo > 0) {
                    percent = Math.round((numberOfWizards - numberOfWizardsTodo) / data.wizards.length * 100);
                }
                else {
                    $progressBar
                        .removeClass('progress-bar-info')
                        .addClass('progress-bar-success');
                }
                $progressBar
                    .removeClass('progress-bar-striped')
                    .css('width', percent + '%')
                    .attr('aria-valuenow', percent)
                    .find('span')
                    .text(percent + '%');
                modalContent.find(this.selectorOutputWizardsContainer).append(list);
                this.findInModal(this.selectorWizardsDoneRowMarkUndone).prop('disabled', false);
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error);
        });
    }
    wizardInput(identifier, title) {
        const executeToken = this.getModuleContent().data('upgrade-wizards-input-token');
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Loading "' + title + '"...'));
        modalContent.animate({
            scrollTop: modalContent.scrollTop() - Math.abs(modalContent.find('.t3js-upgrade-status-section').position().top),
        }, 250);
        (new AjaxRequest(Router.getUrl('upgradeWizardsInput')))
            .post({
            install: {
                action: 'upgradeWizardsInput',
                token: executeToken,
                identifier: identifier,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            $outputContainer.empty();
            const input = modalContent.find(this.selectorWizardsInputTemplate).clone();
            input.removeClass('t3js-upgradeWizards-input');
            if (data.success === true) {
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        const message = FlashMessage.render(element.severity, element.title, element.message);
                        $outputContainer.append(message);
                    });
                }
                if (data.userInput.wizardHtml.length > 0) {
                    input.find(this.selectorWizardsInputHtml).html(data.userInput.wizardHtml);
                }
                input.find(this.selectorWizardsInputTitle).text(data.userInput.title);
                input.find(this.selectorWizardsInputPerform)
                    .attr('data-identifier', data.userInput.identifier)
                    .attr('data-title', data.userInput.title);
            }
            modalContent.find(this.selectorOutputWizardsContainer).append(input);
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    wizardExecute(identifier, title) {
        const executeToken = this.getModuleContent().data('upgrade-wizards-execute-token');
        const modalContent = this.getModalBody();
        const postData = {
            'install[action]': 'upgradeWizardsExecute',
            'install[token]': executeToken,
            'install[identifier]': identifier,
        };
        $(this.findInModal(this.selectorOutputWizardsContainer + ' form').serializeArray()).each((index, element) => {
            postData[element.name] = element.value;
        });
        const $outputContainer = this.findInModal(this.selectorOutputWizardsContainer);
        // modalContent.find(this.selectorOutputWizardsContainer).empty();
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Executing "' + title + '"...'));
        this.findInModal(this.selectorWizardsDoneRowMarkUndone).prop('disabled', true);
        (new AjaxRequest(Router.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            $outputContainer.empty();
            if (data.success === true) {
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        const message = InfoBox.render(element.severity, element.title, element.message);
                        $outputContainer.append(message);
                    });
                }
                this.wizardsList();
                modalContent.find(this.selectorOutputDoneContainer).empty();
                this.doneUpgrades();
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    doneUpgrades() {
        const modalContent = this.getModalBody();
        const $outputContainer = modalContent.find(this.selectorOutputDoneContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Loading executed upgrade wizards...'));
        (new AjaxRequest(Router.getUrl('upgradeWizardsDoneUpgrades')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            UpgradeWizards.removeLoadingMessage($outputContainer);
            if (data.success === true) {
                if (Array.isArray(data.status) && data.status.length > 0) {
                    data.status.forEach((element) => {
                        const message = InfoBox.render(element.severity, element.title, element.message);
                        $outputContainer.append(message);
                    });
                }
                const body = modalContent.find(this.selectorWizardsDoneBodyTemplate).clone();
                const $wizardsDoneContainer = body.find(this.selectorWizardsDoneRows);
                let hasBodyContent = false;
                if (Array.isArray(data.wizardsDone) && data.wizardsDone.length > 0) {
                    data.wizardsDone.forEach((element) => {
                        hasBodyContent = true;
                        const aRow = modalContent.find(this.selectorWizardsDoneRowTemplate).clone();
                        aRow.find(this.selectorWizardsDoneRowMarkUndone).attr('data-identifier', element.identifier);
                        aRow.find(this.selectorWizardsDoneRowTitle).text(element.title);
                        $wizardsDoneContainer.append(aRow);
                    });
                }
                if (Array.isArray(data.rowUpdatersDone) && data.rowUpdatersDone.length > 0) {
                    data.rowUpdatersDone.forEach((element) => {
                        hasBodyContent = true;
                        const aRow = modalContent.find(this.selectorWizardsDoneRowTemplate).clone();
                        aRow.find(this.selectorWizardsDoneRowMarkUndone).attr('data-identifier', element.identifier);
                        aRow.find(this.selectorWizardsDoneRowTitle).text(element.title);
                        $wizardsDoneContainer.append(aRow);
                    });
                }
                if (hasBodyContent) {
                    modalContent.find(this.selectorOutputDoneContainer).append(body);
                    this.findInModal(this.selectorWizardsDoneRowMarkUndone).prop('disabled', true);
                }
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
    markUndone(identifier) {
        const executeToken = this.getModuleContent().data('upgrade-wizards-mark-undone-token');
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputDoneContainer);
        $outputContainer.empty().html(UpgradeWizards.renderProgressBar('Marking upgrade wizard as undone...'));
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'upgradeWizardsMarkUndone',
                token: executeToken,
                identifier: identifier,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            $outputContainer.empty();
            modalContent.find(this.selectorOutputDoneContainer).empty();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    NotificationService.success(element.title, element.message);
                    this.doneUpgrades();
                    this.blockingUpgradesDatabaseCharsetTest();
                });
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, $outputContainer);
        });
    }
}
var UpgradeWizards$1 = new UpgradeWizards();

export default UpgradeWizards$1;
