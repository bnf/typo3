import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import SecurityUtility from '../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import Severity from './Severity.esm.js';
import Modal from './Modal.esm.js';
import NProgress from '../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import { MessageUtility } from './Utility/MessageUtility.esm.js';
import { KeyTypesEnum } from './Enum/KeyTypes.esm.js';

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
 * Module: TYPO3/CMS/Backend/OnlineMedia
 * Javascript for show the online media dialog
 */
class OnlineMedia {
    constructor() {
        this.securityUtility = new SecurityUtility();
        jQuery(() => {
            this.registerEvents();
        });
    }
    registerEvents() {
        const me = this;
        jQuery(document).on('click', '.t3js-online-media-add-btn', (e) => {
            me.triggerModal(jQuery(e.currentTarget));
        });
    }
    /**
     * @param {JQuery} $trigger
     * @param {string} url
     */
    addOnlineMedia($trigger, url) {
        const target = $trigger.data('target-folder');
        const allowed = $trigger.data('online-media-allowed');
        const irreObjectUid = $trigger.data('file-irre-object');
        NProgress.start();
        new AjaxRequest(TYPO3.settings.ajaxUrls.online_media_create).post({
            url: url,
            targetFolder: target,
            allowed: allowed,
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.file) {
                const message = {
                    actionName: 'typo3:foreignRelation:insert',
                    objectGroup: irreObjectUid,
                    table: 'sys_file',
                    uid: data.file,
                };
                MessageUtility.send(message);
            }
            else {
                const $confirm = Modal.confirm('ERROR', data.error, Severity.error, [{
                        text: TYPO3.lang['button.ok'] || 'OK',
                        btnClass: 'btn-' + Severity.getCssClass(Severity.error),
                        name: 'ok',
                        active: true,
                    }]).on('confirm.button.ok', () => {
                    $confirm.modal('hide');
                });
            }
            NProgress.done();
        });
    }
    /**
     * @param {JQuery} $currentTarget
     */
    triggerModal($currentTarget) {
        const btnSubmit = $currentTarget.data('btn-submit') || 'Add';
        const placeholder = $currentTarget.data('placeholder') || 'Paste media url here...';
        const allowedExtMarkup = jQuery.map($currentTarget.data('online-media-allowed').split(','), (ext) => {
            return '<span class="label label-success">' + this.securityUtility.encodeHtml(ext.toUpperCase(), false) + '</span>';
        });
        const allowedHelpText = $currentTarget.data('online-media-allowed-help-text') || 'Allow to embed from sources:';
        const $markup = jQuery('<div>')
            .attr('class', 'form-control-wrap')
            .append([
            jQuery('<input>')
                .attr('type', 'text')
                .attr('class', 'form-control online-media-url')
                .attr('placeholder', placeholder),
            jQuery('<div>')
                .attr('class', 'help-block')
                .html(this.securityUtility.encodeHtml(allowedHelpText, false) + '<br>' + allowedExtMarkup.join(' ')),
        ]);
        const $modal = Modal.show($currentTarget.attr('title'), $markup, Severity.notice, [{
                text: btnSubmit,
                btnClass: 'btn btn-primary',
                name: 'ok',
                trigger: () => {
                    const url = $modal.find('input.online-media-url').val();
                    if (url) {
                        $modal.modal('hide');
                        this.addOnlineMedia($currentTarget, url);
                    }
                },
            }]);
        $modal.on('shown.bs.modal', (e) => {
            // focus the input field
            jQuery(e.currentTarget).find('input.online-media-url').first().focus().on('keydown', (kdEvt) => {
                if (kdEvt.keyCode === KeyTypesEnum.ENTER) {
                    $modal.find('button[name="ok"]').trigger('click');
                }
            });
        });
    }
}
var OnlineMedia$1 = new OnlineMedia();

export default OnlineMedia$1;
