import $ from 'jquery';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import LinkBrowser from '../../../../recordlist/Resources/Public/JavaScript/LinkBrowser.mjs';
import 'ckeditor';

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
 * Module: TYPO3/CMS/RteCkeditor/RteLinkBrowser
 * LinkBrowser communication with parent window
 */
class RteLinkBrowser {
    constructor() {
        this.plugin = null;
        this.CKEditor = null;
        this.ranges = [];
        this.siteUrl = '';
    }
    /**
     * @param {String} editorId Id of CKEditor
     */
    initialize(editorId) {
        let editor = Modal.currentModal.data('ckeditor');
        if (typeof editor !== 'undefined') {
            this.CKEditor = editor;
        }
        else {
            let callerWindow;
            if (typeof top.TYPO3.Backend !== 'undefined' && typeof top.TYPO3.Backend.ContentContainer.get() !== 'undefined') {
                callerWindow = top.TYPO3.Backend.ContentContainer.get();
            }
            else {
                callerWindow = window.parent;
            }
            $.each(callerWindow.CKEDITOR.instances, (name, instance) => {
                if (instance.id === editorId) {
                    this.CKEditor = instance;
                }
            });
        }
        window.addEventListener('beforeunload', () => {
            this.CKEditor.getSelection().selectRanges(this.ranges);
        });
        // Backup all ranges that are active when the Link Browser is requested
        this.ranges = this.CKEditor.getSelection().getRanges();
        // siteUrl etc are added as data attributes to the body tag
        $.extend(RteLinkBrowser, $('body').data());
        $('.t3js-class-selector').on('change', () => {
            if ($('option:selected', this).data('linkTitle')) {
                $('.t3js-linkTitle').val($('option:selected', this).data('linkTitle'));
            }
        });
        $('.t3js-removeCurrentLink').on('click', (event) => {
            event.preventDefault();
            this.CKEditor.execCommand('unlink');
            Modal.dismiss();
        });
    }
    /**
     * Store the final link
     *
     * @param {String} link The select element or anything else which identifies the link (e.g. "page:<pageUid>" or "file:<uid>")
     */
    finalizeFunction(link) {
        const linkElement = this.CKEditor.document.createElement('a');
        const attributes = LinkBrowser.getLinkAttributeValues();
        let params = attributes.params ? attributes.params : '';
        if (attributes.target) {
            linkElement.setAttribute('target', attributes.target);
        }
        if (attributes.class) {
            linkElement.setAttribute('class', attributes.class);
        }
        if (attributes.title) {
            linkElement.setAttribute('title', attributes.title);
        }
        delete attributes.title;
        delete attributes.class;
        delete attributes.target;
        delete attributes.params;
        $.each(attributes, (attrName, attrValue) => {
            linkElement.setAttribute(attrName, attrValue);
        });
        // Make sure, parameters and anchor are in correct order
        const linkMatch = link.match(/^([a-z0-9]+:\/\/[^:\/?#]+(?:\/?[^?#]*)?)(\??[^#]*)(#?.*)$/);
        if (linkMatch && linkMatch.length > 0) {
            link = linkMatch[1] + linkMatch[2];
            const paramsPrefix = linkMatch[2].length > 0 ? '&' : '?';
            if (params.length > 0) {
                if (params[0] === '&') {
                    params = params.substr(1);
                }
                // If params is set, append it
                if (params.length > 0) {
                    link += paramsPrefix + params;
                }
            }
            link += linkMatch[3];
        }
        linkElement.setAttribute('href', link);
        const selection = this.CKEditor.getSelection();
        selection.selectRanges(this.ranges);
        if (selection && selection.getSelectedText() === '') {
            selection.selectElement(selection.getStartElement());
        }
        if (selection && selection.getSelectedText()) {
            linkElement.setText(selection.getSelectedText());
        }
        else {
            linkElement.setText(linkElement.getAttribute('href'));
        }
        this.CKEditor.insertElement(linkElement);
        Modal.dismiss();
    }
}
let rteLinkBrowser = new RteLinkBrowser();
LinkBrowser.finalizeFunction = (link) => { rteLinkBrowser.finalizeFunction(link); };

export default rteLinkBrowser;
