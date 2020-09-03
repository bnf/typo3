import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.mjs';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.mjs';

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
        this.initialize();
    }
    initialize() {
        jQuery('.t3js-submit-file-rename').on('click', this.checkForDuplicate);
    }
    checkForDuplicate(e) {
        e.preventDefault();
        const form = jQuery('#' + jQuery(e.currentTarget).attr('form'));
        const fileNameField = form.find('input[name="data[rename][0][target]"]');
        const conflictModeField = form.find('input[name="data[rename][0][conflictMode]"]');
        const ajaxUrl = TYPO3.settings.ajaxUrls.file_exists;
        jQuery.ajax({
            cache: false,
            data: {
                fileName: fileNameField.val(),
                fileTarget: form.find('input[name="data[rename][0][destination]"]').val(),
            },
            success: (response) => {
                const fileExists = typeof response.uid !== 'undefined';
                const originalFileName = fileNameField.data('original');
                const newFileName = fileNameField.val();
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
                            conflictModeField.val(event.target.name);
                            form.trigger('submit');
                        }
                        Modal.dismiss();
                    });
                }
                else {
                    form.trigger('submit');
                }
            },
            url: ajaxUrl,
        });
    }
}
var RenameFile$1 = new RenameFile();

export default RenameFile$1;
