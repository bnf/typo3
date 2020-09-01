define(['../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent'], function (RegularEvent) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/FormEngine/Element/SelectSingleElement
     * Logic for SelectSingleElement
     */
    class SelectSingleElement {
        constructor() {
            this.initialize = (selector, options) => {
                let selectElement = document.querySelector(selector);
                options = options || {};
                new RegularEvent('change', (e) => {
                    const target = e.target;
                    const groupIconContainer = target.parentElement.querySelector('.input-group-icon');
                    // Update prepended select icon
                    if (groupIconContainer !== null) {
                        groupIconContainer.innerHTML = (target.options[target.selectedIndex].dataset.icon);
                    }
                    const selectIcons = target.closest('.t3js-formengine-field-item').querySelector('.t3js-forms-select-single-icons');
                    if (selectIcons !== null) {
                        const activeItem = selectIcons.querySelector('.item.active');
                        if (activeItem !== null) {
                            activeItem.classList.remove('active');
                        }
                        const selectionIcon = selectIcons.querySelector('[data-select-index="' + target.selectedIndex + '"]');
                        if (selectionIcon !== null) {
                            selectionIcon.closest('.item').classList.add('active');
                        }
                    }
                }).bindTo(selectElement);
                // Append optionally passed additional "change" event callback
                if (typeof options.onChange === 'function') {
                    new RegularEvent('change', options.onChange).bindTo(selectElement);
                }
                // Append optionally passed additional "focus" event callback
                if (typeof options.onFocus === 'function') {
                    new RegularEvent('focus', options.onFocus).bindTo(selectElement);
                }
                new RegularEvent('click', (e, target) => {
                    const currentActive = target.closest('.t3js-forms-select-single-icons').querySelector('.item.active');
                    if (currentActive !== null) {
                        currentActive.classList.remove('active');
                    }
                    selectElement.selectedIndex = parseInt(target.dataset.selectIndex, 10);
                    selectElement.dispatchEvent(new Event('change'));
                    target.closest('.item').classList.add('active');
                }).delegateTo(selectElement.closest('.form-control-wrap'), '.t3js-forms-select-single-icons .item:not(.active) a');
            };
        }
    }
    var SelectSingleElement$1 = new SelectSingleElement();

    return SelectSingleElement$1;

});
