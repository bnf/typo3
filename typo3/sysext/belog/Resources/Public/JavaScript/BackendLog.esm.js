import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.esm.js';

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
 * Module: TYPO3/CMS/Belog/BackendLog
 * JavaScript for backend log
 * @exports TYPO3/CMS/Belog/BackendLog
 */
class BackendLog {
    constructor() {
        this.clearableElements = null;
        documentService.ready().then(() => {
            this.clearableElements = document.querySelectorAll('.t3js-clearable');
            this.initializeClearableElements();
        });
    }
    initializeClearableElements() {
        this.clearableElements.forEach((clearableField) => clearableField.clearable());
    }
}
var BackendLog$1 = new BackendLog();

export default BackendLog$1;
