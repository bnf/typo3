import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Md5 from '../../../../backend/Resources/Public/JavaScript/Hashing/Md5.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';

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
 * Module: TYPO3/CMS/Filelist/ContextMenuActions
 *
 * JavaScript to handle filelist actions from context menu
 * @exports TYPO3/CMS/Filelist/ContextMenuActions
 */
class ContextMenuActions {
    static getReturnUrl() {
        return encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
    }
    static renameFile(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileRename.moduleUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static editFile(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileEdit.moduleUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static editFileStorage(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[sys_file_storage][' + parseInt(uid, 10) + ']=edit&returnUrl='
            + ContextMenuActions.getReturnUrl());
    }
    static openInfoPopUp(table, uid) {
        if (table === 'sys_file_storage') {
            top.TYPO3.InfoWindow.showItem(table, uid);
        }
        else {
            // Files and folders
            top.TYPO3.InfoWindow.showItem('_FILE', uid);
        }
    }
    static uploadFile(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileUpload.moduleUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static createFile(table, uid) {
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCreate.moduleUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static deleteFile(table, uid) {
        const $anchorElement = $(this);
        const performDelete = () => {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl
                + '&data[delete][0][data]=' + encodeURIComponent(uid)
                + '&data[delete][0][redirect]=' + ContextMenuActions.getReturnUrl());
        };
        if (!$anchorElement.data('title')) {
            performDelete();
            return;
        }
        const $modal = Modal.confirm($anchorElement.data('title'), $anchorElement.data('message'), SeverityEnum.warning, [
            {
                text: $(this).data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            },
            {
                text: $(this).data('button-ok-text') || TYPO3.lang['button.delete'] || 'Delete',
                btnClass: 'btn-warning',
                name: 'delete',
            },
        ]);
        $modal.on('button.clicked', (e) => {
            const $element = e.target;
            if ($element.name === 'delete') {
                performDelete();
            }
            Modal.dismiss();
        });
    }
    static copyFile(table, uid) {
        const shortMD5 = Md5.hash(uid).substring(0, 10);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + shortMD5]: uid
                },
                setCopyMode: '1'
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh(true);
        });
    }
    static copyReleaseFile(table, uid) {
        const shortMD5 = Md5.hash(uid).substring(0, 10);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + shortMD5]: '0'
                },
                setCopyMode: '1'
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh(true);
        });
    }
    static cutFile(table, uid) {
        const shortMD5 = Md5.hash(uid).substring(0, 10);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + shortMD5]: uid
                }
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh(true);
        });
    }
    static cutReleaseFile(table, uid) {
        const shortMD5 = Md5.hash(uid).substring(0, 10);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + shortMD5]: '0'
                }
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh(true);
        });
    }
    static pasteFileInto(table, uid) {
        const $anchorElement = $(this);
        const title = $anchorElement.data('title');
        const performPaste = () => {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl
                + '&CB[paste]=FILE|' + encodeURIComponent(uid)
                + '&CB[pad]=normal&redirect=' + ContextMenuActions.getReturnUrl());
        };
        if (!title) {
            performPaste();
            return;
        }
        const $modal = Modal.confirm(title, $anchorElement.data('message'), SeverityEnum.warning, [
            {
                text: $(this).data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            },
            {
                text: $(this).data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
                btnClass: 'btn-warning',
                name: 'ok',
            },
        ]);
        $modal.on('button.clicked', (e) => {
            const $element = e.target;
            if ($element.name === 'ok') {
                performPaste();
            }
            Modal.dismiss();
        });
    }
    static dropInto(table, uid, mode) {
        const target = $(this).data('drop-target');
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl
            + '&file[' + mode + '][0][data]=' + encodeURIComponent(uid)
            + '&file[' + mode + '][0][target]=' + encodeURIComponent(target)
            + '&redirect=' + ContextMenuActions.getReturnUrl());
    }
    static dropMoveInto(table, uid) {
        ContextMenuActions.dropInto.bind($(this))(table, uid, 'move');
    }
    static dropCopyInto(table, uid) {
        ContextMenuActions.dropInto.bind($(this))(table, uid, 'copy');
    }
}

export default ContextMenuActions;
