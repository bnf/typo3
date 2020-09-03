import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';

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
        jQuery(() => {
            this.registerEventHandler(fieldName);
        });
    }
    /**
     * @param {string} fieldName
     */
    registerEventHandler(fieldName) {
        jQuery(document).on('change', '.t3js-l10n-state-container input[type="radio"][name="' + fieldName + '"]', (e) => {
            const $me = jQuery(e.currentTarget);
            const $input = $me.closest('.t3js-formengine-field-item').find('[data-formengine-input-name]');
            if ($input.length === 0) {
                return;
            }
            const lastState = $input.data('last-l10n-state') || false;
            const currentState = $me.val();
            if (lastState && currentState === lastState) {
                return;
            }
            if (currentState === States.CUSTOM) {
                if (lastState) {
                    $me.attr('data-original-language-value', $input.val());
                }
                $input.removeAttr('disabled');
            }
            else {
                if (lastState === States.CUSTOM) {
                    $me.closest('.t3js-l10n-state-container')
                        .find('.t3js-l10n-state-custom')
                        .attr('data-original-language-value', $input.val());
                }
                $input.attr('disabled', 'disabled');
            }
            $input.val($me.attr('data-original-language-value')).trigger('change');
            $input.data('last-l10n-state', $me.val());
        });
    }
}

export default LocalizationStateSelector;
