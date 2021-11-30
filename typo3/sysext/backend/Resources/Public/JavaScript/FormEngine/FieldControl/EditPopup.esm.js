import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
 * Handles the "Edit popup" field control that renders a new FormEngine instance
 */
class EditPopup {
    constructor(controlElementId) {
        this.controlElement = null;
        this.assignedFormField = null;
        this.registerChangeHandler = () => {
            this.controlElement.classList.toggle('disabled', this.assignedFormField.options.selectedIndex === -1);
        };
        /**
         * @param {Event} e
         */
        this.registerClickHandler = (e) => {
            e.preventDefault();
            const values = [];
            for (let i = 0; i < this.assignedFormField.selectedOptions.length; ++i) {
                const option = this.assignedFormField.selectedOptions.item(i);
                values.push(option.value);
            }
            const url = this.controlElement.getAttribute('href')
                + '&P[currentValue]=' + encodeURIComponent(this.assignedFormField.value)
                + '&P[currentSelectedValues]=' + values.join(',');
            const popupWindow = window.open(url, '', this.controlElement.dataset.windowParameters);
            popupWindow.focus();
        };
        documentService.ready().then(() => {
            this.controlElement = document.querySelector(controlElementId);
            this.assignedFormField = document.querySelector('select[data-formengine-input-name="' + this.controlElement.dataset.element + '"]');
            if (this.assignedFormField.options.selectedIndex === -1) {
                this.controlElement.classList.add('disabled');
            }
            this.assignedFormField.addEventListener('change', this.registerChangeHandler);
            this.controlElement.addEventListener('click', this.registerClickHandler);
        });
    }
}

export default EditPopup;
