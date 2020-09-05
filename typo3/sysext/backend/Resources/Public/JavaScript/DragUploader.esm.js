import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SeverityEnum } from './Enum/Severity.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from './Modal.esm.js';
import NotificationService from './Notification.esm.js';
import NProgress from '../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import { MessageUtility } from './Utility/MessageUtility.esm.js';
import __import_moment from '../../../../core/Resources/Public/JavaScript/Contrib/moment.esm.js';

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
 * Possible actions for conflicts w/ existing files
 */
var Action;
(function (Action) {
    Action["OVERRIDE"] = "replace";
    Action["RENAME"] = "rename";
    Action["SKIP"] = "cancel";
    Action["USE_EXISTING"] = "useExisting";
})(Action || (Action = {}));
class DragUploaderPlugin {
    constructor(element) {
        /**
         * Array of files which are asked for being overridden
         */
        this.askForOverride = [];
        this.percentagePerFile = 1;
        /**
         *
         * @param {Event} event
         */
        this.hideDropzone = (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.$dropzone.hide();
        };
        /**
         * @param {Event} event
         * @returns {boolean}
         */
        this.dragFileIntoDocument = (event) => {
            event.stopPropagation();
            event.preventDefault();
            jQuery(event.currentTarget).addClass('drop-in-progress');
            this.showDropzone();
            return false;
        };
        /**
         *
         * @param {Event} event
         * @returns {Boolean}
         */
        this.dragAborted = (event) => {
            event.stopPropagation();
            event.preventDefault();
            jQuery(event.currentTarget).removeClass('drop-in-progress');
            return false;
        };
        this.ignoreDrop = (event) => {
            // stops the browser from redirecting.
            event.stopPropagation();
            event.preventDefault();
            this.dragAborted(event);
            return false;
        };
        this.handleDrop = (event) => {
            this.ignoreDrop(event);
            this.processFiles(event.originalEvent.dataTransfer.files);
            this.$dropzone.removeClass('drop-status-ok');
        };
        this.fileInDropzone = () => {
            this.$dropzone.addClass('drop-status-ok');
        };
        this.fileOutOfDropzone = () => {
            this.$dropzone.removeClass('drop-status-ok');
        };
        this.$body = jQuery('body');
        this.$element = jQuery(element);
        const hasTrigger = this.$element.data('dropzoneTrigger') !== undefined;
        this.$trigger = jQuery(this.$element.data('dropzoneTrigger'));
        this.defaultAction = this.$element.data('defaultAction') || Action.SKIP;
        this.$dropzone = jQuery('<div />').addClass('dropzone').hide();
        this.irreObjectUid = this.$element.data('fileIrreObject');
        const dropZoneEscapedTarget = this.$element.data('dropzoneTarget');
        if (this.irreObjectUid && this.$element.nextAll(dropZoneEscapedTarget).length !== 0) {
            this.dropZoneInsertBefore = true;
            this.$dropzone.insertBefore(dropZoneEscapedTarget);
        }
        else {
            this.dropZoneInsertBefore = false;
            this.$dropzone.insertAfter(dropZoneEscapedTarget);
        }
        this.$dropzoneMask = jQuery('<div />').addClass('dropzone-mask').appendTo(this.$dropzone);
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('multiple', 'multiple');
        this.fileInput.setAttribute('name', 'files[]');
        this.fileInput.classList.add('upload-file-picker');
        this.$body.append(this.fileInput);
        this.$fileList = jQuery(this.$element.data('progress-container'));
        this.fileListColumnCount = jQuery('thead tr:first th', this.$fileList).length;
        this.filesExtensionsAllowed = this.$element.data('file-allowed');
        this.fileDenyPattern = this.$element.data('file-deny-pattern') ? new RegExp(this.$element.data('file-deny-pattern'), 'i') : null;
        this.maxFileSize = parseInt(this.$element.data('max-file-size'), 10);
        this.target = this.$element.data('target-folder');
        this.browserCapabilities = {
            fileReader: typeof FileReader !== 'undefined',
            DnD: 'draggable' in document.createElement('span'),
            Progress: 'upload' in new XMLHttpRequest,
        };
        if (!this.browserCapabilities.DnD) {
            console.warn('Browser has no Drag and drop capabilities; cannot initialize DragUploader');
            return;
        }
        this.$body.on('dragover', this.dragFileIntoDocument);
        this.$body.on('dragend', this.dragAborted);
        this.$body.on('drop', this.ignoreDrop);
        this.$dropzone.on('dragenter', this.fileInDropzone);
        this.$dropzoneMask.on('dragenter', this.fileInDropzone);
        this.$dropzoneMask.on('dragleave', this.fileOutOfDropzone);
        this.$dropzoneMask.on('drop', (ev) => this.handleDrop(ev));
        this.$dropzone.prepend('<div class="dropzone-hint">' +
            '<div class="dropzone-hint-media">' +
            '<div class="dropzone-hint-icon"></div>' +
            '</div>' +
            '<div class="dropzone-hint-body">' +
            '<h3 class="dropzone-hint-title">' +
            TYPO3.lang['file_upload.dropzonehint.title'] +
            '</h3>' +
            '<p class="dropzone-hint-message">' +
            TYPO3.lang['file_upload.dropzonehint.message'] +
            '</p>' +
            '</div>' +
            '</div>').on('click', () => {
            this.fileInput.click();
        });
        jQuery('<span />').addClass('dropzone-close').on('click', this.hideDropzone).appendTo(this.$dropzone);
        // no filelist then create own progress table
        if (this.$fileList.length === 0) {
            this.$fileList = jQuery('<table />')
                .attr('id', 'typo3-filelist')
                .addClass('table table-striped table-hover upload-queue')
                .html('<tbody></tbody>').hide();
            if (this.dropZoneInsertBefore) {
                this.$fileList.insertAfter(this.$dropzone);
            }
            else {
                this.$fileList.insertBefore(this.$dropzone);
            }
            this.fileListColumnCount = 7;
        }
        this.fileInput.addEventListener('change', () => {
            this.processFiles(Array.apply(null, this.fileInput.files));
        });
        this.bindUploadButton(hasTrigger === true ? this.$trigger : this.$element);
    }
    showDropzone() {
        this.$dropzone.show();
    }
    /**
     * @param {FileList} files
     */
    processFiles(files) {
        this.queueLength = files.length;
        if (!this.$fileList.is(':visible')) {
            this.$fileList.show();
        }
        NProgress.start();
        this.percentagePerFile = 1 / files.length;
        // Check for each file if is already exist before adding it to the queue
        const ajaxCalls = [];
        Array.from(files).forEach((file) => {
            const request = new AjaxRequest(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments({
                fileName: file.name,
                fileTarget: this.target,
            }).get({ cache: 'no-cache' }).then(async (response) => {
                const data = await response.resolve();
                const fileExists = typeof data.uid !== 'undefined';
                if (fileExists) {
                    this.askForOverride.push({
                        original: data,
                        uploaded: file,
                        action: this.irreObjectUid ? Action.USE_EXISTING : this.defaultAction,
                    });
                    NProgress.inc(this.percentagePerFile);
                }
                else {
                    new FileQueueItem(this, file, Action.SKIP);
                }
            });
            ajaxCalls.push(request);
        });
        Promise.all(ajaxCalls).then(() => {
            this.drawOverrideModal();
            NProgress.done();
        });
        this.fileInput.value = '';
    }
    /**
     * Bind file picker to default upload button
     *
     * @param {Object} button
     */
    bindUploadButton(button) {
        button.on('click', (event) => {
            event.preventDefault();
            this.fileInput.click();
            this.showDropzone();
        });
    }
    /**
     * Decrements the queue and renders a flash message if queue is empty
     */
    decrementQueueLength() {
        if (this.queueLength > 0) {
            this.queueLength--;
            if (this.queueLength === 0) {
                new AjaxRequest(TYPO3.settings.ajaxUrls.flashmessages_render).get({ cache: 'no-cache' }).then(async (response) => {
                    const data = await response.resolve();
                    for (let flashMessage of data) {
                        NotificationService.showMessage(flashMessage.title, flashMessage.message, flashMessage.severity);
                    }
                });
            }
        }
    }
    /**
     * Renders the modal for existing files
     */
    drawOverrideModal() {
        const amountOfItems = Object.keys(this.askForOverride).length;
        if (amountOfItems === 0) {
            return;
        }
        const $modalContent = jQuery('<div/>').append(jQuery('<p/>').text(TYPO3.lang['file_upload.existingfiles.description']), jQuery('<table/>', { class: 'table' }).append(jQuery('<thead/>').append(jQuery('<tr />').append(jQuery('<th/>'), jQuery('<th/>').text(TYPO3.lang['file_upload.header.originalFile']), jQuery('<th/>').text(TYPO3.lang['file_upload.header.uploadedFile']), jQuery('<th/>').text(TYPO3.lang['file_upload.header.action'])))));
        for (let i = 0; i < amountOfItems; ++i) {
            const $record = jQuery('<tr />').append(jQuery('<td />').append((this.askForOverride[i].original.thumbUrl !== ''
                ? jQuery('<img />', { src: this.askForOverride[i].original.thumbUrl, height: 40 })
                : jQuery(this.askForOverride[i].original.icon))), jQuery('<td />').html(this.askForOverride[i].original.name + ' (' + (DragUploader.fileSizeAsString(this.askForOverride[i].original.size)) + ')' +
                '<br>' + __import_moment(this.askForOverride[i].original.mtime).format('YYYY-MM-DD HH:mm')), jQuery('<td />').html(this.askForOverride[i].uploaded.name + ' (' + (DragUploader.fileSizeAsString(this.askForOverride[i].uploaded.size)) + ')' +
                '<br>' +
                __import_moment(this.askForOverride[i].uploaded.lastModified
                    ? this.askForOverride[i].uploaded.lastModified
                    : this.askForOverride[i].uploaded.lastModifiedDate).format('YYYY-MM-DD HH:mm')), jQuery('<td />').append(jQuery('<select />', { class: 'form-control t3js-actions', 'data-override': i }).append((this.irreObjectUid ? jQuery('<option/>').val(Action.USE_EXISTING).text(TYPO3.lang['file_upload.actions.use_existing']) : ''), jQuery('<option />', { 'selected': this.defaultAction === Action.SKIP })
                .val(Action.SKIP).text(TYPO3.lang['file_upload.actions.skip']), jQuery('<option />', { 'selected': this.defaultAction === Action.RENAME })
                .val(Action.RENAME).text(TYPO3.lang['file_upload.actions.rename']), jQuery('<option />', { 'selected': this.defaultAction === Action.OVERRIDE })
                .val(Action.OVERRIDE).text(TYPO3.lang['file_upload.actions.override']))));
            $modalContent.find('table').append('<tbody />').append($record);
        }
        const $modal = Modal.confirm(TYPO3.lang['file_upload.existingfiles.title'], $modalContent, SeverityEnum.warning, [
            {
                text: jQuery(this).data('button-close-text') || TYPO3.lang['file_upload.button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            },
            {
                text: jQuery(this).data('button-ok-text') || TYPO3.lang['file_upload.button.continue'] || 'Continue with selected actions',
                btnClass: 'btn-warning',
                name: 'continue',
            },
        ], ['modal-inner-scroll']);
        $modal.find('.modal-dialog').addClass('modal-lg');
        $modal.find('.modal-footer').prepend(jQuery('<span/>').addClass('form-inline').append(jQuery('<label/>').text(TYPO3.lang['file_upload.actions.all.label']), jQuery('<select/>', { class: 'form-control t3js-actions-all' }).append(jQuery('<option/>').val('').text(TYPO3.lang['file_upload.actions.all.empty']), (this.irreObjectUid ? jQuery('<option/>').val(Action.USE_EXISTING).text(TYPO3.lang['file_upload.actions.all.use_existing']) : ''), jQuery('<option/>', { 'selected': this.defaultAction === Action.SKIP })
            .val(Action.SKIP).text(TYPO3.lang['file_upload.actions.all.skip']), jQuery('<option/>', { 'selected': this.defaultAction === Action.RENAME })
            .val(Action.RENAME).text(TYPO3.lang['file_upload.actions.all.rename']), jQuery('<option/>', { 'selected': this.defaultAction === Action.OVERRIDE })
            .val(Action.OVERRIDE).text(TYPO3.lang['file_upload.actions.all.override']))));
        const uploader = this;
        $modal.on('change', '.t3js-actions-all', function () {
            const $this = jQuery(this), value = $this.val();
            if (value !== '') {
                // mass action was selected, apply action to every file
                $modal.find('.t3js-actions').each((i, select) => {
                    const $select = jQuery(select), index = parseInt($select.data('override'), 10);
                    $select.val(value).prop('disabled', 'disabled');
                    uploader.askForOverride[index].action = $select.val();
                });
            }
            else {
                $modal.find('.t3js-actions').removeProp('disabled');
            }
        }).on('change', '.t3js-actions', function () {
            const $this = jQuery(this), index = parseInt($this.data('override'), 10);
            uploader.askForOverride[index].action = $this.val();
        }).on('button.clicked', function (e) {
            if ((e.target).name === 'cancel') {
                uploader.askForOverride = [];
                Modal.dismiss();
            }
            else if ((e.target).name === 'continue') {
                jQuery.each(uploader.askForOverride, (key, fileInfo) => {
                    if (fileInfo.action === Action.USE_EXISTING) {
                        DragUploader.addFileToIrre(uploader.irreObjectUid, fileInfo.original);
                    }
                    else if (fileInfo.action !== Action.SKIP) {
                        new FileQueueItem(uploader, fileInfo.uploaded, fileInfo.action);
                    }
                });
                uploader.askForOverride = [];
                Modal.dismiss();
            }
        }).on('hidden.bs.modal', () => {
            this.askForOverride = [];
        });
    }
}
class FileQueueItem {
    constructor(dragUploader, file, override) {
        this.dragUploader = dragUploader;
        this.file = file;
        this.override = override;
        this.$row = jQuery('<tr />').addClass('upload-queue-item uploading');
        this.$iconCol = jQuery('<td />').addClass('col-icon').appendTo(this.$row);
        this.$fileName = jQuery('<td />').text(file.name).appendTo(this.$row);
        this.$progress = jQuery('<td />').attr('colspan', this.dragUploader.fileListColumnCount - 2).appendTo(this.$row);
        this.$progressContainer = jQuery('<div />').addClass('upload-queue-progress').appendTo(this.$progress);
        this.$progressBar = jQuery('<div />').addClass('upload-queue-progress-bar').appendTo(this.$progressContainer);
        this.$progressPercentage = jQuery('<span />').addClass('upload-queue-progress-percentage').appendTo(this.$progressContainer);
        this.$progressMessage = jQuery('<span />').addClass('upload-queue-progress-message').appendTo(this.$progressContainer);
        // position queue item in filelist
        if (jQuery('tbody tr.upload-queue-item', this.dragUploader.$fileList).length === 0) {
            this.$row.prependTo(jQuery('tbody', this.dragUploader.$fileList));
            this.$row.addClass('last');
        }
        else {
            this.$row.insertBefore(jQuery('tbody tr.upload-queue-item:first', this.dragUploader.$fileList));
        }
        // set dummy file icon
        this.$iconCol.html('<span class="t3-icon t3-icon-mimetypes t3-icon-other-other">&nbsp;</span>');
        // check file size
        if (this.dragUploader.maxFileSize > 0 && this.file.size > this.dragUploader.maxFileSize) {
            this.updateMessage(TYPO3.lang['file_upload.maxFileSizeExceeded']
                .replace(/\{0\}/g, this.file.name)
                .replace(/\{1\}/g, DragUploader.fileSizeAsString(this.dragUploader.maxFileSize)));
            this.$row.addClass('error');
            // check filename/extension against deny pattern
        }
        else if (this.dragUploader.fileDenyPattern && this.file.name.match(this.dragUploader.fileDenyPattern)) {
            this.updateMessage(TYPO3.lang['file_upload.fileNotAllowed'].replace(/\{0\}/g, this.file.name));
            this.$row.addClass('error');
        }
        else if (!this.checkAllowedExtensions()) {
            this.updateMessage(TYPO3.lang['file_upload.fileExtensionExpected']
                .replace(/\{0\}/g, this.dragUploader.filesExtensionsAllowed));
            this.$row.addClass('error');
        }
        else {
            this.updateMessage('- ' + DragUploader.fileSizeAsString(this.file.size));
            const formData = new FormData();
            formData.append('data[upload][1][target]', this.dragUploader.target);
            formData.append('data[upload][1][data]', '1');
            formData.append('overwriteExistingFiles', this.override);
            formData.append('redirect', '');
            formData.append('upload_1', this.file);
            // We use XMLHttpRequest as we need the `progress` event which isn't supported by fetch()
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        this.uploadSuccess(JSON.parse(xhr.responseText));
                    }
                    else {
                        this.uploadError(xhr);
                    }
                }
            };
            xhr.upload.addEventListener('progress', (e) => this.updateProgress(e));
            xhr.open('POST', TYPO3.settings.ajaxUrls.file_process);
            xhr.send(formData);
        }
    }
    /**
     * @param {string} message
     */
    updateMessage(message) {
        this.$progressMessage.text(message);
    }
    /**
     * Remove the progress bar
     */
    removeProgress() {
        if (this.$progress) {
            this.$progress.remove();
        }
    }
    uploadStart() {
        this.$progressPercentage.text('(0%)');
        this.$progressBar.width('1%');
        this.dragUploader.$trigger.trigger('uploadStart', [this]);
    }
    /**
     * @param {XMLHttpRequest} response
     */
    uploadError(response) {
        this.updateMessage(TYPO3.lang['file_upload.uploadFailed'].replace(/\{0\}/g, this.file.name));
        const error = jQuery(response.responseText);
        if (error.is('t3err')) {
            this.$progressPercentage.text(error.text());
        }
        else {
            this.$progressPercentage.text('(' + response.statusText + ')');
        }
        this.$row.addClass('error');
        this.dragUploader.decrementQueueLength();
        this.dragUploader.$trigger.trigger('uploadError', [this, response]);
    }
    /**
     * @param {ProgressEvent} event
     */
    updateProgress(event) {
        const percentage = Math.round((event.loaded / event.total) * 100) + '%';
        this.$progressBar.outerWidth(percentage);
        this.$progressPercentage.text(percentage);
        this.dragUploader.$trigger.trigger('updateProgress', [this, percentage, event]);
    }
    /**
     * @param {{upload?: UploadedFile[]}} data
     */
    uploadSuccess(data) {
        if (data.upload) {
            this.dragUploader.decrementQueueLength();
            this.$row.removeClass('uploading');
            this.$fileName.text(data.upload[0].name);
            this.$progressPercentage.text('');
            this.$progressMessage.text('100%');
            this.$progressBar.outerWidth('100%');
            // replace file icon
            if (data.upload[0].icon) {
                this.$iconCol
                    .html('<a href="#" class="t3js-contextmenutrigger" data-uid="'
                    + data.upload[0].id + '" data-table="sys_file">'
                    + data.upload[0].icon + '&nbsp;</span></a>');
            }
            if (this.dragUploader.irreObjectUid) {
                DragUploader.addFileToIrre(this.dragUploader.irreObjectUid, data.upload[0]);
                window.setTimeout(() => {
                    this.$row.remove();
                    if (jQuery('tr', this.dragUploader.$fileList).length === 0) {
                        this.dragUploader.$fileList.hide();
                        this.dragUploader.$trigger.trigger('uploadSuccess', [this, data]);
                    }
                }, 3000);
            }
            else {
                window.setTimeout(() => {
                    this.showFileInfo(data.upload[0]);
                    this.dragUploader.$trigger.trigger('uploadSuccess', [this, data]);
                }, 3000);
            }
        }
    }
    /**
     * @param {UploadedFile} fileInfo
     */
    showFileInfo(fileInfo) {
        this.removeProgress();
        // add spacing cells when clipboard and/or extended view is enabled
        for (let i = 7; i < this.dragUploader.fileListColumnCount; i++) {
            jQuery('<td />').text('').appendTo(this.$row);
        }
        jQuery('<td />').text(fileInfo.extension.toUpperCase()).appendTo(this.$row);
        jQuery('<td />').text(fileInfo.date).appendTo(this.$row);
        jQuery('<td />').text(DragUploader.fileSizeAsString(fileInfo.size)).appendTo(this.$row);
        let permissions = '';
        if (fileInfo.permissions.read) {
            permissions += '<strong class="text-danger">' + TYPO3.lang['permissions.read'] + '</strong>';
        }
        if (fileInfo.permissions.write) {
            permissions += '<strong class="text-danger">' + TYPO3.lang['permissions.write'] + '</strong>';
        }
        jQuery('<td />').html(permissions).appendTo(this.$row);
        jQuery('<td />').text('-').appendTo(this.$row);
    }
    checkAllowedExtensions() {
        if (!this.dragUploader.filesExtensionsAllowed) {
            return true;
        }
        const extension = this.file.name.split('.').pop();
        const allowed = this.dragUploader.filesExtensionsAllowed.split(',');
        return jQuery.inArray(extension.toLowerCase(), allowed) !== -1;
    }
}
class DragUploader {
    static fileSizeAsString(size) {
        const sizeKB = size / 1024;
        let str = '';
        if (sizeKB > 1024) {
            str = (sizeKB / 1024).toFixed(1) + ' MB';
        }
        else {
            str = sizeKB.toFixed(1) + ' KB';
        }
        return str;
    }
    /**
     * @param {number} irre_object
     * @param {UploadedFile} file
     */
    static addFileToIrre(irre_object, file) {
        const message = {
            actionName: 'typo3:foreignRelation:insert',
            objectGroup: irre_object,
            table: 'sys_file',
            uid: file.uid,
        };
        MessageUtility.send(message);
    }
    static init() {
        const me = this;
        const opts = me.options;
        // register the jQuery plugin "DragUploaderPlugin"
        jQuery.fn.extend({
            dragUploader: function (options) {
                return this.each((index, elem) => {
                    const $this = jQuery(elem);
                    let data = $this.data('DragUploaderPlugin');
                    if (!data) {
                        $this.data('DragUploaderPlugin', (data = new DragUploaderPlugin(elem)));
                    }
                    if (typeof options === 'string') {
                        data[options]();
                    }
                });
            },
        });
        jQuery(() => {
            jQuery('.t3js-drag-uploader').dragUploader(opts);
        });
    }
}
const initialize = function () {
    DragUploader.init();
    // load required modules to hook in the post initialize function
    if ('undefined' !== typeof TYPO3.settings
        && 'undefined' !== typeof TYPO3.settings.RequireJS
        && 'undefined' !== typeof TYPO3.settings.RequireJS.PostInitializationModules
        && 'undefined' !== typeof TYPO3.settings.RequireJS.PostInitializationModules['TYPO3/CMS/Backend/DragUploader']) {
        jQuery.each(TYPO3.settings.RequireJS.PostInitializationModules['TYPO3/CMS/Backend/DragUploader'], (pos, moduleName) => {
            import(moduleName);
        });
    }
};
initialize();

export { initialize };
