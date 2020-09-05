import InfoWindow from '../../../../backend/Resources/Public/JavaScript/InfoWindow.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import { ModuleStateStorage } from '../../../../backend/Resources/Public/JavaScript/Storage/ModuleStateStorage.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import { BroadcastMessage } from '../../../../backend/Resources/Public/JavaScript/BroadcastMessage.esm.js';
import broadcastService from '../../../../backend/Resources/Public/JavaScript/BroadcastService.esm.js';
import tooltipObject from '../../../../backend/Resources/Public/JavaScript/Tooltip.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["fileListFormSelector"] = "form[name=\"fileListForm\"]";
    Selectors["commandSelector"] = "input[name=\"cmd\"]";
    Selectors["searchFieldSelector"] = "input[name=\"searchTerm\"]";
    Selectors["pointerFieldSelector"] = "input[name=\"pointer\"]";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Filelist/Filelist
 * @exports TYPO3/CMS/Filelist/Filelist
 */
class Filelist {
    constructor() {
        this.fileListForm = document.querySelector(Selectors.fileListFormSelector);
        this.command = this.fileListForm.querySelector(Selectors.commandSelector);
        this.searchField = this.fileListForm.querySelector(Selectors.searchFieldSelector);
        this.pointerField = this.fileListForm.querySelector(Selectors.pointerFieldSelector);
        this.activeSearch = (this.searchField.value !== '');
        Filelist.processTriggers();
        documentService.ready().then(() => {
            tooltipObject.initialize('.table-fit a[title]');
            // file index events
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                Filelist.openInfoPopup(target.dataset.filelistShowItemType, target.dataset.filelistShowItemIdentifier);
            }).delegateTo(document, '[data-filelist-show-item-identifier][data-filelist-show-item-type]');
            // file search events
            new RegularEvent('click', (event, target) => {
                event.preventDefault();
                Filelist.openInfoPopup('_FILE', target.dataset.identifier);
            }).delegateTo(document, 'a.filelist-file-info');
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
            }).delegateTo(document, 'a.filelist-file-copy');
            // clipboard events
            const clipboardCmd = document.querySelector('[data-event-name="filelist:clipboard:cmd"]');
            if (clipboardCmd !== null) {
                new RegularEvent('filelist:clipboard:cmd', (event, target) => {
                    if (event.detail.result) {
                        this.submitClipboardFormWithCommand(event.detail.payload);
                    }
                }).bindTo(clipboardCmd);
            }
            new RegularEvent('click', (event, target) => {
                const cmd = target.dataset.filelistClipboardCmd;
                this.submitClipboardFormWithCommand(cmd);
            }).delegateTo(document, '[data-filelist-clipboard-cmd]:not([data-filelist-clipboard-cmd=""])');
        });
        // Respond to browser related clearable event
        new RegularEvent('search', () => {
            if (this.searchField.value === '' && this.activeSearch) {
                this.fileListForm.submit();
            }
        }).bindTo(this.searchField);
    }
    static openInfoPopup(type, identifier) {
        InfoWindow.showItem(type, identifier);
    }
    static processTriggers() {
        const mainElement = document.querySelector('.filelist-main');
        if (mainElement === null) {
            return;
        }
        // update ModuleStateStorage to the current folder identifier
        const id = encodeURIComponent(mainElement.dataset.filelistCurrentIdentifier);
        ModuleStateStorage.update('file', id, true, undefined);
        // emit event for currently shown folder so the folder tree gets updated
        Filelist.emitTreeUpdateRequest(mainElement.dataset.filelistCurrentIdentifier);
    }
    static emitTreeUpdateRequest(identifier) {
        const message = new BroadcastMessage('filelist', 'treeUpdateRequested', { type: 'folder', identifier: identifier });
        broadcastService.post(message);
    }
    static parseQueryParameters(location) {
        let queryParameters = {};
        if (location && Object.prototype.hasOwnProperty.call(location, 'search')) {
            let parameters = location.search.substr(1).split('&');
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i].split('=');
                queryParameters[decodeURIComponent(parameter[0])] = decodeURIComponent(parameter[1]);
            }
        }
        return queryParameters;
    }
    submitClipboardFormWithCommand(cmd) {
        this.command.value = cmd;
        // In case we just copy elements to the clipboard, we try to fetch a possible pointer from the query
        // parameters, so after the form submit, we get to the same view as before. This is not done for delete
        // commands, since this may lead to empty sites, in case all elements from the current site are deleted.
        if (cmd === 'setCB') {
            const pointerValue = Filelist.parseQueryParameters(document.location).pointer;
            if (pointerValue) {
                this.pointerField.value = pointerValue;
            }
        }
        this.fileListForm.submit();
    }
}
var FileList = new Filelist();

export default FileList;
