import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import NProgress from '../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import { MessageUtility } from '../../../../backend/Resources/Public/JavaScript/Utility/MessageUtility.esm.js';
import ElementBrowser from './ElementBrowser.esm.js';

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
        this.importSelection = (e) => {
            e.preventDefault();
            const targetEl = e.target;
            const items = document.querySelectorAll('.t3js-multi-record-selection-check');
            if (!items.length) {
                return;
            }
            const selectedItems = [];
            items.forEach((item) => {
                if (item.checked && item.name && item.dataset.fileName && item.dataset.fileUid) {
                    selectedItems.unshift({ uid: item.dataset.fileUid, fileName: item.dataset.fileName });
                }
            });
            Icons.getIcon('spinner-circle', Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                targetEl.classList.add('disabled');
                targetEl.innerHTML = icon;
            });
            NProgress.configure({ parent: '.element-browser-main-content', showSpinner: false });
            NProgress.start();
            const stepping = 1 / selectedItems.length;
            BrowseFiles.handleNext(selectedItems);
            new RegularEvent('message', (e) => {
                if (!MessageUtility.verifyOrigin(e.origin)) {
                    throw 'Denied message sent by ' + e.origin;
                }
                if (e.data.actionName === 'typo3:foreignRelation:inserted') {
                    if (selectedItems.length > 0) {
                        NProgress.inc(stepping);
                        BrowseFiles.handleNext(selectedItems);
                    }
                    else {
                        NProgress.done();
                        ElementBrowser.focusOpenerAndClose();
                    }
                }
            }).bindTo(window);
        };
        new RegularEvent('click', (evt, targetEl) => {
            evt.preventDefault();
            BrowseFiles.insertElement(targetEl.dataset.fileName, Number(targetEl.dataset.fileUid), parseInt(targetEl.dataset.close || '0', 10) === 1);
        }).delegateTo(document, '[data-close]');
        // Handle import selection event, dispatched from MultiRecordSelection
        new RegularEvent('multiRecordSelection:action:import', this.importSelection).bindTo(document);
    }
    static insertElement(fileName, fileUid, close) {
        return ElementBrowser.insertElement('sys_file', String(fileUid), fileName, String(fileUid), close);
    }
    static handleNext(items) {
        if (items.length > 0) {
            const item = items.pop();
            BrowseFiles.insertElement(item.fileName, Number(item.uid));
        }
    }
}
var BrowseFiles$1 = new BrowseFiles();

export default BrowseFiles$1;
