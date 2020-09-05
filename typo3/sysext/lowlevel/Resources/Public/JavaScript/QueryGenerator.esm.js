import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.esm.js';

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
 * Module: TYPO3/CMS/Lowlevel/QueryGenerator
 * This module handle the QueryGenerator forms.
 */
class QueryGenerator {
    constructor() {
        this.form = null;
        this.limitField = null;
        this.initialize();
    }
    /**
     * Initialize the QueryGenerator object
     */
    initialize() {
        this.form = $('form[name="queryform"]');
        this.limitField = $('#queryLimit');
        this.form.on('click', '.t3js-submit-click', (e) => {
            e.preventDefault();
            this.doSubmit();
        });
        this.form.on('change', '.t3js-submit-change', (e) => {
            e.preventDefault();
            this.doSubmit();
        });
        this.form.on('click', '.t3js-limit-submit input[type="button"]', (e) => {
            e.preventDefault();
            this.setLimit($(e.currentTarget).data('value'));
            this.doSubmit();
        });
        this.form.on('click', '.t3js-addfield', (e) => {
            e.preventDefault();
            const $field = $(e.currentTarget);
            this.addValueToField($field.data('field'), $field.val());
        });
        this.form.on('change', '[data-assign-store-control-title]', (evt) => {
            const $currentTarget = $(evt.currentTarget);
            const $titleField = this.form.find('[name="storeControl\[title\]"]');
            if ($currentTarget.val() !== '0') {
                $titleField.val($currentTarget.find('option:selected').text());
            }
            else {
                $titleField.val('');
            }
        });
        document.querySelectorAll('form[name="queryform"] .t3js-clearable').forEach((clearableField) => clearableField.clearable({
            onClear: () => {
                this.doSubmit();
            },
        }));
    }
    /**
     * Submit the form
     */
    doSubmit() {
        this.form.trigger('submit');
    }
    /**
     * Set query limit
     *
     * @param {String} value
     */
    setLimit(value) {
        this.limitField.val(value);
    }
    /**
     * Add value to text field
     *
     * @param {String} field the name of the field
     * @param {String} value the value to add
     */
    addValueToField(field, value) {
        const $target = this.form.find('[name="' + field + '"]');
        const currentValue = $target.val();
        $target.val(currentValue + ',' + value);
    }
}
var QueryGenerator$1 = new QueryGenerator();

export default QueryGenerator$1;
