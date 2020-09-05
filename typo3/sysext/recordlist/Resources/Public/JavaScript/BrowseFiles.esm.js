import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import NProgress from '../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import { MessageUtility } from '../../../../backend/Resources/Public/JavaScript/Utility/MessageUtility.esm.js';
import ElementBrowser from './ElementBrowser.esm.js';
import Tree from '../../../../backend/Resources/Public/JavaScript/LegacyTree.esm.js';

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
var Icons = TYPO3.Icons;
class BrowseFiles {
    constructor() {
        // as long we use onclick attributes, we need the Tree component
        Tree.noop();
        BrowseFiles.File = new File();
        BrowseFiles.Selector = new Selector();
        jQuery(() => {
            BrowseFiles.elements = jQuery('body').data('elements');
            jQuery('[data-close]').on('click', (e) => {
                e.preventDefault();
                BrowseFiles.File.insertElement('file_' + jQuery(e.currentTarget).data('fileIndex'), parseInt(jQuery(e.currentTarget).data('close'), 10) === 1);
            });
            new RegularEvent('change', () => {
                BrowseFiles.Selector.toggleImportButton();
            }).delegateTo(document, '.typo3-bulk-item');
            jQuery('#t3js-importSelection').on('click', BrowseFiles.Selector.handle);
            jQuery('#t3js-toggleSelection').on('click', BrowseFiles.Selector.toggle);
        });
    }
}
class File {
    /**
     * @param {String} index
     * @param  {Boolean} close
     */
    insertElement(index, close) {
        let result = false;
        if (typeof BrowseFiles.elements[index] !== 'undefined') {
            const element = BrowseFiles.elements[index];
            result = ElementBrowser.insertElement(element.table, element.uid, element.type, element.fileName, element.filePath, element.fileExt, element.fileIcon, '', close);
        }
        return result;
    }
}
class Selector {
    constructor() {
        /**
         * Toggle selection button is pressed
         *
         * @param {JQueryEventObject} e
         */
        this.toggle = (e) => {
            e.preventDefault();
            const items = this.getItems();
            if (items.length) {
                items.each((position, item) => {
                    item.checked = (item.checked ? null : 'checked');
                });
            }
            this.toggleImportButton();
        };
        /**
         * Import selection button is pressed
         *
         * @param {JQueryEventObject} e
         */
        this.handle = (e) => {
            e.preventDefault();
            const items = this.getItems();
            const selectedItems = [];
            if (items.length) {
                items.each((position, item) => {
                    if (item.checked && item.name) {
                        selectedItems.unshift(item.name);
                    }
                });
                Icons.getIcon('spinner-circle', Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                    e.currentTarget.classList.add('disabled');
                    e.currentTarget.innerHTML = icon;
                });
                this.handleSelection(selectedItems);
            }
        };
    }
    getItems() {
        return jQuery('#typo3-filelist').find('.typo3-bulk-item');
    }
    toggleImportButton() {
        const hasCheckedElements = document.querySelectorAll('#typo3-filelist .typo3-bulk-item:checked').length > 0;
        document.getElementById('t3js-importSelection').classList.toggle('disabled', !hasCheckedElements);
    }
    handleSelection(items) {
        NProgress.configure({ parent: '#typo3-filelist', showSpinner: false });
        NProgress.start();
        const stepping = 1 / items.length;
        this.handleNext(items);
        new RegularEvent('message', (e) => {
            if (!MessageUtility.verifyOrigin(e.origin)) {
                throw 'Denied message sent by ' + e.origin;
            }
            if (e.data.actionName === 'typo3:foreignRelation:inserted') {
                if (items.length > 0) {
                    NProgress.inc(stepping);
                    this.handleNext(items);
                }
                else {
                    NProgress.done();
                    ElementBrowser.focusOpenerAndClose();
                }
            }
        }).bindTo(window);
    }
    handleNext(items) {
        if (items.length > 0) {
            const item = items.pop();
            BrowseFiles.File.insertElement(item);
        }
    }
}
var BrowseFiles$1 = new BrowseFiles();

export default BrowseFiles$1;
