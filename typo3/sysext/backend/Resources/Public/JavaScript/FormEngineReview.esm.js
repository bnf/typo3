import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import FormEngine from './FormEngine.esm.js';

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
 * Module: TYPO3/CMS/Backend/FormEngineReview
 * Enables interaction with record fields that need review
 * @exports TYPO3/CMS/Backend/FormEngineReview
 */
class FormEngineReview {
    /**
     * The constructor, set the class properties default values
     */
    constructor() {
        /**
         * Checks if fields have failed validation. In such case, the markup is rendered and the toggle button is unlocked.
         */
        this.checkForReviewableField = () => {
            const me = this;
            const $invalidFields = FormEngineReview.findInvalidField();
            const $toggleButton = jQuery('.' + this.toggleButtonClass);
            if ($invalidFields.length > 0) {
                const $list = jQuery('<div />', { class: 'list-group' });
                $invalidFields.each(function () {
                    const $field = jQuery(this);
                    const $input = $field.find('[data-formengine-validation-rules]');
                    let inputId = $input.attr('id');
                    if (typeof inputId === 'undefined') {
                        inputId = $input.parent().children('[id]').first().attr('id');
                    }
                    $list.append(jQuery('<a />', {
                        'class': 'list-group-item ' + me.fieldListItemClass,
                        'data-field-id': inputId,
                        'href': '#',
                    }).text($field.find(me.labelSelector).text()));
                });
                $toggleButton.removeClass('hidden');
                // bootstrap has no official API to update the content of a popover w/o destroying it
                const $popover = $toggleButton.data('bs.popover');
                if ($popover) {
                    $popover.options.content = $list.wrapAll('<div>').parent().html();
                    $popover.setContent();
                    $popover.$tip.addClass($popover.options.placement);
                }
            }
            else {
                $toggleButton.addClass('hidden').popover('hide');
            }
        };
        /**
         * Finds the field in the form and focuses it
         *
         * @param {Event} e
         */
        this.switchToField = (e) => {
            e.preventDefault();
            const $listItem = jQuery(e.currentTarget);
            const referenceFieldId = $listItem.data('fieldId');
            const $referenceField = jQuery('#' + referenceFieldId);
            // iterate possibly nested tab panels
            $referenceField.parents('[id][role="tabpanel"]').each(function () {
                jQuery('[aria-controls="' + jQuery(this).attr('id') + '"]').tab('show');
            });
            $referenceField.focus();
        };
        this.toggleButtonClass = 't3js-toggle-review-panel';
        this.fieldListItemClass = 't3js-field-item';
        this.labelSelector = '.t3js-formengine-label';
        this.initialize();
    }
    /**
     * Fetches all fields that have a failed validation
     *
     * @return {$}
     */
    static findInvalidField() {
        return jQuery(document).find('.tab-content .' + FormEngine.Validation.errorClass);
    }
    /**
     * Renders an invisible button to toggle the review panel into the least possible toolbar
     *
     * @param {Object} context
     */
    static attachButtonToModuleHeader(context) {
        const $leastButtonBar = jQuery('.t3js-module-docheader-bar-buttons').children().last().find('[role="toolbar"]');
        const $button = jQuery('<a />', {
            class: 'btn btn-danger btn-sm hidden ' + context.toggleButtonClass,
            href: '#',
            title: TYPO3.lang['buttons.reviewFailedValidationFields'],
        }).append(jQuery('<span />', { class: 'fa fa-fw fa-info' }));
        $button.popover({
            container: 'body',
            html: true,
            placement: 'bottom',
        });
        $leastButtonBar.prepend($button);
    }
    /**
     * Initialize the events
     */
    initialize() {
        const me = this;
        const $document = jQuery(document);
        jQuery(() => {
            FormEngineReview.attachButtonToModuleHeader(me);
        });
        $document.on('click', '.' + this.fieldListItemClass, this.switchToField);
        $document.on('t3-formengine-postfieldvalidation', this.checkForReviewableField);
    }
}
// create an instance and return it
var FormEngineReview$1 = new FormEngineReview();

export default FormEngineReview$1;
