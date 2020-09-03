import { MessageUtility } from '../../../../backend/Resources/Public/JavaScript/Utility/MessageUtility.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
 * Module: TYPO3/CMS/Setup/SetupModule
 * @exports TYPO3/CMS/Setup/SetupModule
 */
class SetupModule {
    constructor() {
        new RegularEvent('setup:confirmation:response', SetupModule.handleConfirmationResponse)
            .delegateTo(document, '[data-event-name="setup:confirmation:response"]');
        new RegularEvent('click', (e, element) => {
            const clickEvent = new CustomEvent(element.dataset.eventName, {
                bubbles: true,
                detail: { payload: element.dataset.eventPayload }
            });
            element.dispatchEvent(clickEvent);
        }).delegateTo(document, '[data-event="click"][data-event-name]');
        document.querySelectorAll('[data-setup-avatar-field]')
            .forEach((fieldElement) => {
            const fieldName = fieldElement.dataset.setupAvatarField;
            const clearElement = document.getElementById('clear_button_' + fieldName);
            const addElement = document.getElementById('add_button_' + fieldName);
            addElement.addEventListener('click', () => this.avatarOpenFileBrowser(fieldName, addElement.dataset.setupAvatarUrl));
            clearElement && clearElement.addEventListener('click', () => this.avatarClearExistingImage(fieldName));
        });
        if (document.querySelector('[data-setup-avatar-field]') !== null) {
            this.initializeMessageListener();
        }
    }
    static handleConfirmationResponse(evt) {
        if (evt.detail.result && evt.detail.payload === 'resetConfiguration') {
            const input = document.querySelector('#setValuesToDefault');
            input.value = '1';
            input.form.submit();
        }
    }
    static hideElement(element) {
        element.style.display = 'none';
    }
    initializeMessageListener() {
        window.addEventListener('message', (evt) => {
            if (!MessageUtility.verifyOrigin(evt.origin)) {
                throw new Error('Denied message sent by ' + evt.origin);
            }
            if (evt.data.actionName === 'typo3:foreignRelation:insert') {
                if (typeof evt.data.objectGroup === 'undefined') {
                    throw new Error('No object group defined for message');
                }
                const avatarMatches = evt.data.objectGroup.match(/^avatar-(.+)$/);
                if (avatarMatches === null) {
                    // Received message isn't provisioned for current InlineControlContainer instance
                    return;
                }
                this.avatarSetFileUid(avatarMatches[1], evt.data.uid);
            }
        });
    }
    avatarOpenFileBrowser(fieldName, uri) {
        uri = uri.replace('__IDENTIFIER__', 'avatar-' + fieldName);
        this.avatarWindowRef = window.open(uri, 'Typo3WinBrowser', 'height=650,width=800,status=0,menubar=0,resizable=1,scrollbars=1');
        this.avatarWindowRef.focus();
    }
    avatarClearExistingImage(fieldName) {
        const fieldElement = document.getElementById('field_' + fieldName);
        const imageElement = document.getElementById('image_' + fieldName);
        const clearElement = document.getElementById('clear_button_' + fieldName);
        clearElement && SetupModule.hideElement(clearElement);
        imageElement && SetupModule.hideElement(imageElement);
        fieldElement.value = 'delete';
    }
    avatarSetFileUid(fieldName, fileUid) {
        this.avatarClearExistingImage(fieldName);
        const fieldElement = document.getElementById('field_' + fieldName);
        const addElement = document.getElementById('add_button_' + fieldName);
        fieldElement.value = fileUid;
        addElement.classList.remove('btn-default');
        addElement.classList.add('btn-info');
        if (this.avatarWindowRef instanceof Window && !this.avatarWindowRef.closed) {
            this.avatarWindowRef.close();
            this.avatarWindowRef = null;
        }
    }
}
var SetupModule$1 = new SetupModule();

export default SetupModule$1;
