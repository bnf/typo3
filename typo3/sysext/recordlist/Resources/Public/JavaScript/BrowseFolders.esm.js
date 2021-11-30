import Severity from '../../../../backend/Resources/Public/JavaScript/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
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
/**
 * Module: TYPO3/CMS/Recordlist/BrowseFolders
 * Folder selection
 * @exports TYPO3/CMS/Recordlist/BrowseFolders
 */
class BrowseFolders {
    constructor() {
        new RegularEvent('click', (evt, targetEl) => {
            evt.preventDefault();
            const folderId = targetEl.dataset.folderId;
            ElementBrowser.insertElement('', folderId, folderId, folderId, parseInt(targetEl.dataset.close || '0', 10) === 1);
        }).delegateTo(document, '[data-folder-id]');
        new RegularEvent('click', (evt, targetEl) => {
            evt.preventDefault();
            Modal.confirm('', targetEl.dataset.message, Severity.error, [], []);
        }).delegateTo(document, '.t3js-folderIdError');
    }
}
var BrowseFolders$1 = new BrowseFolders();

export default BrowseFolders$1;
