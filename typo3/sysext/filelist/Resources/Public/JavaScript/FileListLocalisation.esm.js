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
 * Module: TYPO3/CMS/Filelist/FileListLocalisation
 * @exports TYPO3/CMS/Filelist/FileListLocalisation
 */
class FileListLocalisation {
    constructor() {
        documentService.ready().then(() => {
            new RegularEvent('click', (event, target) => {
                const id = target.dataset.fileid;
                document.querySelector('div[data-fileid="' + id + '"]').classList.toggle('hidden');
            }).delegateTo(document, 'a.filelist-translationToggler');
        });
    }
}
var FileListLocalisation$1 = new FileListLocalisation();

export default FileListLocalisation$1;
