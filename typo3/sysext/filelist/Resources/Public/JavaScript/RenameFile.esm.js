import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
 * Module: TYPO3/CMS/Filelist/RenameFile
 * Modal to pick the required conflict strategy for colliding filenames
 * @exports TYPO3/CMS/Filelist/RenameFile
 */
class RenameFile {
    constructor() {
        documentService.ready().then(() => {
            this.initialize();
        });
    }
    initialize() {
        const submitButton = document.querySelector('.t3js-submit-file-rename');
        if (submitButton !== null) {
            submitButton.addEventListener('click', this.checkForDuplicate);
        }
    }
    checkForDuplicate(e) {
        e.preventDefault();
        const form = e.currentTarget.form;
        const fileNameField = form.querySelector('input[name="data[rename][0][target]"]');
        const destinationField = form.querySelector('input[name="data[rename][0][destination]"]');
        const conflictModeField = form.querySelector('input[name="data[rename][0][conflictMode]"]');
        new AjaxRequest(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments({
            fileName: fileNameField.value,
            fileTarget: destinationField.value,
        }).get({ cache: 'no-cache' }).then(async (response) => {
            const result = await response.resolve();
            const fileExists = typeof result.uid !== 'undefined';
            const originalFileName = fileNameField.dataset.original;
            const newFileName = fileNameField.value;
            if (fileExists && originalFileName !== newFileName) {
                const description = TYPO3.lang['file_rename.exists.description']
                    .replace('{0}', originalFileName).replace(/\{1\}/g, newFileName);
                const modal = Modal.confirm(TYPO3.lang['file_rename.exists.title'], description, SeverityEnum.warning, [
                    {
                        active: true,
                        btnClass: 'btn-default',
                        name: 'cancel',
                        text: TYPO3.lang['file_rename.actions.cancel'],
                    },
                    {
                        btnClass: 'btn-primary',
                        name: 'rename',
                        text: TYPO3.lang['file_rename.actions.rename'],
                    },
                    {
                        btnClass: 'btn-default',
                        name: 'replace',
                        text: TYPO3.lang['file_rename.actions.override'],
                    },
                ]);
                modal.on('button.clicked', (event) => {
                    if (event.target.name !== 'cancel') {
                        conflictModeField.value = event.target.name;
                        form.submit();
                    }
                    Modal.dismiss();
                });
            }
            else {
                form.submit();
            }
        });
    }
}
var RenameFile$1 = new RenameFile();

export default RenameFile$1;
