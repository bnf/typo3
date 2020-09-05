define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../backend/Resources/Public/JavaScript/InfoWindow', '../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../backend/Resources/Public/JavaScript/BroadcastMessage', '../../../../backend/Resources/Public/JavaScript/BroadcastService'], function (jquery, InfoWindow, RegularEvent, BroadcastMessage, BroadcastService) { 'use strict';

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
            const message = new BroadcastMessage.BroadcastMessage('filelist', 'treeUpdateRequested', { type: 'folder', identifier: identifier });
            BroadcastService.post(message);
        }
        static submitClipboardFormWithCommand(cmd) {
            const $form = jquery('form[name="dblistForm"]');
            $form.find('input[name="cmd"]').val(cmd);
            $form.trigger('submit');
        }
        constructor() {
            Filelist.processTriggers();
            jquery(() => {
                Filelist.registerTreeUpdateEvents();
                // file index events
                jquery('[data-filelist-show-item-identifier][data-filelist-show-item-type]').on('click', (evt) => {
                    const $element = jquery(evt.currentTarget);
                    evt.preventDefault();
                    Filelist.openInfoPopup($element.data('filelistShowItemType'), $element.data('filelistShowItemIdentifier'));
                });
                // file search events
                jquery('a.btn.filelist-file-info').on('click', (event) => {
                    event.preventDefault();
                    Filelist.openInfoPopup('_FILE', jquery(event.currentTarget).attr('data-identifier'));
                });
                jquery('a.filelist-file-references').on('click', (event) => {
                    event.preventDefault();
                    Filelist.openInfoPopup('_FILE', jquery(event.currentTarget).attr('data-identifier'));
                });
                jquery('a.btn.filelist-file-copy').on('click', (event) => {
                    event.preventDefault();
                    const $element = jquery(event.currentTarget);
                    const url = $element.attr('href');
                    let redirectUrl = (url)
                        ? encodeURIComponent(url)
                        : encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
                    top.list_frame.location.href = url + '&redirect=' + redirectUrl;
                });
                // clipboard events
                jquery('[data-event-name="filelist:clipboard:cmd"]').on('filelist:clipboard:cmd', (evt) => {
                    const originalEvent = evt.originalEvent;
                    if (originalEvent.detail.result) {
                        Filelist.submitClipboardFormWithCommand(originalEvent.detail.payload);
                    }
                });
                jquery('[data-filelist-clipboard-cmd]:not([data-filelist-clipboard-cmd=""])').on('click', (evt) => {
                    const cmd = jquery(evt.currentTarget).data('filelistClipboardCmd');
                    Filelist.submitClipboardFormWithCommand(cmd);
                });
            });
        }
    }
    var FileList = new Filelist();

    return FileList;

});
