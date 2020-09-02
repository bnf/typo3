import ThrottleEvent from '../../../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.mjs';

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
class ValueSlider {
    constructor(controlElementId) {
        this.controlElement = null;
        this.handleRangeChange = (e) => {
            const target = e.target;
            ValueSlider.updateValue(target);
            ValueSlider.updateTooltipValue(target);
        };
        this.controlElement = document.getElementById(controlElementId);
        new ThrottleEvent('input', this.handleRangeChange, 25).bindTo(this.controlElement);
    }
    /**
     * Update value of slider element
     *
     * @param {HTMLInputElement} element
     */
    static updateValue(element) {
        const foreignField = document.querySelector(`[data-formengine-input-name="${element.dataset.sliderItemName}"]`);
        const sliderCallbackParams = JSON.parse(element.dataset.sliderCallbackParams);
        foreignField.value = element.value;
        TBE_EDITOR.fieldChanged.apply(TBE_EDITOR, sliderCallbackParams);
    }
    /**
     * @param {HTMLInputElement} element
     */
    static updateTooltipValue(element) {
        let renderedValue;
        const value = element.value;
        switch (element.dataset.sliderValueType) {
            case 'double':
                renderedValue = parseFloat(value).toFixed(2);
                break;
            case 'int':
            default:
                renderedValue = parseInt(value, 10);
        }
        element.title = renderedValue.toString();
    }
}

export default ValueSlider;
