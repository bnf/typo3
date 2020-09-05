import $ from '../../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';

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
    Selectors["fieldContainerSelector"] = ".t3js-formengine-field-group";
    Selectors["filterTextFieldSelector"] = ".t3js-formengine-multiselect-filter-textfield";
    Selectors["filterSelectFieldSelector"] = ".t3js-formengine-multiselect-filter-dropdown";
})(Selectors || (Selectors = {}));
/**
 * Select field filter functions, see TCA option "multiSelectFilterItems"
 */
class SelectBoxFilter {
    constructor(selectElement) {
        this.selectElement = null;
        this.filterText = '';
        this.$availableOptions = null;
        this.selectElement = selectElement;
        this.initializeEvents();
    }
    initializeEvents() {
        const wizardsElement = this.selectElement.closest('.form-wizards-element');
        if (wizardsElement === null) {
            return;
        }
        wizardsElement.addEventListener('keyup', (e) => {
            if (e.target.matches(Selectors.filterTextFieldSelector)) {
                this.filter(e.target.value);
            }
        });
        wizardsElement.addEventListener('change', (e) => {
            if (e.target.matches(Selectors.filterSelectFieldSelector)) {
                this.filter(e.target.value);
            }
        });
    }
    /**
     * Filter the actual items
     *
     * @param {string} filterText
     */
    filter(filterText) {
        this.filterText = filterText;
        if (!this.$availableOptions) {
            this.$availableOptions = $(this.selectElement).find('option').clone();
        }
        this.selectElement.innerHTML = '';
        const matchFilter = new RegExp(filterText, 'i');
        this.$availableOptions.each((i, el) => {
            if (filterText.length === 0 || el.textContent.match(matchFilter)) {
                this.selectElement.appendChild(el);
            }
        });
    }
}

export default SelectBoxFilter;
