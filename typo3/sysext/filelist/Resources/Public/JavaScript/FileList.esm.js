import InfoWindow from '../../../../backend/Resources/Public/JavaScript/InfoWindow.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import { BroadcastMessage } from '../../../../backend/Resources/Public/JavaScript/BroadcastMessage.esm.js';
import broadcastService from '../../../../backend/Resources/Public/JavaScript/BroadcastService.esm.js';

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
 * Module: TYPO3/CMS/Filelist/Filelist
 * @exports TYPO3/CMS/Filelist/Filelist
 */
class Filelist {
    static openInfoPopup(type, identifier) {
        InfoWindow.showItem(type, identifier);
    }
    static processTriggers() {
        const mainElement = document.querySelector('.filelist-main');
        if (mainElement === null) {
            return;
        }
        // emit event for currently shown folder
        Filelist.emitTreeUpdateRequest(mainElement.dataset.filelistCurrentFolderHash);
        // update recentIds (for whatever reason)
        if (top.fsMod && top.fsMod.recentIds instanceof Object) {
            top.fsMod.recentIds.file = encodeURIComponent(mainElement.dataset.filelistCurrentIdentifier);
        }
    }
    static registerTreeUpdateEvents() {
        // listen potential change of folder
        new RegularEvent('click', function () {
            Filelist.emitTreeUpdateRequest(this.dataset.treeUpdateRequest);
        }).delegateTo(document.body, '[data-tree-update-request]');
    }
    static emitTreeUpdateRequest(identifier) {
        const message = new BroadcastMessage('filelist', 'treeUpdateRequested', { type: 'folder', identifier: identifier });
        broadcastService.post(message);
    }
    static submitClipboardFormWithCommand(cmd) {
        const form = document.querySelector('form[name="dblistForm"]');
        form.querySelector('input[name="cmd"]').value = cmd;
        form.submit();
    }
    constructor() {
        Filelist.processTriggers();
        documentService.ready().then(() => {
            Filelist.registerTreeUpdateEvents();
            // file index events
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                Filelist.openInfoPopup(target.dataset.filelistShowItemType, target.dataset.filelistShowItemIdentifier);
            }).delegateTo(document, '[data-filelist-show-item-identifier][data-filelist-show-item-type]');
            // file search events
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                Filelist.openInfoPopup('_FILE', target.dataset.identifier);
            }).delegateTo(document, 'a.btn.filelist-file-info');
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                Filelist.openInfoPopup('_FILE', target.dataset.identifier);
            }).delegateTo(document, 'a.filelist-file-references');
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                const url = target.getAttribute('href');
                let redirectUrl = (url)
                    ? encodeURIComponent(url)
                    : encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
                top.list_frame.location.href = url + '&redirect=' + redirectUrl;
            }).delegateTo(document, 'a.btn.filelist-file-copy');
            // clipboard events
            const clipboardCmd = document.querySelector('[data-event-name="filelist:clipboard:cmd"]');
            if (clipboardCmd !== null) {
                new RegularEvent('filelist:clipboard:cmd', (event, target) => {
                    if (event.detail.result) {
                        Filelist.submitClipboardFormWithCommand(event.detail.payload);
                    }
                }).bindTo(clipboardCmd);
            }
            new RegularEvent('click', (event, target) => {
                const cmd = target.dataset.filelistClipboardCmd;
                Filelist.submitClipboardFormWithCommand(cmd);
            }).delegateTo(document, '[data-filelist-clipboard-cmd]:not([data-filelist-clipboard-cmd=""])');
        });
    }
}
var FileList = new Filelist();

export default FileList;
