import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SeverityEnum } from './Enum/Severity.esm.js';
import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from './Modal.esm.js';
import InfoWindow from './InfoWindow.esm.js';
import NotificationService from './Notification.esm.js';
import Viewport from './Viewport.esm.js';
import DataHandler from './AjaxDataHandler.esm.js';
import moduleMenuApp from './ModuleMenu.esm.js';

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
 * @exports TYPO3/CMS/Backend/ContextMenuActions
 */
class ContextMenuActions {
    /**
     * @returns {string}
     */
    static getReturnUrl() {
        return encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static editRecord(table, uid) {
        let overrideVals = '', pageLanguageId = $(this).data('pages-language-uid');
        if (pageLanguageId) {
            // Disallow manual adjustment of the language field for pages
            overrideVals = '&overrideVals[pages][sys_language_uid]=' + pageLanguageId;
        }
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[' + table + '][' + uid + ']=edit'
            + overrideVals
            + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static viewRecord() {
        const $viewUrl = $(this).data('preview-url');
        if ($viewUrl) {
            const previewWin = window.open($viewUrl, 'newTYPO3frontendWindow');
            previewWin.focus();
        }
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static openInfoPopUp(table, uid) {
        InfoWindow.showItem(table, uid);
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static mountAsTreeRoot(table, uid) {
        if (table === 'pages') {
            Viewport.NavigationContainer.PageTree.setTemporaryMountPoint(uid);
        }
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static newPageWizard(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.NewRecord.moduleUrl + '&id=' + uid + '&pagesOnly=1&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static newContentWizard() {
        const $me = $(this);
        let $wizardUrl = $me.data('new-wizard-url');
        if ($wizardUrl) {
            $wizardUrl += '&returnUrl=' + ContextMenuActions.getReturnUrl();
            Modal.advanced({
                title: $me.data('title'),
                type: Modal.types.ajax,
                size: Modal.sizes.medium,
                content: $wizardUrl,
                severity: SeverityEnum.notice,
            });
        }
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static newRecord(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl + '&edit[' + table + '][-' + uid + ']=new&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static openHistoryPopUp(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordHistory.moduleUrl + '&element=' + table + ':' + uid + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static openListModule(table, uid) {
        const pageId = table === 'pages' ? uid : $(this).data('page-uid');
        moduleMenuApp.App.showModule('web_list', 'id=' + pageId);
    }
    static pagesSort() {
        const pagesSortUrl = $(this).data('pages-sort-url');
        if (pagesSortUrl) {
            Viewport.ContentContainer.setUrl(pagesSortUrl);
        }
    }
    static pagesNewMultiple() {
        const pagesSortUrl = $(this).data('pages-new-multiple-url');
        if (pagesSortUrl) {
            Viewport.ContentContainer.setUrl(pagesSortUrl);
        }
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static disableRecord(table, uid) {
        const disableFieldName = $(this).data('disable-field') || 'hidden';
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][' + disableFieldName + ']=1'
            + '&redirect=' + ContextMenuActions.getReturnUrl()).done(() => {
            Viewport.NavigationContainer.PageTree.refreshTree();
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static enableRecord(table, uid) {
        const disableFieldName = $(this).data('disable-field') || 'hidden';
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][' + disableFieldName + ']=0'
            + '&redirect=' + ContextMenuActions.getReturnUrl()).done(() => {
            Viewport.NavigationContainer.PageTree.refreshTree();
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static showInMenus(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][nav_hide]=0'
            + '&redirect=' + ContextMenuActions.getReturnUrl()).done(() => {
            Viewport.NavigationContainer.PageTree.refreshTree();
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static hideInMenus(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][nav_hide]=1'
            + '&redirect=' + ContextMenuActions.getReturnUrl()).done(() => {
            Viewport.NavigationContainer.PageTree.refreshTree();
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static deleteRecord(table, uid) {
        const $anchorElement = $(this);
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
            if (e.target.getAttribute('name') === 'delete') {
                const eventData = { component: 'contextmenu', action: 'delete', table, uid };
                DataHandler.process('cmd[' + table + '][' + uid + '][delete]=1', eventData).then(() => {
                    if (table === 'pages' && Viewport.NavigationContainer.PageTree) {
                        if (uid === top.fsMod.recentIds.web) {
                            let node = Viewport.NavigationContainer.PageTree.getFirstNode();
                            Viewport.NavigationContainer.PageTree.selectNode(node);
                        }
                        Viewport.NavigationContainer.PageTree.refreshTree();
                    }
                });
            }
            Modal.dismiss();
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static copy(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=1'
            + '&CB[setCopyMode]=1';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static clipboardRelease(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=0';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    /**
     * @param {string} table
     * @param {number} uid
     */
    static cut(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=1'
            + '&CB[setCopyMode]=0';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    /**
     * @param {string} iframeUrl
     */
    static triggerRefresh(iframeUrl) {
        if (!iframeUrl.includes('record%2Fedit')) {
            Viewport.ContentContainer.refresh();
        }
    }
    /**
     * Clear cache for given page uid
     *
     * @param {string} table pages table
     * @param {number} uid uid of the page
     */
    static clearCache(table, uid) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.web_list_clearpagecache)).withQueryArguments({ id: uid }).get({ cache: 'no-cache' }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                NotificationService.success(data.title, data.message, 1);
            }
            else {
                NotificationService.error(data.title, data.message, 1);
            }
        }, () => {
            NotificationService.error('Clearing page caches went wrong on the server side.');
        });
    }
    /**
     * Paste db record after another
     *
     * @param {string} table any db table except sys_file
     * @param {number} uid uid of the record after which record from the clipboard will be pasted
     */
    static pasteAfter(table, uid) {
        ContextMenuActions.pasteInto.bind($(this))(table, -uid);
    }
    /**
     * Paste page into another page
     *
     * @param {string} table any db table except sys_file
     * @param {number} uid uid of the record after which record from the clipboard will be pasted
     */
    static pasteInto(table, uid) {
        const $anchorElement = $(this);
        const performPaste = () => {
            const url = '&CB[paste]=' + table + '%7C' + uid
                + '&CB[pad]=normal'
                + '&redirect=' + ContextMenuActions.getReturnUrl();
            Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl + url).done(() => {
                if (table === 'pages' && Viewport.NavigationContainer.PageTree) {
                    Viewport.NavigationContainer.PageTree.refreshTree();
                }
            });
        };
        if (!$anchorElement.data('title')) {
            performPaste();
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
                text: $(this).data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
                btnClass: 'btn-warning',
                name: 'ok',
            },
        ]);
        $modal.on('button.clicked', (e) => {
            if (e.target.getAttribute('name') === 'ok') {
                performPaste();
            }
            Modal.dismiss();
        });
    }
}

export default ContextMenuActions;
