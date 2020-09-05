define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery'], function (jquery) { 'use strict';

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
                const $editIcon = jquery(evt.currentTarget);
                const constantName = $editIcon.attr('rel');
                const $defaultDiv = jquery('#defaultTS-' + constantName);
                const $userDiv = jquery('#userTS-' + constantName);
                const $checkBox = jquery('#check-' + constantName);
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
                const $colorSelect = jquery(evt.currentTarget);
                let constantName = $colorSelect.attr('rel');
                let colorValue = $colorSelect.val();
                jquery('#input-' + constantName).val(colorValue);
                jquery('#colorbox-' + constantName).css({ background: colorValue });
            };
            /**
             * updates the color from an input field
             */
            this.updateColorFromInput = (evt) => {
                const $colorInput = jquery(evt.currentTarget);
                let constantName = $colorInput.attr('rel');
                let colorValue = $colorInput.val();
                jquery('#colorbox-' + constantName).css({ background: colorValue });
                jquery('#select-' + constantName).children().each((i, option) => {
                    option.selected = (option.value === colorValue);
                });
            };
            // no DOMready needed since only events for document are registered
            jquery(document)
                .on('click', Selectors.editIconSelector, this.changeProperty)
                .on('change', Selectors.colorSelectSelector, this.updateColorFromSelect)
                .on('blur', Selectors.colorInputSelector, this.updateColorFromInput);
        }
    }
    var ConstantEditor$1 = new ConstantEditor();

    return ConstantEditor$1;

});
