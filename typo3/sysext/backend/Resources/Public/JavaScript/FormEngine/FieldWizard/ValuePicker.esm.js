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
var InsertModes;
(function (InsertModes) {
    InsertModes["append"] = "append";
    InsertModes["replace"] = "replace";
    InsertModes["prepend"] = "prepend";
})(InsertModes || (InsertModes = {}));
/**
 * Module TYPO3/CMS/Backend/FormEngine/FieldWizard/ValuePicker
 *
 * @example
 * <typo3-formengine-valuepicker mode="prepend" linked-field="css-selector">
 *   <select>
 * </typo3-formengine-valuepicker>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class ValuePicker extends HTMLElement {
    constructor() {
        super(...arguments);
        this.onChange = () => {
            this.setValue();
            this.valuePicker.selectedIndex = 0;
            this.valuePicker.blur();
        };
    }
    connectedCallback() {
        this.valuePicker = this.querySelector('select');
        if (this.valuePicker !== null) {
            this.valuePicker.addEventListener('change', this.onChange);
        }
    }
    disconnectedCallback() {
        if (this.valuePicker !== null) {
            this.valuePicker.removeEventListener('change', this.onChange);
            this.valuePicker = null;
        }
    }
    setValue() {
        var _a;
        const selectedValue = this.valuePicker.options[this.valuePicker.selectedIndex].value;
        const linkedField = document.querySelector(this.getAttribute('linked-field'));
        const mode = (_a = this.getAttribute('mode')) !== null && _a !== void 0 ? _a : InsertModes.replace;
        if (mode === InsertModes.append) {
            linkedField.value += selectedValue;
        }
        else if (mode === InsertModes.prepend) {
            linkedField.value = selectedValue + linkedField.value;
        }
        else {
            linkedField.value = selectedValue;
        }
        linkedField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
}
window.customElements.define('typo3-formengine-valuepicker', ValuePicker);

export { ValuePicker };
