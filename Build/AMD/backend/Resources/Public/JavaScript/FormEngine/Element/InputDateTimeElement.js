define(['require', '../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../../../core/Resources/Public/JavaScript/DocumentService', '../../FormEngine'], function (require, RegularEvent, DocumentService, FormEngine) { 'use strict';

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
            this.element = null;
            DocumentService.ready().then(() => {
                this.element = document.getElementById(elementId);
                this.registerEventHandler(this.element);
                new Promise(function (resolve, reject) { require(['../../DateTimePicker'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(({ default: DateTimePicker }) => {
                    DateTimePicker.initialize(this.element);
                });
            });
        }
        registerEventHandler(element) {
            new RegularEvent('formengine.dp.change', (e) => {
                FormEngine.Validation.validate();
                FormEngine.Validation.markFieldAsChanged(e.target);
                document.querySelectorAll('.module-docheader-bar .btn').forEach((btn) => {
                    btn.classList.remove('disabled');
                    btn.disabled = false;
                });
            }).bindTo(element);
        }
    }

    return InputDateTimeElement;

});
