import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
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
 * Module: TYPO3/CMS/Filelist/FileDelete
 * @exports TYPO3/CMS/Filelist/FileDelete
 */
class FileDelete {
    constructor() {
        documentService.ready().then(() => {
            new RegularEvent('click', (e, eventTarget) => {
                e.preventDefault();
                let redirectUrl = eventTarget.dataset.redirectUrl;
                redirectUrl = (redirectUrl)
                    ? encodeURIComponent(redirectUrl)
                    : encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
                const identifier = eventTarget.dataset.identifier;
                const deleteType = eventTarget.dataset.deleteType;
                const deleteUrl = eventTarget.dataset.deleteUrl + '&data[delete][0][data]=' + encodeURIComponent(identifier);
                const target = deleteUrl + '&data[delete][0][redirect]=' + redirectUrl;
                if (eventTarget.dataset.check) {
                    const $modal = Modal.confirm(eventTarget.dataset.title, eventTarget.dataset.bsContent, SeverityEnum.warning, [
                        {
                            text: TYPO3.lang['buttons.confirm.delete_file.no'] || 'Cancel',
                            active: true,
                            btnClass: 'btn-default',
                            name: 'no',
                        },
                        {
                            text: TYPO3.lang['buttons.confirm.' + deleteType + '.yes'] || 'Yes, delete this file or folder',
                            btnClass: 'btn-warning',
                            name: 'yes',
                        },
                    ]);
                    $modal.on('button.clicked', (evt) => {
                        const $element = evt.target;
                        const name = $element.name;
                        if (name === 'no') {
                            Modal.dismiss();
                        }
                        else if (name === 'yes') {
                            Modal.dismiss();
                            top.list_frame.location.href = target;
                        }
                    });
                }
                else {
                    top.list_frame.location.href = target;
                }
            }).delegateTo(document, '.t3js-filelist-delete');
        });
    }
}
var FileDelete$1 = new FileDelete();

export default FileDelete$1;
