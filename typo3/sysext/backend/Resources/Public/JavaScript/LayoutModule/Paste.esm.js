import { SeverityEnum } from '../Enum/Severity.esm.js';
import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Severity from '../Severity.esm.js';
import Modal from '../Modal.esm.js';
import DataHandler from '../AjaxDataHandler.esm.js';
import '../Element/IconElement.esm.js';

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
class Paste {
    /**
     * initializes paste icons for all content elements on the page
     */
    constructor() {
        this.itemOnClipboardUid = 0;
        this.itemOnClipboardTitle = '';
        this.copyMode = '';
        this.elementIdentifier = '.t3js-page-ce';
        this.pasteAfterLinkTemplate = '';
        this.pasteIntoLinkTemplate = '';
        jQuery(() => {
            if (jQuery('.t3js-page-columns').length) {
                this.generateButtonTemplates();
                this.activatePasteIcons();
                this.initializeEvents();
            }
        });
    }
    /**
     * @param {JQuery} $element
     * @return number
     */
    static determineColumn($element) {
        const $columnContainer = $element.closest('[data-colpos]');
        if ($columnContainer.length && $columnContainer.data('colpos') !== 'undefined') {
            return $columnContainer.data('colpos');
        }
        return 0;
    }
    initializeEvents() {
        jQuery(document).on('click', '.t3js-paste', (evt) => {
            evt.preventDefault();
            this.activatePasteModal(jQuery(evt.currentTarget));
        });
    }
    generateButtonTemplates() {
        var _a, _b;
        if (!this.itemOnClipboardUid) {
            return;
        }
        this.pasteAfterLinkTemplate = '<button'
            + ' type="button"'
            + ' class="t3js-paste t3js-paste' + (this.copyMode ? '-' + this.copyMode : '') + ' t3js-paste-after btn btn-default btn-sm"'
            + ' title="' + ((_a = TYPO3.lang) === null || _a === void 0 ? void 0 : _a.pasteAfterRecord) + '">'
            + '<typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon>'
            + '</button>';
        this.pasteIntoLinkTemplate = '<button'
            + ' type="button"'
            + ' class="t3js-paste t3js-paste' + (this.copyMode ? '-' + this.copyMode : '') + ' t3js-paste-into btn btn-default btn-sm"'
            + ' title="' + ((_b = TYPO3.lang) === null || _b === void 0 ? void 0 : _b.pasteIntoColumn) + '">'
            + '<typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon>'
            + '</button>';
    }
    /**
     * activates the paste into / paste after icons outside of the context menus
     */
    activatePasteIcons() {
        jQuery('.t3-page-ce-wrapper-new-ce').each((index, el) => {
            if (!jQuery(el).find('.t3js-toggle-new-content-element-wizard').length) {
                return;
            }
            jQuery('.t3js-page-lang-column .t3-page-ce > .t3-page-ce').removeClass('t3js-page-ce');
            if (this.pasteAfterLinkTemplate && this.pasteIntoLinkTemplate) {
                const parent = jQuery(el).parent();
                // append the buttons
                if (parent.data('page')) {
                    jQuery(el).append(this.pasteIntoLinkTemplate);
                }
                else {
                    jQuery(el).append(this.pasteAfterLinkTemplate);
                }
            }
        });
    }
    /**
     * generates the paste into / paste after modal
     */
    activatePasteModal($element) {
        const title = (TYPO3.lang['paste.modal.title.paste'] || 'Paste record') + ': "' + this.itemOnClipboardTitle + '"';
        const content = TYPO3.lang['paste.modal.paste'] || 'Do you want to paste the record to this position?';
        let buttons = [];
        buttons = [
            {
                text: TYPO3.lang['paste.modal.button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                trigger: () => {
                    Modal.currentModal.trigger('modal-dismiss');
                },
            },
            {
                text: TYPO3.lang['paste.modal.button.paste'] || 'Paste',
                btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.warning),
                trigger: () => {
                    Modal.currentModal.trigger('modal-dismiss');
                    this.execute($element);
                },
            },
        ];
        Modal.show(title, content, SeverityEnum.warning, buttons);
    }
    /**
     * Send an AJAX request via the AjaxDataHandler
     *
     * @param {JQuery} $element
     */
    execute($element) {
        const colPos = Paste.determineColumn($element);
        const closestElement = $element.closest(this.elementIdentifier);
        const targetFound = closestElement.data('uid');
        let targetPid;
        if (typeof targetFound === 'undefined') {
            targetPid = parseInt(closestElement.data('page'), 10);
        }
        else {
            targetPid = 0 - parseInt(targetFound, 10);
        }
        const language = parseInt($element.closest('[data-language-uid]').data('language-uid'), 10);
        const parameters = {
            CB: {
                paste: 'tt_content|' + targetPid,
                update: {
                    colPos: colPos,
                    sys_language_uid: language,
                },
            },
        };
        DataHandler.process(parameters).then((result) => {
            if (!result.hasErrors) {
                window.location.reload();
            }
        });
    }
}
var Paste$1 = new Paste();

export default Paste$1;
