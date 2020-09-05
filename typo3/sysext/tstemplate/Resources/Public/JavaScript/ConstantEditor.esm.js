import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';

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
    Selectors["formFieldsSelector"] = ".tstemplate-constanteditor [data-form-update-fragment]";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Tstemplate/ConstantEditor
 * Various functions related to the Constant Editor
 * e.g. updating the field and working with colors
 */
class ConstantEditor {
    constructor() {
        /**
         * Sets the # suffix for the form action to jump directly to the last updated Constant Editor field on submit.
         * Removes any existing "#" suffixes in case multiple fields were updated
         */
        this.updateFormFragment = (evt) => {
            const $formField = jQuery(evt.currentTarget);
            const fragment = $formField.attr('data-form-update-fragment');
            let formTargetAction = document.forms[0].action;
            // Strip away any existing fragments
            if (formTargetAction.indexOf('#') !== -1) {
                formTargetAction = formTargetAction.substring(0, formTargetAction.indexOf('#'));
            }
            document.forms[0].action = formTargetAction + '#' + fragment;
        };
        /**
         * initially register event listeners
         */
        this.changeProperty = (evt) => {
            const $editIcon = jQuery(evt.currentTarget);
            const constantName = $editIcon.attr('rel');
            const $defaultDiv = jQuery('#defaultTS-' + constantName);
            const $userDiv = jQuery('#userTS-' + constantName);
            const $checkBox = jQuery('#check-' + constantName);
            const toggleState = $editIcon.data('bsToggle');
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
            const $colorSelect = jQuery(evt.currentTarget);
            let constantName = $colorSelect.attr('rel');
            let colorValue = $colorSelect.val();
            jQuery('#input-' + constantName).val(colorValue);
            jQuery('#colorbox-' + constantName).css({ background: colorValue });
        };
        /**
         * updates the color from an input field
         */
        this.updateColorFromInput = (evt) => {
            const $colorInput = jQuery(evt.currentTarget);
            let constantName = $colorInput.attr('rel');
            let colorValue = $colorInput.val();
            jQuery('#colorbox-' + constantName).css({ background: colorValue });
            jQuery('#select-' + constantName).children().each((i, option) => {
                option.selected = (option.value === colorValue);
            });
        };
        // no DOMready needed since only events for document are registered
        jQuery(document)
            .on('click', Selectors.editIconSelector, this.changeProperty)
            .on('change', Selectors.colorSelectSelector, this.updateColorFromSelect)
            .on('blur', Selectors.colorInputSelector, this.updateColorFromInput)
            .on('change', Selectors.formFieldsSelector, this.updateFormFragment);
    }
}
var ConstantEditor$1 = new ConstantEditor();

export default ConstantEditor$1;
