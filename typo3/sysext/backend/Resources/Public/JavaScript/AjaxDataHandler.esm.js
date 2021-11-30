import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from './Icons.esm.js';
import { SeverityEnum } from './Enum/Severity.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Modal from './Modal.esm.js';
import NotificationService from './Notification.esm.js';
import { BroadcastMessage } from './BroadcastMessage.esm.js';
import broadcastService from './BroadcastService.esm.js';

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
var Identifiers;
(function (Identifiers) {
    Identifiers["hide"] = ".t3js-record-hide";
    Identifiers["delete"] = ".t3js-record-delete";
    Identifiers["icon"] = ".t3js-icon";
})(Identifiers || (Identifiers = {}));
/**
 * Module: TYPO3/CMS/Backend/AjaxDataHandler
 * Javascript functions to work with AJAX and interacting with Datahandler
 * through \TYPO3\CMS\Backend\Controller\SimpleDataHandlerController->processAjaxRequest (record_process route)
 */
class AjaxDataHandler {
    /**
     * Refresh the page tree
     */
    static refreshPageTree() {
        top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
    /**
     * AJAX call to record_process route (SimpleDataHandlerController->processAjaxRequest)
     * returns a jQuery Promise to work with
     *
     * @param {string | object} params
     * @returns {Promise<any>}
     */
    static call(params) {
        return (new AjaxRequest(TYPO3.settings.ajaxUrls.record_process)).withQueryArguments(params).get().then(async (response) => {
            return await response.resolve();
        });
    }
    constructor() {
        jQuery(() => {
            this.initialize();
        });
    }
    /**
     * Generic function to call from the outside the script and validate directly showing errors
     *
     * @param {string | object} parameters
     * @param {AfterProcessEventDict} eventDict Dictionary used as event detail. This is private API yet.
     * @returns {Promise<any>}
     */
    process(parameters, eventDict) {
        const promise = AjaxDataHandler.call(parameters);
        return promise.then((result) => {
            if (result.hasErrors) {
                this.handleErrors(result);
            }
            if (eventDict) {
                const payload = Object.assign(Object.assign({}, eventDict), { hasErrors: result.hasErrors });
                const message = new BroadcastMessage('datahandler', 'process', payload);
                broadcastService.post(message);
                const event = new CustomEvent('typo3:datahandler:process', {
                    detail: {
                        payload: payload
                    }
                });
                document.dispatchEvent(event);
            }
            return result;
        });
    }
    // TODO: Many extensions rely on this behavior but it's misplaced in AjaxDataHandler. Move into Recordlist.ts and deprecate in v11.
    initialize() {
        // HIDE/UNHIDE: click events for all action icons to hide/unhide
        jQuery(document).on('click', Identifiers.hide, (e) => {
            e.preventDefault();
            const $anchorElement = jQuery(e.currentTarget);
            const $iconElement = $anchorElement.find(Identifiers.icon);
            const $rowElement = $anchorElement.closest('tr[data-uid]');
            const params = $anchorElement.data('params');
            // add a spinner
            this._showSpinnerIcon($iconElement);
            // make the AJAX call to toggle the visibility
            this.process(params).then((result) => {
                if (!result.hasErrors) {
                    // adjust overlay icon
                    this.toggleRow($rowElement);
                }
            });
        });
        // DELETE: click events for all action icons to delete
        jQuery(document).on('click', Identifiers.delete, (evt) => {
            evt.preventDefault();
            const $anchorElement = jQuery(evt.currentTarget);
            $anchorElement.tooltip('hide');
            const $modal = Modal.confirm($anchorElement.data('title'), $anchorElement.data('message'), SeverityEnum.warning, [
                {
                    text: $anchorElement.data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                },
                {
                    text: $anchorElement.data('button-ok-text') || TYPO3.lang['button.delete'] || 'Delete',
                    btnClass: 'btn-warning',
                    name: 'delete',
                },
            ]);
            $modal.on('button.clicked', (e) => {
                if (e.target.getAttribute('name') === 'cancel') {
                    Modal.dismiss();
                }
                else if (e.target.getAttribute('name') === 'delete') {
                    Modal.dismiss();
                    this.deleteRecord($anchorElement);
                }
            });
        });
    }
    /**
     * Toggle row visibility after record has been changed
     *
     * @param {JQuery} $rowElement
     */
    toggleRow($rowElement) {
        const $anchorElement = $rowElement.find(Identifiers.hide);
        const table = $anchorElement.closest('table[data-table]').data('table');
        const params = $anchorElement.data('params');
        let nextParams;
        let nextState;
        let iconName;
        if ($anchorElement.data('state') === 'hidden') {
            nextState = 'visible';
            nextParams = params.replace('=0', '=1');
            iconName = 'actions-edit-hide';
        }
        else {
            nextState = 'hidden';
            nextParams = params.replace('=1', '=0');
            iconName = 'actions-edit-unhide';
        }
        $anchorElement.data('state', nextState).data('params', nextParams);
        // Update tooltip title
        $anchorElement.one('hidden.bs.tooltip', () => {
            const nextTitle = $anchorElement.data('toggleTitle');
            // Bootstrap Tooltip internally uses only .attr('data-bs-original-title')
            $anchorElement
                .data('toggleTitle', $anchorElement.attr('data-bs-original-title'))
                .attr('data-bs-original-title', nextTitle);
        });
        $anchorElement.tooltip('hide');
        const $iconElement = $anchorElement.find(Identifiers.icon);
        Icons.getIcon(iconName, Icons.sizes.small).then((icon) => {
            $iconElement.replaceWith(icon);
        });
        // Set overlay for the record icon
        const $recordIcon = $rowElement.find('.col-icon ' + Identifiers.icon);
        if (nextState === 'hidden') {
            Icons.getIcon('miscellaneous-placeholder', Icons.sizes.small, 'overlay-hidden').then((icon) => {
                $recordIcon.append(jQuery(icon).find('.icon-overlay'));
            });
        }
        else {
            $recordIcon.find('.icon-overlay').remove();
        }
        $rowElement.fadeTo('fast', 0.4, () => {
            $rowElement.fadeTo('fast', 1);
        });
        if (table === 'pages') {
            AjaxDataHandler.refreshPageTree();
        }
    }
    /**
     * Delete record by given element (icon in table)
     * don't call it directly!
     *
     * @param {JQuery} $anchorElement
     */
    deleteRecord($anchorElement) {
        const params = $anchorElement.data('params');
        let $iconElement = $anchorElement.find(Identifiers.icon);
        // add a spinner
        this._showSpinnerIcon($iconElement);
        const $table = $anchorElement.closest('table[data-table]');
        const table = $table.data('table');
        let $rowElements = $anchorElement.closest('tr[data-uid]');
        const uid = $rowElements.data('uid');
        // make the AJAX call to toggle the visibility
        const eventData = { component: 'datahandler', action: 'delete', table, uid };
        this.process(params, eventData).then((result) => {
            // revert to the old class
            Icons.getIcon('actions-edit-delete', Icons.sizes.small).then((icon) => {
                $iconElement = $anchorElement.find(Identifiers.icon);
                $iconElement.replaceWith(icon);
            });
            if (!result.hasErrors) {
                const $panel = $anchorElement.closest('.panel');
                const $panelHeading = $panel.find('.panel-heading');
                const $translatedRowElements = $table.find('[data-l10nparent=' + uid + ']').closest('tr[data-uid]');
                $rowElements = $rowElements.add($translatedRowElements);
                $rowElements.fadeTo('slow', 0.4, () => {
                    $rowElements.slideUp('slow', () => {
                        $rowElements.remove();
                        if ($table.find('tbody tr').length === 0) {
                            $panel.slideUp('slow');
                        }
                    });
                });
                if ($anchorElement.data('l10parent') === '0' || $anchorElement.data('l10parent') === '') {
                    const count = Number($panelHeading.find('.t3js-table-total-items').html());
                    $panelHeading.find('.t3js-table-total-items').text(count - 1);
                }
                if (table === 'pages') {
                    AjaxDataHandler.refreshPageTree();
                }
            }
        });
    }
    /**
     * Handle the errors from result object
     *
     * @param {Object} result
     */
    handleErrors(result) {
        jQuery.each(result.messages, (position, message) => {
            NotificationService.error(message.title, message.message);
        });
    }
    /**
     * Replace the given icon with a spinner icon
     *
     * @param {Object} $iconElement
     * @private
     */
    _showSpinnerIcon($iconElement) {
        Icons.getIcon('spinner-circle-dark', Icons.sizes.small).then((icon) => {
            $iconElement.replaceWith(icon);
        });
    }
}
var DataHandler = new AjaxDataHandler();

export default DataHandler;
