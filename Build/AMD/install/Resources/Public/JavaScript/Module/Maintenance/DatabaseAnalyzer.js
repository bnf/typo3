define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Renderable/ProgressBar', '../../Router', '../AbstractInteractableModule'], function (AjaxRequest, jquery, Modal, Notification, Severity, InfoBox, ProgressBar, Router, AbstractInteractableModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/DatabaseAnalyzer
     */
    class DatabaseAnalyzer extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorAnalyzeTrigger = '.t3js-databaseAnalyzer-analyze';
            this.selectorExecuteTrigger = '.t3js-databaseAnalyzer-execute';
            this.selectorOutputContainer = '.t3js-databaseAnalyzer-output';
            this.selectorSuggestionBlock = '.t3js-databaseAnalyzer-suggestion-block';
            this.selectorSuggestionList = '.t3js-databaseAnalyzer-suggestion-list';
            this.selectorSuggestionLineTemplate = '.t3js-databaseAnalyzer-suggestion-line-template';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
            // Select / deselect all checkboxes
            currentModal.on('click', '.t3js-databaseAnalyzer-suggestion-block-checkbox', (e) => {
                const $element = jquery(e.currentTarget);
                $element.closest('fieldset').find(':checkbox').prop('checked', $element.get(0).checked);
            });
            currentModal.on('click', this.selectorAnalyzeTrigger, (e) => {
                e.preventDefault();
                this.analyze();
            });
            currentModal.on('click', this.selectorExecuteTrigger, (e) => {
                e.preventDefault();
                this.execute();
            });
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('databaseAnalyzer')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                    this.analyze();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        analyze() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const modalFooter = this.getModalFooter();
            const outputContainer = modalContent.find(this.selectorOutputContainer);
            const executeTrigger = modalFooter.find(this.selectorExecuteTrigger);
            const analyzeTrigger = modalFooter.find(this.selectorAnalyzeTrigger);
            outputContainer.empty().append(ProgressBar.render(Severity.loading, 'Analyzing current database schema...', ''));
            outputContainer.on('change', 'input[type="checkbox"]', () => {
                const hasCheckedCheckboxes = outputContainer.find(':checked').length > 0;
                this.setModalButtonState(executeTrigger, hasCheckedCheckboxes);
            });
            (new AjaxRequest(Router.getUrl('databaseAnalyzerAnalyze')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    if (Array.isArray(data.status)) {
                        outputContainer.find('.alert-loading').remove();
                        data.status.forEach((element) => {
                            const message = InfoBox.render(element.severity, element.title, element.message);
                            outputContainer.append(message);
                        });
                    }
                    if (Array.isArray(data.suggestions)) {
                        data.suggestions.forEach((element) => {
                            const aBlock = modalContent.find(this.selectorSuggestionBlock).clone();
                            aBlock.removeClass(this.selectorSuggestionBlock.substr(1));
                            const key = element.key;
                            aBlock.find('.t3js-databaseAnalyzer-suggestion-block-legend').text(element.label);
                            aBlock.find('.t3js-databaseAnalyzer-suggestion-block-checkbox').attr('id', 't3-install-' + key + '-checkbox');
                            if (element.enabled) {
                                aBlock.find('.t3js-databaseAnalyzer-suggestion-block-checkbox').attr('checked', 'checked');
                            }
                            aBlock.find('.t3js-databaseAnalyzer-suggestion-block-label').attr('for', 't3-install-' + key + '-checkbox');
                            element.children.forEach((line) => {
                                const aLine = modalContent.find(this.selectorSuggestionLineTemplate).children().clone();
                                const hash = line.hash;
                                const $checkbox = aLine.find('.t3js-databaseAnalyzer-suggestion-line-checkbox');
                                $checkbox.attr('id', 't3-install-db-' + hash).attr('data-hash', hash);
                                if (element.enabled) {
                                    $checkbox.attr('checked', 'checked');
                                }
                                aLine.find('.t3js-databaseAnalyzer-suggestion-line-label').attr('for', 't3-install-db-' + hash);
                                aLine.find('.t3js-databaseAnalyzer-suggestion-line-statement').text(line.statement);
                                if (typeof line.current !== 'undefined') {
                                    aLine.find('.t3js-databaseAnalyzer-suggestion-line-current-value').text(line.current);
                                    aLine.find('.t3js-databaseAnalyzer-suggestion-line-current').show();
                                }
                                if (typeof line.rowCount !== 'undefined') {
                                    aLine.find('.t3js-databaseAnalyzer-suggestion-line-count-value').text(line.rowCount);
                                    aLine.find('.t3js-databaseAnalyzer-suggestion-line-count').show();
                                }
                                aBlock.find(this.selectorSuggestionList).append(aLine);
                            });
                            outputContainer.append(aBlock.html());
                        });
                        this.setModalButtonState(analyzeTrigger, true);
                        this.setModalButtonState(executeTrigger, outputContainer.find(':checked').length > 0);
                    }
                    if (data.suggestions.length === 0 && data.status.length === 0) {
                        outputContainer.append(InfoBox.render(Severity.ok, 'Database schema is up to date. Good job!', ''));
                    }
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        execute() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('database-analyzer-execute-token');
            const outputContainer = modalContent.find(this.selectorOutputContainer);
            const selectedHashes = [];
            outputContainer.find('.t3js-databaseAnalyzer-suggestion-line input:checked').each((index, element) => {
                selectedHashes.push(jquery(element).data('hash'));
            });
            outputContainer.empty().append(ProgressBar.render(Severity.loading, 'Executing database updates...', ''));
            (new AjaxRequest(Router.getUrl()))
                .post({
                install: {
                    action: 'databaseAnalyzerExecute',
                    token: executeToken,
                    hashes: selectedHashes,
                },
            })
                .then(async (response) => {
                const data = await response.resolve();
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.showMessage(element.title, element.message, element.severity);
                    });
                }
                this.analyze();
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    var DatabaseAnalyzer$1 = new DatabaseAnalyzer();

    return DatabaseAnalyzer$1;

});
