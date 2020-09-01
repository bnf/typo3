define(['jquery', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', '../../../../../../backend/Resources/Public/TypeScript/Modal', '../../../../../../backend/Resources/Public/TypeScript/Notification', '../AbstractInteractableModule', '../../Router'], function ($, AjaxRequest, Modal, Notification, AbstractInteractableModule, Router) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
     * Module: TYPO3/CMS/Install/Module/ClearTables
     */
    class ClearTables extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorClearTrigger = '.t3js-clearTables-clear';
            this.selectorStatsTrigger = '.t3js-clearTables-stats';
            this.selectorOutputContainer = '.t3js-clearTables-output';
            this.selectorStatContainer = '.t3js-clearTables-stat-container';
            this.selectorStatTemplate = '.t3js-clearTables-stat-template';
            this.selectorStatDescription = '.t3js-clearTables-stat-description';
            this.selectorStatRows = '.t3js-clearTables-stat-rows';
            this.selectorStatName = '.t3js-clearTables-stat-name';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getStats();
            currentModal.on('click', this.selectorStatsTrigger, (e) => {
                e.preventDefault();
                $__default['default'](this.selectorOutputContainer).empty();
                this.getStats();
            });
            currentModal.on('click', this.selectorClearTrigger, (e) => {
                const table = $__default['default'](e.target).closest(this.selectorClearTrigger).data('table');
                e.preventDefault();
                this.clear(table);
            });
        }
        getStats() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('clearTablesStats')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                    if (Array.isArray(data.stats) && data.stats.length > 0) {
                        data.stats.forEach((element) => {
                            if (element.rowCount > 0) {
                                const aStat = modalContent.find(this.selectorStatTemplate).clone();
                                aStat.find(this.selectorStatDescription).text(element.description);
                                aStat.find(this.selectorStatName).text(element.name);
                                aStat.find(this.selectorStatRows).text(element.rowCount);
                                aStat.find(this.selectorClearTrigger).attr('data-table', element.name);
                                modalContent.find(this.selectorStatContainer).append(aStat.html());
                            }
                        });
                    }
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        clear(table) {
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('clear-tables-clear-token');
            (new AjaxRequest(Router.getUrl()))
                .post({
                install: {
                    action: 'clearTablesClear',
                    token: executeToken,
                    table: table,
                },
            })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.success(element.title, element.message);
                    });
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
                this.getStats();
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    new ClearTables();

});
