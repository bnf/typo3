import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import Severity from '../../../../backend/Resources/Public/JavaScript/Severity.mjs';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import ElementBrowser from './ElementBrowser.mjs';

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
        jQuery(() => {
            jQuery('[data-folder-id]').on('click', (event) => {
                event.preventDefault();
                const $element = jQuery(event.currentTarget);
                const folderId = $element.data('folderId');
                const close = parseInt($element.data('close'), 10) === 1;
                ElementBrowser.insertElement('', folderId, 'folder', folderId, folderId, '', '', '', close);
            });
            jQuery('.t3js-folderIdError').on('click', (event) => {
                event.preventDefault();
                Modal.confirm('', jQuery(event.currentTarget).data('message'), Severity.error, [], []);
            });
        });
    }
}
var BrowseFolders$1 = new BrowseFolders();

export default BrowseFolders$1;
