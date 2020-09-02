define(['require', 'jquery', 'TYPO3/CMS/Backend/FormEngine'], function (require, $, FormEngine) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespaceDefaultOnly(e) {
        return Object.freeze({__proto__: null, 'default': e});
    }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
    var FormEngine__default = /*#__PURE__*/_interopDefaultLegacy(FormEngine);

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
    class InputDateTimeElement {
        constructor(elementId) {
            $__default['default'](() => {
                this.registerEventHandler();
                new Promise(function (resolve, reject) { require(['../../DateTimePicker'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(({ default: DateTimePicker }) => {
                    DateTimePicker.initialize('#' + elementId);
                });
            });
        }
        registerEventHandler() {
            $__default['default'](document).on('formengine.dp.change', (event, $field) => {
                FormEngine__default['default'].Validation.validate();
                FormEngine__default['default'].Validation.markFieldAsChanged($field);
                $__default['default']('.module-docheader-bar .btn').removeClass('disabled').prop('disabled', false);
            });
        }
    }

    return InputDateTimeElement;

});
