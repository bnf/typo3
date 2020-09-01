define(['require', 'exports', './Enum/Severity', 'jquery', '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', './Modal', './Utility/MessageUtility', './Notification', 'nprogress', 'moment'], function (require, exports, Severity, $, AjaxRequest, Modal, MessageUtility, Notification, NProgress, moment) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
    var NProgress__default = /*#__PURE__*/_interopDefaultLegacy(NProgress);
    var moment__default = /*#__PURE__*/_interopDefaultLegacy(moment);

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
                $__default['default'](event.currentTarget).addClass('drop-in-progress');
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
                $__default['default'](event.currentTarget).removeClass('drop-in-progress');
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
            this.$body = $__default['default']('body');
            this.$element = $__default['default'](element);
            const hasTrigger = this.$element.data('dropzoneTrigger') !== undefined;
            this.$trigger = $__default['default'](this.$element.data('dropzoneTrigger'));
            this.defaultAction = this.$element.data('defaultAction') || Action.SKIP;
            this.$dropzone = $__default['default']('<div />').addClass('dropzone').hide();
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
            this.$dropzoneMask = $__default['default']('<div />').addClass('dropzone-mask').appendTo(this.$dropzone);
            this.fileInput = document.createElement('input');
            this.fileInput.setAttribute('type', 'file');
            this.fileInput.setAttribute('multiple', 'multiple');
            this.fileInput.setAttribute('name', 'files[]');
            this.fileInput.classList.add('upload-file-picker');
            this.$body.append(this.fileInput);
            this.$fileList = $__default['default'](this.$element.data('progress-container'));
            this.fileListColumnCount = $__default['default']('thead tr:first th', this.$fileList).length;
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
            $__default['default']('<span />').addClass('dropzone-close').on('click', this.hideDropzone).appendTo(this.$dropzone);
            // no filelist then create own progress table
            if (this.$fileList.length === 0) {
                this.$fileList = $__default['default']('<table />')
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
            NProgress__default['default'].start();
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
                        NProgress__default['default'].inc(this.percentagePerFile);
                    }
                    else {
                        new FileQueueItem(this, file, Action.SKIP);
                    }
                });
                ajaxCalls.push(request);
            });
            Promise.all(ajaxCalls).then(() => {
                this.drawOverrideModal();
                NProgress__default['default'].done();
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
                            Notification.showMessage(flashMessage.title, flashMessage.message, flashMessage.severity);
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
            const $modalContent = $__default['default']('<div/>').append($__default['default']('<p/>').text(TYPO3.lang['file_upload.existingfiles.description']), $__default['default']('<table/>', { class: 'table' }).append($__default['default']('<thead/>').append($__default['default']('<tr />').append($__default['default']('<th/>'), $__default['default']('<th/>').text(TYPO3.lang['file_upload.header.originalFile']), $__default['default']('<th/>').text(TYPO3.lang['file_upload.header.uploadedFile']), $__default['default']('<th/>').text(TYPO3.lang['file_upload.header.action'])))));
            for (let i = 0; i < amountOfItems; ++i) {
                const $record = $__default['default']('<tr />').append($__default['default']('<td />').append((this.askForOverride[i].original.thumbUrl !== ''
                    ? $__default['default']('<img />', { src: this.askForOverride[i].original.thumbUrl, height: 40 })
                    : $__default['default'](this.askForOverride[i].original.icon))), $__default['default']('<td />').html(this.askForOverride[i].original.name + ' (' + (DragUploader.fileSizeAsString(this.askForOverride[i].original.size)) + ')' +
                    '<br>' + moment__default['default'](this.askForOverride[i].original.mtime).format('YYYY-MM-DD HH:mm')), $__default['default']('<td />').html(this.askForOverride[i].uploaded.name + ' (' + (DragUploader.fileSizeAsString(this.askForOverride[i].uploaded.size)) + ')' +
                    '<br>' +
                    moment__default['default'](this.askForOverride[i].uploaded.lastModified
                        ? this.askForOverride[i].uploaded.lastModified
                        : this.askForOverride[i].uploaded.lastModifiedDate).format('YYYY-MM-DD HH:mm')), $__default['default']('<td />').append($__default['default']('<select />', { class: 'form-control t3js-actions', 'data-override': i }).append((this.irreObjectUid ? $__default['default']('<option/>').val(Action.USE_EXISTING).text(TYPO3.lang['file_upload.actions.use_existing']) : ''), $__default['default']('<option />', { 'selected': this.defaultAction === Action.SKIP })
                    .val(Action.SKIP).text(TYPO3.lang['file_upload.actions.skip']), $__default['default']('<option />', { 'selected': this.defaultAction === Action.RENAME })
                    .val(Action.RENAME).text(TYPO3.lang['file_upload.actions.rename']), $__default['default']('<option />', { 'selected': this.defaultAction === Action.OVERRIDE })
                    .val(Action.OVERRIDE).text(TYPO3.lang['file_upload.actions.override']))));
                $modalContent.find('table').append('<tbody />').append($record);
            }
            const $modal = Modal.confirm(TYPO3.lang['file_upload.existingfiles.title'], $modalContent, Severity.SeverityEnum.warning, [
                {
                    text: $__default['default'](this).data('button-close-text') || TYPO3.lang['file_upload.button.cancel'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                },
                {
                    text: $__default['default'](this).data('button-ok-text') || TYPO3.lang['file_upload.button.continue'] || 'Continue with selected actions',
                    btnClass: 'btn-warning',
                    name: 'continue',
                },
            ], ['modal-inner-scroll']);
            $modal.find('.modal-dialog').addClass('modal-lg');
            $modal.find('.modal-footer').prepend($__default['default']('<span/>').addClass('form-inline').append($__default['default']('<label/>').text(TYPO3.lang['file_upload.actions.all.label']), $__default['default']('<select/>', { class: 'form-control t3js-actions-all' }).append($__default['default']('<option/>').val('').text(TYPO3.lang['file_upload.actions.all.empty']), (this.irreObjectUid ? $__default['default']('<option/>').val(Action.USE_EXISTING).text(TYPO3.lang['file_upload.actions.all.use_existing']) : ''), $__default['default']('<option/>', { 'selected': this.defaultAction === Action.SKIP })
                .val(Action.SKIP).text(TYPO3.lang['file_upload.actions.all.skip']), $__default['default']('<option/>', { 'selected': this.defaultAction === Action.RENAME })
                .val(Action.RENAME).text(TYPO3.lang['file_upload.actions.all.rename']), $__default['default']('<option/>', { 'selected': this.defaultAction === Action.OVERRIDE })
                .val(Action.OVERRIDE).text(TYPO3.lang['file_upload.actions.all.override']))));
            const uploader = this;
            $modal.on('change', '.t3js-actions-all', function () {
                const $this = $__default['default'](this), value = $this.val();
                if (value !== '') {
                    // mass action was selected, apply action to every file
                    $modal.find('.t3js-actions').each((i, select) => {
                        const $select = $__default['default'](select), index = parseInt($select.data('override'), 10);
                        $select.val(value).prop('disabled', 'disabled');
                        uploader.askForOverride[index].action = $select.val();
                    });
                }
                else {
                    $modal.find('.t3js-actions').removeProp('disabled');
                }
            }).on('change', '.t3js-actions', function () {
                const $this = $__default['default'](this), index = parseInt($this.data('override'), 10);
                uploader.askForOverride[index].action = $this.val();
            }).on('button.clicked', function (e) {
                if ((e.target).name === 'cancel') {
                    uploader.askForOverride = [];
                    Modal.dismiss();
                }
                else if ((e.target).name === 'continue') {
                    $__default['default'].each(uploader.askForOverride, (key, fileInfo) => {
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
            this.$row = $__default['default']('<tr />').addClass('upload-queue-item uploading');
            this.$iconCol = $__default['default']('<td />').addClass('col-icon').appendTo(this.$row);
            this.$fileName = $__default['default']('<td />').text(file.name).appendTo(this.$row);
            this.$progress = $__default['default']('<td />').attr('colspan', this.dragUploader.fileListColumnCount - 2).appendTo(this.$row);
            this.$progressContainer = $__default['default']('<div />').addClass('upload-queue-progress').appendTo(this.$progress);
            this.$progressBar = $__default['default']('<div />').addClass('upload-queue-progress-bar').appendTo(this.$progressContainer);
            this.$progressPercentage = $__default['default']('<span />').addClass('upload-queue-progress-percentage').appendTo(this.$progressContainer);
            this.$progressMessage = $__default['default']('<span />').addClass('upload-queue-progress-message').appendTo(this.$progressContainer);
            // position queue item in filelist
            if ($__default['default']('tbody tr.upload-queue-item', this.dragUploader.$fileList).length === 0) {
                this.$row.prependTo($__default['default']('tbody', this.dragUploader.$fileList));
                this.$row.addClass('last');
            }
            else {
                this.$row.insertBefore($__default['default']('tbody tr.upload-queue-item:first', this.dragUploader.$fileList));
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
            const error = $__default['default'](response.responseText);
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
                    setTimeout(() => {
                        this.$row.remove();
                        if ($__default['default']('tr', this.dragUploader.$fileList).length === 0) {
                            this.dragUploader.$fileList.hide();
                            this.dragUploader.$trigger.trigger('uploadSuccess', [this, data]);
                        }
                    }, 3000);
                }
                else {
                    setTimeout(() => {
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
                $__default['default']('<td />').text('').appendTo(this.$row);
            }
            $__default['default']('<td />').text(fileInfo.extension.toUpperCase()).appendTo(this.$row);
            $__default['default']('<td />').text(fileInfo.date).appendTo(this.$row);
            $__default['default']('<td />').text(DragUploader.fileSizeAsString(fileInfo.size)).appendTo(this.$row);
            let permissions = '';
            if (fileInfo.permissions.read) {
                permissions += '<strong class="text-danger">' + TYPO3.lang['permissions.read'] + '</strong>';
            }
            if (fileInfo.permissions.write) {
                permissions += '<strong class="text-danger">' + TYPO3.lang['permissions.write'] + '</strong>';
            }
            $__default['default']('<td />').html(permissions).appendTo(this.$row);
            $__default['default']('<td />').text('-').appendTo(this.$row);
        }
        checkAllowedExtensions() {
            if (!this.dragUploader.filesExtensionsAllowed) {
                return true;
            }
            const extension = this.file.name.split('.').pop();
            const allowed = this.dragUploader.filesExtensionsAllowed.split(',');
            return $__default['default'].inArray(extension.toLowerCase(), allowed) !== -1;
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
            MessageUtility.MessageUtility.send(message);
        }
        static init() {
            const me = this;
            const opts = me.options;
            // register the jQuery plugin "DragUploaderPlugin"
            $__default['default'].fn.extend({
                dragUploader: function (options) {
                    return this.each((index, elem) => {
                        const $this = $__default['default'](elem);
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
            $__default['default'](() => {
                $__default['default']('.t3js-drag-uploader').dragUploader(opts);
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
            $__default['default'].each(TYPO3.settings.RequireJS.PostInitializationModules['TYPO3/CMS/Backend/DragUploader'], (pos, moduleName) => {
                new Promise(function (resolve, reject) { require([moduleName], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) });
            });
        }
    };
    initialize();

    exports.initialize = initialize;

    Object.defineProperty(exports, '__esModule', { value: true });

});
