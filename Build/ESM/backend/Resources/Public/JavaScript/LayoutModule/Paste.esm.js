import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Severity from '../Severity.esm.js';
import Modal from '../Modal.esm.js';
import DataHandler from '../AjaxDataHandler.esm.js';

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
        this.elementIdentifier = '.t3js-page-ce';
        jQuery(() => {
            if (jQuery('.t3js-page-columns').length) {
                this.activatePasteIcons();
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
    /**
     * activates the paste into / paste after icons outside of the context menus
     */
    activatePasteIcons() {
        const me = this;
        jQuery('.t3-page-ce-wrapper-new-ce').each((index, el) => {
            if (!jQuery(el).find('.t3js-toggle-new-content-element-wizard').length) {
                return;
            }
            jQuery('.t3js-page-lang-column .t3-page-ce > .t3-page-ce').removeClass('t3js-page-ce');
            if (top.pasteAfterLinkTemplate && top.pasteIntoLinkTemplate) {
                const parent = jQuery(el).parent();
                if (parent.data('page')) {
                    jQuery(el).append(top.pasteIntoLinkTemplate);
                }
                else {
                    jQuery(el).append(top.pasteAfterLinkTemplate);
                }
                jQuery(el).find('.t3js-paste').on('click', (evt) => {
                    evt.preventDefault();
                    me.activatePasteModal(jQuery(evt.currentTarget));
                });
            }
        });
    }
    /**
     * generates the paste into / paste after modal
     */
    activatePasteModal(element) {
        const me = this;
        const $element = jQuery(element);
        const url = $element.data('url') || null;
        const title = (TYPO3.lang['paste.modal.title.paste'] || 'Paste record') + ': "' + $element.data('title') + '"';
        const content = TYPO3.lang['paste.modal.paste'] || 'Do you want to paste the record to this position?';
        const severity = (typeof top.TYPO3.Severity[$element.data('severity')] !== 'undefined') ?
            top.TYPO3.Severity[$element.data('severity')] :
            top.TYPO3.Severity.info;
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
                btnClass: 'btn-' + Severity.getCssClass(severity),
                trigger: () => {
                    Modal.currentModal.trigger('modal-dismiss');
                    me.execute($element);
                },
            },
        ];
        if (url !== null) {
            const separator = url.contains('?') ? '&' : '?';
            const params = jQuery.param({ data: $element.data() });
            Modal.loadUrl(title, severity, buttons, url + separator + params);
        }
        else {
            Modal.show(title, content, severity, buttons);
        }
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
            if (result.hasErrors) {
                return;
            }
            window.location.reload();
        });
    }
}
var Paste$1 = new Paste();

export default Paste$1;
