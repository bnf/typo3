define(['../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../../../core/Resources/Public/JavaScript/DocumentService'], function (RegularEvent, DocumentService) { 'use strict';

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
    var States;
    (function (States) {
        States["CUSTOM"] = "custom";
    })(States || (States = {}));
    class LocalizationStateSelector {
        constructor(fieldName) {
            DocumentService.ready().then(() => {
                this.registerEventHandler(fieldName);
            });
        }
        /**
         * @param {string} fieldName
         */
        registerEventHandler(fieldName) {
            new RegularEvent('change', (e) => {
                var _a;
                const target = e.target;
                const input = (_a = target.closest('.t3js-formengine-field-item')) === null || _a === void 0 ? void 0 : _a.querySelector('[data-formengine-input-name]');
                if (!input) {
                    return;
                }
                const lastState = input.dataset.lastL10nState || false;
                const currentState = target.value;
                if (lastState && currentState === lastState) {
                    return;
                }
                if (currentState === States.CUSTOM) {
                    if (lastState) {
                        target.dataset.originalLanguageValue = input.value;
                    }
                    input.disabled = false;
                }
                else {
                    if (lastState === States.CUSTOM) {
                        target.closest('.t3js-l10n-state-container')
                            .querySelector('.t3js-l10n-state-custom')
                            .dataset.originalLanguageValue = input.value;
                    }
                    input.disabled = true;
                }
                input.value = target.dataset.originalLanguageValue;
                input.dispatchEvent(new Event('change'));
                input.dataset.lastL10nState = target.value;
            }).delegateTo(document, '.t3js-l10n-state-container input[type="radio"][name="' + fieldName + '"]');
        }
    }

    return LocalizationStateSelector;

});
