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
     * Module: TYPO3/CMS/Install/Module/CreateAdmin
     */
    class CreateAdmin extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorAdminCreateButton = '.t3js-createAdmin-create';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
            currentModal.on('click', this.selectorAdminCreateButton, (e) => {
                e.preventDefault();
                this.create();
            });
            currentModal.on('click', '.t3-install-form-password-strength', () => {
                PasswordStrength.initialize('.t3-install-form-password-strength');
            });
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('createAdminGetData')))
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
        create() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('create-admin-token');
            const payload = {
                install: {
                    action: 'createAdmin',
                    token: executeToken,
                    userName: this.findInModal('.t3js-createAdmin-user').val(),
                    userPassword: this.findInModal('.t3js-createAdmin-password').val(),
                    userPasswordCheck: this.findInModal('.t3js-createAdmin-password-check').val(),
                    userEmail: this.findInModal('.t3js-createAdmin-email').val(),
                    userSystemMaintainer: (this.findInModal('.t3js-createAdmin-system-maintainer').is(':checked')) ? 1 : 0,
                },
            };
            this.getModuleContent().find(':input').prop('disabled', true);
            (new AjaxRequest(Router.getUrl())).post(payload).then(async (response) => {
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
                this.setModalButtonsState(true);
                this.getModuleContent().find(':input').prop('disabled', false);
                this.findInModal('.t3js-createAdmin-user').val('');
                this.findInModal('.t3js-createAdmin-password').val('');
                this.findInModal('.t3js-createAdmin-password-check').val('');
                this.findInModal('.t3js-createAdmin-email').val('');
                this.findInModal('.t3js-createAdmin-system-maintainer').prop('checked', false);
            });
        }
    }
    new CreateAdmin();

});
