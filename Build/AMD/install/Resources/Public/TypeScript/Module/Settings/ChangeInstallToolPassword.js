define(['../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', '../../../../../../backend/Resources/Public/TypeScript/Modal', '../../../../../../backend/Resources/Public/TypeScript/Notification', '../AbstractInteractableModule', '../../Router', '../PasswordStrength'], function (AjaxRequest, Modal, Notification, AbstractInteractableModule, Router, PasswordStrength) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/ChangeInstallToolPassword
     */
    class ChangeInstallToolPassword extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorChangeButton = '.t3js-changeInstallToolPassword-change';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
            currentModal.on('click', this.selectorChangeButton, (e) => {
                e.preventDefault();
                this.change();
            });
            currentModal.on('click', '.t3-install-form-password-strength', () => {
                PasswordStrength.initialize('.t3-install-form-password-strength');
            });
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('changeInstallToolPasswordGetData')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        change() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('install-tool-token');
            (new AjaxRequest(Router.getUrl())).post({
                install: {
                    action: 'changeInstallToolPassword',
                    token: executeToken,
                    password: this.findInModal('.t3js-changeInstallToolPassword-password').val(),
                    passwordCheck: this.findInModal('.t3js-changeInstallToolPassword-password-check').val(),
                },
            }).then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.showMessage(element.title, element.message, element.severity);
                    });
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            }).finally(() => {
                this.findInModal('.t3js-changeInstallToolPassword-password,.t3js-changeInstallToolPassword-password-check').val('');
                this.setModalButtonsState(true);
            });
        }
    }
    new ChangeInstallToolPassword();

});
