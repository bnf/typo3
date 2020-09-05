define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../backend/Resources/Public/JavaScript/Severity', '../../../../backend/Resources/Public/JavaScript/Modal', './ElementBrowser'], function (jquery, Severity, Modal, ElementBrowser) { 'use strict';

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
            jquery(() => {
                jquery('[data-folder-id]').on('click', (event) => {
                    event.preventDefault();
                    const $element = jquery(event.currentTarget);
                    const folderId = $element.data('folderId');
                    const close = parseInt($element.data('close'), 10) === 1;
                    ElementBrowser.insertElement('', folderId, 'folder', folderId, folderId, '', '', '', close);
                });
                jquery('.t3js-folderIdError').on('click', (event) => {
                    event.preventDefault();
                    Modal.confirm('', jquery(event.currentTarget).data('message'), Severity.error, [], []);
                });
            });
        }
    }
    var BrowseFolders$1 = new BrowseFolders();

    return BrowseFolders$1;

});
