import $ from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';

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
    Selectors["toggleButton"] = ".t3js-form-field-slug-toggle";
    Selectors["recreateButton"] = ".t3js-form-field-slug-recreate";
    Selectors["inputField"] = ".t3js-form-field-slug-input";
    Selectors["readOnlyField"] = ".t3js-form-field-slug-readonly";
    Selectors["hiddenField"] = ".t3js-form-field-slug-hidden";
})(Selectors || (Selectors = {}));
var ProposalModes;
(function (ProposalModes) {
    ProposalModes["AUTO"] = "auto";
    ProposalModes["RECREATE"] = "recreate";
    ProposalModes["MANUAL"] = "manual";
})(ProposalModes || (ProposalModes = {}));
/**
 * Module: TYPO3/CMS/Backend/FormEngine/Element/SlugElement
 * Logic for a TCA type "slug"
 *
 * For new records, changes on the other fields of the record (typically the record title) are listened
 * on as well and the response is put in as "placeholder" into the input field.
 *
 * For new and existing records, the toggle switch will allow editors to modify the slug
 *  - for new records, we only need to see if that is already in use or not (uniqueInSite), if it is taken, show a message.
 *  - for existing records, we also check for conflicts, and check if we have subpages, or if we want to add a redirect (todo)
 */
class SlugElement {
    constructor(selector, options) {
        this.options = null;
        this.$fullElement = null;
        this.manuallyChanged = false;
        this.$readOnlyField = null;
        this.$inputField = null;
        this.$hiddenField = null;
        this.request = null;
        this.fieldsToListenOn = {};
        this.options = options;
        this.fieldsToListenOn = this.options.listenerFieldNames || {};
        $(() => {
            this.$fullElement = $(selector);
            this.$inputField = this.$fullElement.find(Selectors.inputField);
            this.$readOnlyField = this.$fullElement.find(Selectors.readOnlyField);
            this.$hiddenField = this.$fullElement.find(Selectors.hiddenField);
            this.registerEvents();
        });
    }
    registerEvents() {
        const fieldsToListenOnList = Object.keys(this.getAvailableFieldsForProposalGeneration()).map((k) => this.fieldsToListenOn[k]);
        // Listen on 'listenerFieldNames' for new pages. This is typically the 'title' field
        // of a page to create slugs from the title when title is set / changed.
        if (fieldsToListenOnList.length > 0) {
            if (this.options.command === 'new') {
                $(this.$fullElement).on('keyup', fieldsToListenOnList.join(','), () => {
                    if (!this.manuallyChanged) {
                        this.sendSlugProposal(ProposalModes.AUTO);
                    }
                });
            }
            // Clicking the recreate button makes new slug proposal created from 'title' field
            $(this.$fullElement).on('click', Selectors.recreateButton, (e) => {
                e.preventDefault();
                if (this.$readOnlyField.hasClass('hidden')) {
                    // Switch to readonly version - similar to 'new' page where field is
                    // written on the fly with title change
                    this.$readOnlyField.toggleClass('hidden', false);
                    this.$inputField.toggleClass('hidden', true);
                }
                this.sendSlugProposal(ProposalModes.RECREATE);
            });
        }
        else {
            $(this.$fullElement).find(Selectors.recreateButton).addClass('disabled').prop('disabled', true);
        }
        // Scenario for new pages: Usually, slug is created from the page title. However, if user toggles the
        // input field and feeds an own slug, and then changes title again, the slug should stay. manuallyChanged
        // is used to track this.
        $(this.$inputField).on('keyup', () => {
            this.manuallyChanged = true;
            this.sendSlugProposal(ProposalModes.MANUAL);
        });
        // Clicking the toggle button toggles the read only field and the input field.
        // Also set the value of either the read only or the input field to the hidden field
        // and update the value of the read only field after manual change of the input field.
        $(this.$fullElement).on('click', Selectors.toggleButton, (e) => {
            e.preventDefault();
            const showReadOnlyField = this.$readOnlyField.hasClass('hidden');
            this.$readOnlyField.toggleClass('hidden', !showReadOnlyField);
            this.$inputField.toggleClass('hidden', showReadOnlyField);
            if (!showReadOnlyField) {
                this.$hiddenField.val(this.$inputField.val());
                return;
            }
            if (this.$inputField.val() !== this.$readOnlyField.val()) {
                this.$readOnlyField.val(this.$inputField.val());
            }
            else {
                this.manuallyChanged = false;
                this.$fullElement.find('.t3js-form-proposal-accepted').addClass('hidden');
                this.$fullElement.find('.t3js-form-proposal-different').addClass('hidden');
            }
            this.$hiddenField.val(this.$readOnlyField.val());
        });
    }
    /**
     * @param {ProposalModes} mode
     */
    sendSlugProposal(mode) {
        const input = {};
        if (mode === ProposalModes.AUTO || mode === ProposalModes.RECREATE) {
            $.each(this.getAvailableFieldsForProposalGeneration(), (fieldName, field) => {
                input[fieldName] = $('[data-formengine-input-name="' + field + '"]').val();
            });
            if (this.options.includeUidInValues === true) {
                input.uid = this.options.recordId.toString();
            }
        }
        else {
            input.manual = this.$inputField.val();
        }
        if (this.request instanceof AjaxRequest) {
            this.request.abort();
        }
        this.request = (new AjaxRequest(TYPO3.settings.ajaxUrls.record_slug_suggest));
        this.request.post({
            values: input,
            mode: mode,
            tableName: this.options.tableName,
            pageId: this.options.pageId,
            parentPageId: this.options.parentPageId,
            recordId: this.options.recordId,
            language: this.options.language,
            fieldName: this.options.fieldName,
            command: this.options.command,
            signature: this.options.signature,
        }).then(async (response) => {
            const data = await response.resolve();
            const visualProposal = '/' + data.proposal.replace(/^\//, '');
            if (data.hasConflicts) {
                this.$fullElement.find('.t3js-form-proposal-accepted').addClass('hidden');
                this.$fullElement.find('.t3js-form-proposal-different').removeClass('hidden').find('span').text(visualProposal);
            }
            else {
                this.$fullElement.find('.t3js-form-proposal-accepted').removeClass('hidden').find('span').text(visualProposal);
                this.$fullElement.find('.t3js-form-proposal-different').addClass('hidden');
            }
            const isChanged = this.$hiddenField.val() !== data.proposal;
            if (isChanged) {
                this.$fullElement.find('input').trigger('change');
            }
            if (mode === ProposalModes.AUTO || mode === ProposalModes.RECREATE) {
                this.$readOnlyField.val(data.proposal);
                this.$hiddenField.val(data.proposal);
                this.$inputField.val(data.proposal);
            }
            else {
                this.$hiddenField.val(data.proposal);
            }
        }).finally(() => {
            this.request = null;
        });
    }
    /**
     * Gets a list of all available fields that can be used for slug generation
     *
     * @return { [key: string]: string }
     */
    getAvailableFieldsForProposalGeneration() {
        const availableFields = {};
        $.each(this.fieldsToListenOn, (fieldName, field) => {
            const $selector = $('[data-formengine-input-name="' + field + '"]');
            if ($selector.length > 0) {
                availableFields[fieldName] = field;
            }
        });
        return availableFields;
    }
}

export default SlugElement;
