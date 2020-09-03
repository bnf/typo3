import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.mjs';
import Modal from '../../../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.mjs';
import { AbstractInteractableModule } from '../AbstractInteractableModule.mjs';
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
 * Module: TYPO3/CMS/Install/Module/Presets
 */
class Presets extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.selectorActivateTrigger = '.t3js-presets-activate';
        this.selectorImageExecutable = '.t3js-presets-image-executable';
        this.selectorImageExecutableTrigger = '.t3js-presets-image-executable-trigger';
    }
    initialize(currentModal) {
        this.currentModal = currentModal;
        this.getContent();
        // Load content with post data on click 'custom image executable path'
        currentModal.on('click', this.selectorImageExecutableTrigger, (e) => {
            e.preventDefault();
            this.getCustomImagePathContent();
        });
        // Write out selected preset
        currentModal.on('click', this.selectorActivateTrigger, (e) => {
            e.preventDefault();
            this.activate();
        });
        // Automatically select the custom preset if a value in one of its input fields is changed
        currentModal.find('.t3js-custom-preset').on('input', '.t3js-custom-preset', (e) => {
            jQuery('#' + jQuery(e.currentTarget).data('radio')).prop('checked', true);
        });
    }
    getContent() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('presetsGetContent')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
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
    getCustomImagePathContent() {
        const modalContent = this.getModalBody();
        const presetsContentToken = this.getModuleContent().data('presets-content-token');
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                token: presetsContentToken,
                action: 'presetsGetContent',
                values: {
                    Image: {
                        additionalSearchPath: this.findInModal(this.selectorImageExecutable).val(),
                    },
                },
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                modalContent.empty().append(data.html);
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    activate() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().data('presets-activate-token');
        const postData = {};
        jQuery(this.findInModal('form').serializeArray()).each((index, element) => {
            postData[element.name] = element.value;
        });
        postData['install[action]'] = 'presetsActivate';
        postData['install[token]'] = executeToken;
        (new AjaxRequest(Router.getUrl())).post(postData).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    NotificationService.showMessage(element.title, element.message, element.severity);
                });
            }
            else {
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.setModalButtonsState(true);
        });
    }
}
var Presets$1 = new Presets();

export default Presets$1;
