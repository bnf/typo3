import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import FormEngine from '../../FormEngine.esm.js';

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
 * Handles the "Add record" field control that renders a new FormEngine instance
 */
class AddRecord {
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

export default AddRecord;
