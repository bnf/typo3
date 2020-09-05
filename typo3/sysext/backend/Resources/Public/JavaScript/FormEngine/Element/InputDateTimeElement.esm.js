import RegularEvent from '../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import FormEngineValidation from '../../FormEngineValidation.esm.js';

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
class InputDateTimeElement {
    constructor(elementId) {
        this.element = null;
        documentService.ready().then(() => {
            this.element = document.getElementById(elementId);
            this.registerEventHandler(this.element);
            import('../../DateTimePicker.esm.js').then(({ default: DateTimePicker }) => {
                DateTimePicker.initialize(this.element);
            });
        });
    }
    registerEventHandler(element) {
        new RegularEvent('formengine.dp.change', (e) => {
            FormEngineValidation.validateField(e.target);
            FormEngineValidation.markFieldAsChanged(e.target);
            document.querySelectorAll('.module-docheader-bar .btn').forEach((btn) => {
                btn.classList.remove('disabled');
                btn.disabled = false;
            });
        }).bindTo(element);
    }
}

export default InputDateTimeElement;
