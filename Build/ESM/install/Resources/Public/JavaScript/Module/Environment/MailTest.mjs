import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import 'bootstrap';
import Modal from '../../../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.mjs';
import { AbstractInteractableModule } from '../AbstractInteractableModule.mjs';
import Severity from '../../Renderable/Severity.mjs';
import InfoBox from '../../Renderable/InfoBox.mjs';
import ProgressBar from '../../Renderable/ProgressBar.mjs';
import Router from '../../Router.mjs';

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
class MailTest extends AbstractInteractableModule {
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
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
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
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, () => {
            // 500 can happen here if the mail configuration is broken
            NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
        }).finally(() => {
            this.setModalButtonsState(true);
        });
    }
}
var MailTest$1 = new MailTest();

export default MailTest$1;
