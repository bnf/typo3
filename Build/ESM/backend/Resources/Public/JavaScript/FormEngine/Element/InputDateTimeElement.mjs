import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import FormEngine from '../../FormEngine.mjs';

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
        jQuery(() => {
            this.registerEventHandler();
            import('../../DateTimePicker.mjs').then(({ default: DateTimePicker }) => {
                DateTimePicker.initialize('#' + elementId);
            });
        });
    }
    registerEventHandler() {
        jQuery(document).on('formengine.dp.change', (event, $field) => {
            FormEngine.Validation.validate();
            FormEngine.Validation.markFieldAsChanged($field);
            jQuery('.module-docheader-bar .btn').removeClass('disabled').prop('disabled', false);
        });
    }
}

export default InputDateTimeElement;
