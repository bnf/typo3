import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import FormEngine from '../../FormEngine.esm.js';
import { AbstractSortableSelectItems } from './AbstractSortableSelectItems.esm.js';
import SelectBoxFilter from './Extra/SelectBoxFilter.esm.js';

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
class SelectMultipleSideBySideElement extends AbstractSortableSelectItems {
    constructor(selectedOptionsElementId, availableOptionsElementId) {
        super();
        this.selectedOptionsElement = null;
        this.availableOptionsElement = null;
        documentService.ready().then((document) => {
            this.selectedOptionsElement = document.getElementById(selectedOptionsElementId);
            this.availableOptionsElement = document.getElementById(availableOptionsElementId);
            this.registerEventHandler();
        });
    }
    registerEventHandler() {
        this.registerSortableEventHandler(this.selectedOptionsElement);
        this.availableOptionsElement.addEventListener('click', (e) => {
            const el = e.currentTarget;
            const fieldName = el.dataset.relatedfieldname;
            if (fieldName) {
                const exclusiveValues = el.dataset.exclusivevalues;
                const selectedOptions = el.querySelectorAll('option:checked'); // Yep, :checked finds selected options
                if (selectedOptions.length > 0) {
                    selectedOptions.forEach((optionElement) => {
                        FormEngine.setSelectOptionFromExternalSource(fieldName, optionElement.value, optionElement.textContent, optionElement.getAttribute('title'), exclusiveValues, optionElement);
                    });
                }
            }
        });
        // tslint:disable-next-line:no-unused-expression
        new SelectBoxFilter(this.availableOptionsElement);
    }
}

export default SelectMultipleSideBySideElement;
