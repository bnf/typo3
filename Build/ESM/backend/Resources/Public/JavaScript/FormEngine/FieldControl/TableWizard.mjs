import FormEngine from 'TYPO3/CMS/Backend/FormEngine';
import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.mjs';

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
 * Handles the "Table wizard" field control
 */
class TableWizard {
    constructor(controlElementId) {
        this.controlElement = null;
        /**
         * @param {Event} e
         */
        this.registerClickHandler = (e) => {
            e.preventDefault();
            FormEngine.preventFollowLinkIfNotSaved(this.controlElement.getAttribute('href'));
        };
        documentService.ready().then(() => {
            this.controlElement = document.querySelector(controlElementId);
            this.controlElement.addEventListener('click', this.registerClickHandler);
        });
    }
}

export default TableWizard;
