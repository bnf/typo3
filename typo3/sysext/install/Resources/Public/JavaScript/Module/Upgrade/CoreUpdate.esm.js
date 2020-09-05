import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import $ from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from '../../../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import Severity from '../../Renderable/Severity.esm.js';
import Router from '../../Router.esm.js';
import { AbstractInteractableModule } from '../AbstractInteractableModule.esm.js';
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
class CoreUpdate extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.actionQueue = {
            coreUpdateIsUpdateAvailable: {
                loadingMessage: 'Checking for possible regular or security update',
                finishMessage: undefined,
                nextActionName: undefined,
            },
            coreUpdateCheckPreConditions: {
                loadingMessage: 'Checking if update is possible',
                finishMessage: 'System can be updated',
                nextActionName: 'coreUpdateDownload',
            },
            coreUpdateDownload: {
                loadingMessage: 'Downloading new core',
                finishMessage: undefined,
                nextActionName: 'coreUpdateVerifyChecksum',
            },
            coreUpdateVerifyChecksum: {
                loadingMessage: 'Verifying checksum of downloaded core',
                finishMessage: undefined,
                nextActionName: 'coreUpdateUnpack',
            },
            coreUpdateUnpack: {
                loadingMessage: 'Unpacking core',
                finishMessage: undefined,
                nextActionName: 'coreUpdateMove',
            },
            coreUpdateMove: {
                loadingMessage: 'Moving core',
                finishMessage: undefined,
                nextActionName: 'coreUpdateActivate',
            },
            coreUpdateActivate: {
                loadingMessage: 'Activating core',
                finishMessage: 'Core updated - please reload your browser',
                nextActionName: undefined,
            },
        };
        this.selectorOutput = '.t3js-coreUpdate-output';
        this.updateButton = '.t3js-coreUpdate-button';
        /**
         * Clone of a DOM object acts as button template
         */
        this.buttonTemplate = null;
    }
    /**
     * Fetching the templates out of the DOM
     */
    initialize(currentModal) {
        this.currentModal = currentModal;
        this.getData().then(() => {
            this.buttonTemplate = this.findInModal(this.updateButton).clone();
        });
        currentModal.on('click', '.t3js-coreUpdate-init', (e) => {
            e.preventDefault();
            // Don't use jQuery's data() function, as the DOM is re-rendered and any set data attribute gets lost.
            // See showActionButton()
            const action = $(e.currentTarget).attr('data-action');
            this.findInModal(this.selectorOutput).empty();
            switch (action) {
                case 'checkForUpdate':
                    this.callAction('coreUpdateIsUpdateAvailable');
                    break;
                case 'updateDevelopment':
                    this.update('development');
                    break;
                case 'updateRegular':
                    this.update('regular');
                    break;
                default:
                    throw 'Unknown update action "' + action + '"';
            }
        });
    }
    getData() {
        const modalContent = this.getModalBody();
        return (new AjaxRequest(Router.getUrl('coreUpdateGetData')))
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
    /**
     * Execute core update.
     *
     * @param type Either 'development' or 'regular'
     */
    update(type) {
        if (type !== 'development') {
            type = 'regular';
        }
        this.callAction('coreUpdateCheckPreConditions', type);
    }
    /**
     * Generic method to call actions from the queue
     *
     * @param actionName Name of the action to be called
     * @param type Update type (optional)
     */
    callAction(actionName, type) {
        const data = {
            install: {
                action: actionName,
            },
        };
        if (type !== undefined) {
            data.install.type = type;
        }
        this.addLoadingMessage(this.actionQueue[actionName].loadingMessage);
        (new AjaxRequest(Router.getUrl()))
            .withQueryArguments(data)
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const result = await response.resolve();
            const canContinue = this.handleResult(result, this.actionQueue[actionName].finishMessage);
            if (canContinue === true && (this.actionQueue[actionName].nextActionName !== undefined)) {
                this.callAction(this.actionQueue[actionName].nextActionName, type);
            }
        }, (error) => {
            Router.handleAjaxError(error, this.getModalBody());
        });
    }
    /**
     * Handle ajax result of core update step.
     */
    handleResult(data, successMessage) {
        const canContinue = data.success;
        this.removeLoadingMessage();
        if (data.status && typeof (data.status) === 'object') {
            this.showStatusMessages(data.status);
        }
        if (data.action && typeof (data.action) === 'object') {
            this.showActionButton(data.action);
        }
        if (successMessage) {
            this.addMessage(Severity.ok, successMessage);
        }
        return canContinue;
    }
    /**
     * Add a loading message with some text.
     *
     * @param messageTitle
     */
    addLoadingMessage(messageTitle) {
        const domMessage = FlashMessage.render(Severity.loading, messageTitle);
        this.findInModal(this.selectorOutput).append(domMessage);
    }
    /**
     * Remove an enabled loading message
     */
    removeLoadingMessage() {
        this.findInModal(this.selectorOutput).find('.alert-loading').remove();
    }
    /**
     * Show a list of status messages
     *
     * @param messages
     */
    showStatusMessages(messages) {
        $.each(messages, (index, element) => {
            let title = '';
            let message = '';
            const severity = element.severity;
            if (element.title) {
                title = element.title;
            }
            if (element.message) {
                message = element.message;
            }
            this.addMessage(severity, title, message);
        });
    }
    /**
     * Show an action button
     *
     * @param button
     */
    showActionButton(button) {
        let title = false;
        let action = false;
        if (button.title) {
            title = button.title;
        }
        if (button.action) {
            action = button.action;
        }
        const domButton = this.buttonTemplate;
        if (action) {
            domButton.attr('data-action', action);
        }
        if (title) {
            domButton.text(title);
        }
        this.findInModal(this.updateButton).replaceWith(domButton);
    }
    /**
     * Show a status message
     */
    addMessage(severity, title, message) {
        const domMessage = FlashMessage.render(severity, title, message);
        this.findInModal(this.selectorOutput).append(domMessage);
    }
}
var CoreUpdate$1 = new CoreUpdate();

export default CoreUpdate$1;
