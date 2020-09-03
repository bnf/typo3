import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import '../../../../core/Resources/Public/JavaScript/Contrib/jquery.minicolors.mjs';

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
        jQuery(this.selector).minicolors({
            format: 'hex',
            position: 'bottom left',
            theme: 'bootstrap',
        });
        jQuery(document).on('change', '.t3js-colorpicker-value-trigger', (event) => {
            const $element = jQuery(event.target);
            if ($element.val() !== '') {
                $element.closest('.t3js-formengine-field-item')
                    .find('.t3js-color-picker')
                    .val($element.val())
                    .trigger('paste');
                $element.val('');
            }
        });
        // On blur, use the formatted value from minicolors
        jQuery(document).on('blur', '.t3js-color-picker', (event) => {
            const $element = jQuery(event.target);
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
