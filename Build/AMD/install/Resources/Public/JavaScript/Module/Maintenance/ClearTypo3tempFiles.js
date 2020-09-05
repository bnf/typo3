define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Router', '../AbstractInteractableModule'], function (AjaxRequest, jquery, Modal, Notification, Router, AbstractInteractableModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/ClearTypo3tempFiles
     */
    class ClearTypo3tempFiles extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorDeleteTrigger = '.t3js-clearTypo3temp-delete';
            this.selectorOutputContainer = '.t3js-clearTypo3temp-output';
            this.selectorStatContainer = '.t3js-clearTypo3temp-stat-container';
            this.selectorStatsTrigger = '.t3js-clearTypo3temp-stats';
            this.selectorStatTemplate = '.t3js-clearTypo3temp-stat-template';
            this.selectorStatNumberOfFiles = '.t3js-clearTypo3temp-stat-numberOfFiles';
            this.selectorStatDirectory = '.t3js-clearTypo3temp-stat-directory';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getStats();
            currentModal.on('click', this.selectorStatsTrigger, (e) => {
                e.preventDefault();
                jquery(this.selectorOutputContainer).empty();
                this.getStats();
            });
            currentModal.on('click', this.selectorDeleteTrigger, (e) => {
                const folder = jquery(e.currentTarget).data('folder');
                const storageUid = jquery(e.currentTarget).data('storage-uid');
                e.preventDefault();
                this.delete(folder, storageUid);
            });
        }
        getStats() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('clearTypo3tempFilesStats')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                    if (Array.isArray(data.stats) && data.stats.length > 0) {
                        data.stats.forEach((element) => {
                            if (element.numberOfFiles > 0) {
                                const aStat = modalContent.find(this.selectorStatTemplate).clone();
                                aStat.find(this.selectorStatNumberOfFiles).text(element.numberOfFiles);
                                aStat.find(this.selectorStatDirectory).text(element.directory);
                                aStat.find(this.selectorDeleteTrigger).attr('data-folder', element.directory);
                                aStat.find(this.selectorDeleteTrigger).attr('data-storage-uid', element.storageUid);
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
        delete(folder, storageUid) {
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('clear-typo3temp-delete-token');
            (new AjaxRequest(Router.getUrl()))
                .post({
                install: {
                    action: 'clearTypo3tempFiles',
                    token: executeToken,
                    folder: folder,
                    storageUid: storageUid,
                },
            })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.success(element.title, element.message);
                    });
                    this.getStats();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    var ClearTypo3tempFiles$1 = new ClearTypo3tempFiles();

    return ClearTypo3tempFiles$1;

});
