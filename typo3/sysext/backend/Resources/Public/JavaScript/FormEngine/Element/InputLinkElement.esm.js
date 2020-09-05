import $ from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = ".t3js-form-field-inputlink-explanation-toggle";
    Selectors["inputFieldSelector"] = ".t3js-form-field-inputlink-input";
    Selectors["explanationSelector"] = ".t3js-form-field-inputlink-explanation";
    Selectors["iconSelector"] = ".t3js-form-field-inputlink-icon";
})(Selectors || (Selectors = {}));
class InputLinkElement {
    constructor(elementId) {
        this.element = null;
        this.container = null;
        this.toggleSelector = null;
        this.explanationField = null;
        this.icon = null;
        $(() => {
            this.element = document.getElementById(elementId);
            this.container = this.element.closest('.t3js-form-field-inputlink');
            this.toggleSelector = this.container.querySelector(Selectors.toggleSelector);
            this.explanationField = this.container.querySelector(Selectors.explanationSelector);
            this.icon = this.container.querySelector(Selectors.iconSelector);
            this.toggleVisibility(this.explanationField.value === '');
            this.registerEventHandler();
        });
    }
    /**
     * @param {boolean} explanationShown
     */
    toggleVisibility(explanationShown) {
        this.explanationField.classList.toggle('hidden', explanationShown);
        this.element.classList.toggle('hidden', !explanationShown);
        const clearable = this.container.querySelector('.form-control-clearable button.close');
        if (clearable !== null) {
            clearable.classList.toggle('hidden', !explanationShown);
        }
    }
    registerEventHandler() {
        this.toggleSelector.addEventListener('click', (e) => {
            e.preventDefault();
            const explanationShown = !this.explanationField.classList.contains('hidden');
            this.toggleVisibility(explanationShown);
        });
        this.container.querySelector(Selectors.inputFieldSelector).addEventListener('change', () => {
            const explanationShown = !this.explanationField.classList.contains('hidden');
            if (explanationShown) {
                this.toggleVisibility(explanationShown);
            }
            this.disableToggle();
            this.clearIcon();
        });
    }
    disableToggle() {
        this.toggleSelector.classList.add('disabled');
        this.toggleSelector.setAttribute('disabled', 'disabled');
    }
    clearIcon() {
        this.icon.innerHTML = '';
    }
}

export default InputLinkElement;
