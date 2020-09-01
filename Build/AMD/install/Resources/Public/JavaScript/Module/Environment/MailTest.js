define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', 'bootstrap', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../AbstractInteractableModule', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Renderable/ProgressBar', '../../Router'], function (AjaxRequest, bootstrap, Modal, Notification, AbstractInteractableModule, Severity, InfoBox, ProgressBar, Router) { 'use strict';

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
    class MailTest extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorOutputContainer = '.t3js-mailTest-output';
            this.selectorMailTestButton = '.t3js-mailTest-execute';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
            currentModal.on('click', this.selectorMailTestButton, (e) => {
                e.preventDefault();
                this.send();
            });
            currentModal.on('submit', 'form', (e) => {
                e.preventDefault();
                this.send();
            });
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('mailTestGetData')))
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
        send() {
            this.setModalButtonsState(false);
            const executeToken = this.getModuleContent().data('mail-test-token');
            const $outputContainer = this.findInModal(this.selectorOutputContainer);
            const message = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.empty().html(message);
            (new AjaxRequest(Router.getUrl())).post({
                install: {
                    action: 'mailTest',
                    token: executeToken,
                    email: this.findInModal('.t3js-mailTest-email').val(),
                },
            }).then(async (response) => {
                const data = await response.resolve();
                $outputContainer.empty();
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        const aMessage = InfoBox.render(element.severity, element.title, element.message);
                        $outputContainer.html(aMessage);
                    });
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, () => {
                // 500 can happen here if the mail configuration is broken
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }).finally(() => {
                this.setModalButtonsState(true);
            });
        }
    }
    var MailTest$1 = new MailTest();

    return MailTest$1;

});
