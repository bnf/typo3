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
class BackendUserConfirmation {
    constructor() {
        documentService.ready().then(() => this.addFocusToFormInput());
    }
    addFocusToFormInput() {
        const confirmationPasswordField = document.getElementById('confirmationPassword');
        if (confirmationPasswordField !== null) {
            confirmationPasswordField.focus();
        }
    }
}
var BackendUserConfirmation$1 = new BackendUserConfirmation();

export default BackendUserConfirmation$1;
