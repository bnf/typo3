import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';

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
class Workspaces {
    constructor() {
        this.tid = 0;
    }
    static get default() {
        console.warn('The property .default of module Workspaces has been deprecated, use Workspaces directly.');
        return this;
    }
    /**
     * Renders the send to stage window
     * @param {Object} response
     * @return {$}
     */
    renderSendToStageWindow(response) {
        const result = response[0].result;
        const $form = jQuery('<form />');
        if (typeof result.sendMailTo !== 'undefined' && result.sendMailTo.length > 0) {
            $form.append(jQuery('<label />', { class: 'control-label' }).text(TYPO3.lang['window.sendToNextStageWindow.itemsWillBeSentTo']));
            $form.append(jQuery('<div />', { class: 'form-group' }).append(jQuery('<a href="#" class="btn btn-default btn-xs t3js-workspace-recipients-selectall" />')
                .text(TYPO3.lang['window.sendToNextStageWindow.selectAll']), '&nbsp;', jQuery('<a href="#" class="btn btn-default btn-xs t3js-workspace-recipients-deselectall" />')
                .text(TYPO3.lang['window.sendToNextStageWindow.deselectAll'])));
            for (const recipient of result.sendMailTo) {
                $form.append(jQuery('<div />', { class: 'checkbox' }).append(jQuery('<label />').text(recipient.label).prepend(jQuery('<input />', {
                    type: 'checkbox',
                    name: 'recipients',
                    class: 't3js-workspace-recipient',
                    id: recipient.name,
                    value: recipient.value,
                }).prop('checked', recipient.checked).prop('disabled', recipient.disabled))));
            }
        }
        if (typeof result.additional !== 'undefined') {
            $form.append(jQuery('<div />', { class: 'form-group' }).append(jQuery('<label />', {
                class: 'control-label',
                'for': 'additional',
            }).text(TYPO3.lang['window.sendToNextStageWindow.additionalRecipients']), jQuery('<textarea />', {
                class: 'form-control',
                name: 'additional',
                id: 'additional',
            }).text(result.additional.value), jQuery('<span />', { class: 'help-block' }).text(TYPO3.lang['window.sendToNextStageWindow.additionalRecipients.hint'])));
        }
        $form.append(jQuery('<div />', { class: 'form-group' }).append(jQuery('<label />', {
            class: 'control-label',
            'for': 'comments',
        }).text(TYPO3.lang['window.sendToNextStageWindow.comments']), jQuery('<textarea />', {
            class: 'form-control',
            name: 'comments',
            id: 'comments',
        }).text(result.comments.value)));
        const $modal = Modal.show(TYPO3.lang.actionSendToStage, $form, SeverityEnum.info, [
            {
                text: TYPO3.lang.cancel,
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
                trigger: () => {
                    $modal.modal('hide');
                },
            },
            {
                text: TYPO3.lang.ok,
                btnClass: 'btn-info',
                name: 'ok',
            },
        ]);
        return $modal;
    }
    /**
     * Checks the integrity of a record
     *
     * @param {Array} payload
     * @return {$}
     */
    checkIntegrity(payload) {
        return this.sendRemoteRequest(this.generateRemotePayload('checkIntegrity', payload));
    }
    /**
     * Sends an AJAX request
     *
     * @param {Object} payload
     * @return {$}
     */
    sendRemoteRequest(payload) {
        return (new AjaxRequest(TYPO3.settings.ajaxUrls.workspace_dispatch)).post(payload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    }
    /**
     * Generates the payload for a remote call
     *
     * @param {String} method
     * @param {Object} data
     * @return {{action, data, method, type}}
     */
    generateRemotePayload(method, data = {}) {
        return this.generateRemotePayloadBody('RemoteServer', method, data);
    }
    /**
     * Generates the payload for MassActions
     *
     * @param {String} method
     * @param {Object} data
     * @return {{action, data, method, type}}
     */
    generateRemoteMassActionsPayload(method, data = {}) {
        return this.generateRemotePayloadBody('MassActions', method, data);
    }
    /**
     * Generates the payload for Actions
     *
     * @param {String} method
     * @param {Object} data
     * @return {{action, data, method, type}}
     */
    generateRemoteActionsPayload(method, data = {}) {
        return this.generateRemotePayloadBody('Actions', method, data);
    }
    /**
     * Generates the payload body
     *
     * @param {String} action
     * @param {String} method
     * @param {Object} data
     * @return {{action: String, data: Object, method: String, type: string}}
     */
    generateRemotePayloadBody(action, method, data) {
        if (data instanceof Array) {
            data.push(TYPO3.settings.Workspaces.token);
        }
        else {
            data = [
                data,
                TYPO3.settings.Workspaces.token,
            ];
        }
        return {
            action: action,
            data: data,
            method: method,
            type: 'rpc',
            tid: this.tid++,
        };
    }
}

export default Workspaces;
