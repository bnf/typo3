define(['jquery'], function ($) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
                let $selectElement = $__default['default'](selector);
                let $groupIconContainer = $selectElement.prev('.input-group-icon');
                options = options || {};
                $selectElement.on('change', (e) => {
                    let $me = $__default['default'](e.target);
                    // Update prepended select icon
                    $groupIconContainer.html($selectElement.find(':selected').data('icon'));
                    let $selectIcons = $me.closest('.t3js-formengine-field-item').find('.t3js-forms-select-single-icons');
                    $selectIcons.find('.item.active').removeClass('active');
                    $selectIcons.find('[data-select-index="' + $me.prop('selectedIndex') + '"]').closest('.item').addClass('active');
                });
                // Append optionally passed additional "change" event callback
                if (typeof options.onChange === 'function') {
                    $selectElement.on('change', options.onChange);
                }
                // Append optionally passed additional "focus" event callback
                if (typeof options.onFocus === 'function') {
                    $selectElement.on('focus', options.onFocus);
                }
                $selectElement.closest('.form-control-wrap').find('.t3js-forms-select-single-icons a').on('click', (e) => {
                    let $me = $__default['default'](e.target);
                    let $selectIcon = $me.closest('[data-select-index]');
                    $me.closest('.t3js-forms-select-single-icons').find('.item.active').removeClass('active');
                    $selectElement
                        .prop('selectedIndex', $selectIcon.data('selectIndex'))
                        .trigger('change');
                    $selectIcon.closest('.item').addClass('active');
                    return false;
                });
            };
        }
    }
    var SelectSingleElement$1 = new SelectSingleElement();

    return SelectSingleElement$1;

});
