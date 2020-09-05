define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Renderable/ProgressBar', '../../Router', '../AbstractInteractableModule'], function (AjaxRequest, jquery, bootstrap, Modal, Notification, Severity, InfoBox, ProgressBar, Router, AbstractInteractableModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/FolderStructure
     */
    class FolderStructure extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorGridderBadge = '.t3js-folderStructure-badge';
            this.selectorOutputContainer = '.t3js-folderStructure-output';
            this.selectorErrorContainer = '.t3js-folderStructure-errors';
            this.selectorErrorList = '.t3js-folderStructure-errors-list';
            this.selectorErrorFixTrigger = '.t3js-folderStructure-errors-fix';
            this.selectorOkContainer = '.t3js-folderStructure-ok';
            this.selectorOkList = '.t3js-folderStructure-ok-list';
            this.selectorPermissionContainer = '.t3js-folderStructure-permissions';
        }
        static removeLoadingMessage($container) {
            $container.find('.alert-loading').remove();
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            // Get status on initialize to have the badge and content ready
            this.getStatus();
            currentModal.on('click', this.selectorErrorFixTrigger, (e) => {
                e.preventDefault();
                this.fix();
            });
        }
        getStatus() {
            const modalContent = this.getModalBody();
            const $errorBadge = jquery(this.selectorGridderBadge);
            $errorBadge.text('').hide();
            modalContent.find(this.selectorOutputContainer).empty().append(ProgressBar.render(Severity.loading, 'Loading...', ''));
            (new AjaxRequest(Router.getUrl('folderStructureGetStatus')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                modalContent.empty().append(data.html);
                Modal.setButtons(data.buttons);
                if (data.success === true && Array.isArray(data.errorStatus)) {
                    let errorCount = 0;
                    if (data.errorStatus.length > 0) {
                        modalContent.find(this.selectorErrorContainer).show();
                        modalContent.find(this.selectorErrorList).empty();
                        data.errorStatus.forEach(((aElement) => {
                            errorCount++;
                            $errorBadge.text(errorCount).show();
                            const aMessage = InfoBox.render(aElement.severity, aElement.title, aElement.message);
                            modalContent.find(this.selectorErrorList).append(aMessage);
                        }));
                    }
                    else {
                        modalContent.find(this.selectorErrorContainer).hide();
                    }
                }
                if (data.success === true && Array.isArray(data.okStatus)) {
                    if (data.okStatus.length > 0) {
                        modalContent.find(this.selectorOkContainer).show();
                        modalContent.find(this.selectorOkList).empty();
                        data.okStatus.forEach(((aElement) => {
                            const aMessage = InfoBox.render(aElement.severity, aElement.title, aElement.message);
                            modalContent.find(this.selectorOkList).append(aMessage);
                        }));
                    }
                    else {
                        modalContent.find(this.selectorOkContainer).hide();
                    }
                }
                let element = data.folderStructureFilePermissionStatus;
                modalContent.find(this.selectorPermissionContainer).empty().append(InfoBox.render(element.severity, element.title, element.message));
                element = data.folderStructureDirectoryPermissionStatus;
                modalContent.find(this.selectorPermissionContainer).append(InfoBox.render(element.severity, element.title, element.message));
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        fix() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const $outputContainer = this.findInModal(this.selectorOutputContainer);
            const message = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.empty().html(message);
            (new AjaxRequest(Router.getUrl('folderStructureFix')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                FolderStructure.removeLoadingMessage($outputContainer);
                if (data.success === true && Array.isArray(data.fixedStatus)) {
                    if (data.fixedStatus.length > 0) {
                        data.fixedStatus.forEach((element) => {
                            $outputContainer.append(InfoBox.render(element.severity, element.title, element.message));
                        });
                    }
                    else {
                        $outputContainer.append(InfoBox.render(Severity.warning, 'Nothing fixed', ''));
                    }
                    this.getStatus();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    var FolderStructure$1 = new FolderStructure();

    return FolderStructure$1;

});
