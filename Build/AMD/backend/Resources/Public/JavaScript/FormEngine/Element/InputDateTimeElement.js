define(['require', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../FormEngine'], function (require, jquery, FormEngine) { 'use strict';

    function _interopNamespaceDefaultOnly(e) {
        return Object.freeze({__proto__: null, 'default': e});
    }

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
            jquery(() => {
                this.registerEventHandler();
                new Promise(function (resolve, reject) { require(['../../DateTimePicker'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(({ default: DateTimePicker }) => {
                    DateTimePicker.initialize('#' + elementId);
                });
            });
        }
        registerEventHandler() {
            jquery(document).on('formengine.dp.change', (event, $field) => {
                FormEngine.Validation.validate();
                FormEngine.Validation.markFieldAsChanged($field);
                jquery('.module-docheader-bar .btn').removeClass('disabled').prop('disabled', false);
            });
        }
    }

    return InputDateTimeElement;

});
