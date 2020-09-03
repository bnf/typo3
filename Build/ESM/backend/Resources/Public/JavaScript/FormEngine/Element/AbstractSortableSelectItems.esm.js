import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import FormEngineValidation from '../../FormEngineValidation.esm.js';
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
class AbstractSortableSelectItems {
    constructor() {
        /**
         * @param {HTMLSelectElement} fieldElement
         */
        this.registerSortableEventHandler = (fieldElement) => {
            const aside = fieldElement.closest('.form-wizards-wrap').querySelector('.form-wizards-items-aside');
            if (aside === null) {
                return;
            }
            aside.addEventListener('click', (e) => {
                let target;
                if ((target = e.target.closest('.t3js-btn-option')) === null) {
                    if (e.target.matches('.t3js-btn-option')) {
                        target = e.target;
                    }
                    return;
                }
                e.preventDefault();
                const relatedFieldName = target.dataset.fieldname;
                if (target.classList.contains('t3js-btn-moveoption-top')) {
                    AbstractSortableSelectItems.moveOptionToTop(fieldElement);
                }
                else if (target.classList.contains('t3js-btn-moveoption-up')) {
                    AbstractSortableSelectItems.moveOptionUp(fieldElement);
                }
                else if (target.classList.contains('t3js-btn-moveoption-down')) {
                    AbstractSortableSelectItems.moveOptionDown(fieldElement);
                }
                else if (target.classList.contains('t3js-btn-moveoption-bottom')) {
                    AbstractSortableSelectItems.moveOptionToBottom(fieldElement);
                }
                else if (target.classList.contains('t3js-btn-removeoption')) {
                    AbstractSortableSelectItems.removeOption(fieldElement, FormEngine.getFieldElement(relatedFieldName, '_avail').get(0));
                }
                FormEngine.updateHiddenFieldValueFromSelect(fieldElement, FormEngine.getFieldElement(relatedFieldName).get(0));
                FormEngine.legacyFieldChangedCb();
                FormEngineValidation.markFieldAsChanged(jQuery(fieldElement));
                FormEngineValidation.validate();
            });
        };
    }
    /**
     * Moves currently selected options from a select field to the very top,
     * can be multiple entries as well
     *
     * @param {HTMLSelectElement} fieldElement
     */
    static moveOptionToTop(fieldElement) {
        Array.from(fieldElement.querySelectorAll(':checked')).reverse().forEach((optionEl) => {
            fieldElement.insertBefore(optionEl, fieldElement.firstElementChild);
        });
    }
    /**
     * Moves currently selected options from a select field as the very last entries
     *
     * @param {HTMLSelectElement} fieldElement
     */
    static moveOptionToBottom(fieldElement) {
        fieldElement.querySelectorAll(':checked').forEach((optionEl) => {
            fieldElement.insertBefore(optionEl, null);
        });
    }
    /**
     * Moves currently selected options from a select field up by one position,
     * can be multiple entries as well
     *
     * @param {HTMLSelectElement} fieldElement
     */
    static moveOptionUp(fieldElement) {
        const allChildren = Array.from(fieldElement.children);
        const selectedOptions = Array.from(fieldElement.querySelectorAll(':checked'));
        for (let optionEl of selectedOptions) {
            if (allChildren.indexOf(optionEl) === 0 && optionEl.previousElementSibling === null) {
                break;
            }
            fieldElement.insertBefore(optionEl, optionEl.previousElementSibling);
        }
    }
    /**
     * Moves currently selected options from a select field up by one position,
     * can be multiple entries as well
     *
     * @param {HTMLSelectElement} fieldElement
     */
    static moveOptionDown(fieldElement) {
        const allChildren = Array.from(fieldElement.children).reverse();
        const selectedOptions = Array.from(fieldElement.querySelectorAll(':checked')).reverse();
        for (let optionEl of selectedOptions) {
            if (allChildren.indexOf(optionEl) === 0 && optionEl.nextElementSibling === null) {
                break;
            }
            fieldElement.insertBefore(optionEl, optionEl.nextElementSibling.nextElementSibling);
        }
    }
    /**
     * Removes currently selected options from a select field
     *
     * @param {HTMLSelectElement} fieldElement
     * @param {HTMLSelectElement} availableFieldElement
     */
    static removeOption(fieldElement, availableFieldElement) {
        fieldElement.querySelectorAll(':checked').forEach((option) => {
            const originalOption = availableFieldElement.querySelector('option[value="' + option.value + '"]');
            if (originalOption !== null) {
                originalOption.classList.remove('hidden');
                originalOption.disabled = false;
            }
            fieldElement.removeChild(option);
        });
    }
}

export { AbstractSortableSelectItems };
