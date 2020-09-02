import $ from 'jquery';
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';

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
 * Module: TYPO3/CMS/Backend/ColorPicker
 * contains all logic for the color picker used in FormEngine
 * @exports TYPO3/CMS/Backend/ColorPicker
 */
class ColorPicker {
    /**
     * The constructor, set the class properties default values
     */
    constructor() {
        this.selector = '.t3js-color-picker';
    }
    /**
     * Initialize the color picker for the given selector
     */
    initialize() {
        $(this.selector).minicolors({
            format: 'hex',
            position: 'bottom left',
            theme: 'bootstrap',
        });
        $(document).on('change', '.t3js-colorpicker-value-trigger', (event) => {
            const $element = $(event.target);
            if ($element.val() !== '') {
                $element.closest('.t3js-formengine-field-item')
                    .find('.t3js-color-picker')
                    .val($element.val())
                    .trigger('paste');
                $element.val('');
            }
        });
        // On blur, use the formatted value from minicolors
        $(document).on('blur', '.t3js-color-picker', (event) => {
            const $element = $(event.target);
            $element.closest('.t3js-formengine-field-item')
                .find('input[type="hidden"]')
                .val($element.val());
            if ($element.val() === '') {
                $element.trigger('paste');
            }
        });
    }
}
// create an instance and return it
var ColorPicker$1 = new ColorPicker();

export default ColorPicker$1;
