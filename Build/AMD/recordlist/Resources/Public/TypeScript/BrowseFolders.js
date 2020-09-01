define(['jquery', '../../../../backend/Resources/Public/TypeScript/Severity', '../../../../backend/Resources/Public/TypeScript/Modal', './ElementBrowser'], function ($, Severity, Modal, ElementBrowser) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
            $__default['default'](() => {
                $__default['default']('[data-folder-id]').on('click', (event) => {
                    event.preventDefault();
                    const $element = $__default['default'](event.currentTarget);
                    const folderId = $element.data('folderId');
                    const close = parseInt($element.data('close'), 10) === 1;
                    ElementBrowser.insertElement('', folderId, 'folder', folderId, folderId, '', '', '', close);
                });
                $__default['default']('.t3js-folderIdError').on('click', (event) => {
                    event.preventDefault();
                    Modal.confirm('', $__default['default'](event.currentTarget).data('message'), Severity.error, [], []);
                });
            });
        }
    }
    new BrowseFolders();

});
