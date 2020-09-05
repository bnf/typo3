import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';

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
    Selectors["editIconSelector"] = ".t3js-toggle";
    Selectors["colorSelectSelector"] = ".t3js-color-select";
    Selectors["colorInputSelector"] = ".t3js-color-input";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Tstemplate/ConstantEditor
 * Various functions related to the Constant Editor
 * e.g. updating the field and working with colors
 */
class ConstantEditor {
    constructor() {
        /**
         * initially register event listeners
         */
        this.changeProperty = (evt) => {
            const $editIcon = $(evt.currentTarget);
            const constantName = $editIcon.attr('rel');
            const $defaultDiv = $('#defaultTS-' + constantName);
            const $userDiv = $('#userTS-' + constantName);
            const $checkBox = $('#check-' + constantName);
            const toggleState = $editIcon.data('toggle');
            if (toggleState === 'edit') {
                $defaultDiv.hide();
                $userDiv.show();
                $userDiv.find('input').css({ background: '#fdf8bd' });
                $checkBox.prop('disabled', false).prop('checked', true);
            }
            else if (toggleState === 'undo') {
                $userDiv.hide();
                $defaultDiv.show();
                $checkBox.val('').prop('disabled', true);
            }
        };
        /**
         * updates the color from a dropdown
         */
        this.updateColorFromSelect = (evt) => {
            const $colorSelect = $(evt.currentTarget);
            let constantName = $colorSelect.attr('rel');
            let colorValue = $colorSelect.val();
            $('#input-' + constantName).val(colorValue);
            $('#colorbox-' + constantName).css({ background: colorValue });
        };
        /**
         * updates the color from an input field
         */
        this.updateColorFromInput = (evt) => {
            const $colorInput = $(evt.currentTarget);
            let constantName = $colorInput.attr('rel');
            let colorValue = $colorInput.val();
            $('#colorbox-' + constantName).css({ background: colorValue });
            $('#select-' + constantName).children().each((i, option) => {
                option.selected = (option.value === colorValue);
            });
        };
        // no DOMready needed since only events for document are registered
        $(document)
            .on('click', Selectors.editIconSelector, this.changeProperty)
            .on('change', Selectors.colorSelectSelector, this.updateColorFromSelect)
            .on('blur', Selectors.colorInputSelector, this.updateColorFromInput);
    }
}
var ConstantEditor$1 = new ConstantEditor();

export default ConstantEditor$1;
