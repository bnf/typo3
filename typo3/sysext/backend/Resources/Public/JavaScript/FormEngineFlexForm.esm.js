import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from './Modal.esm.js';
import Sortable from '../../../../core/Resources/Public/JavaScript/Contrib/Sortable.esm.js';
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
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @constructor
 * @exports TYPO3/CMS/Backend/FormEngineFlexForm
 */
class FlexFormElement {
    constructor(el, options) {
        this.el = el;
        const that = this;
        // store DOM element and jQuery object for later use
        this.el = el;
        this.$el = $(el);
        // remove any existing backups
        const old_this = this.$el.data('TYPO3.FormEngine.FlexFormElement');
        if (typeof old_this !== 'undefined') {
            this.$el.removeData('TYPO3.FormEngine.FlexFormElement');
        }
        // add a reverse reference to the DOM element
        this.$el.data('TYPO3.FormEngine.FlexFormElement', this);
        if (!options) {
            options = FlexFormElement.defaults;
        }
        // set some values from existing properties
        options.allowRestructure = this.$el.data('t3-flex-allow-restructure');
        options.flexformId = this.$el.attr('id');
        // store options and merge with default options
        this.opts = $.extend({}, FlexFormElement.defaults, options);
        // initialize events
        this.initializeEvents();
        // generate the preview text if a section is hidden on load
        this.$el.find(this.opts.sectionSelector).each(function () {
            that.generateSectionPreview($(this));
        });
        return this;
    }
    /**
     * init all events related to the flexform. As this method is called multiple times,
     * some handlers need to be off'ed first to prevent event stacking.
     */
    initializeEvents() {
        // Toggling all sections on/off by clicking all toggle buttons of each section
        this.$el.prev(this.opts.flexFormToggleAllSectionsSelector).off('click').on('click', () => {
            this.$el.find(this.opts.sectionToggleButtonSelector).trigger('click');
        });
        if (this.opts.allowRestructure) {
            // create a sortable when dragging on the header of a section
            this.createSortable();
            // allow delete of a single section
            this.$el.off('click').on('click', this.opts.deleteIconSelector, (evt) => {
                evt.preventDefault();
                const confirmTitle = TYPO3.lang['flexform.section.delete.title'] || 'Are you sure?';
                const confirmMessage = TYPO3.lang['flexform.section.delete.message'] || 'Are you sure you want to delete this section?';
                const $confirm = Modal.confirm(confirmTitle, confirmMessage);
                $confirm.on('confirm.button.cancel', () => {
                    Modal.currentModal.trigger('modal-dismiss');
                });
                $confirm.on('confirm.button.ok', () => {
                    const $section = $(evt.target).closest(this.opts.sectionSelector);
                    $section.find(this.opts.sectionActionInputFieldSelector).detach().appendTo($section.parent()).val('DELETE');
                    $section.addClass('t3-flex-section--deleted');
                    $section.on('transitionend', () => {
                        $section.remove();
                    });
                    FormEngine.Validation.validate();
                    Modal.currentModal.trigger('modal-dismiss');
                });
            });
            // allow the toggle open/close of the main selection
            this.$el.on('click', this.opts.sectionToggleButtonSelector, (evt) => {
                evt.preventDefault();
                const $sectionEl = $(evt.currentTarget).closest(this.opts.sectionSelector);
                this.toggleSection($sectionEl);
            }).on('click', this.opts.sectionToggleButtonSelector + ' .form-irre-header-control', function (evt) {
                evt.stopPropagation();
            });
        }
        return this;
    }
    /**
     * Allow flexform sections to be sorted
     */
    createSortable() {
        new Sortable(this.el, {
            group: this.el.id,
            handle: '.t3js-sortable-handle',
            onSort: () => {
                this.setActionStatus();
                $(document).trigger('flexform:sorting-changed');
            },
        });
    }
    // Updates the "action"-status for a section. This is used to move and delete elements.
    setActionStatus() {
        // Traverse and find how many sections are open or closed, and save the value accordingly
        this.$el.find(this.opts.sectionSelector + ' ' + this.opts.sectionActionInputFieldSelector).each(function (index) {
            this.value = String(index);
        });
    }
    // Toggling flexform elements on/off
    // hides the flexform section and shows a preview text
    // or shows the form parts
    toggleSection($sectionEl) {
        const $contentEl = $sectionEl.find(this.opts.sectionContentSelector);
        // display/hide the content of this flexform section
        $contentEl.toggle();
        if ($contentEl.is(':visible')) {
            // show the open icon, and set the hidden field for toggling to "hidden"
            $sectionEl.find(this.opts.sectionToggleIconOpenSelector).show();
            $sectionEl.find(this.opts.sectionToggleIconCloseSelector).hide();
            $sectionEl.find(this.opts.sectionToggleInputFieldSelector).val(0);
        }
        else {
            // show the close icon, and set the hidden field for toggling to "1"
            $sectionEl.find(this.opts.sectionToggleIconOpenSelector).hide();
            $sectionEl.find(this.opts.sectionToggleIconCloseSelector).show();
            $sectionEl.find(this.opts.sectionToggleInputFieldSelector).val(1);
        }
        // see if the preview content needs to be generated
        this.generateSectionPreview($sectionEl);
    }
    // function to generate the section preview in the header
    // if the section content is hidden
    // called on load and when toggling an icon
    generateSectionPreview($sectionEl) {
        const $contentEl = $sectionEl.find(this.opts.sectionContentSelector);
        let previewContent = '';
        if (!$contentEl.is(':visible')) {
            $contentEl.find('input[type=text], textarea').each(function () {
                let content = $($.parseHTML($(this).val())).text();
                if (content.length > 50) {
                    content = content.substring(0, 50) + '...';
                }
                previewContent += (previewContent ? ' / ' : '') + content;
            });
        }
        // create a preview container span element
        if ($sectionEl.find(this.opts.sectionHeaderPreviewSelector).length === 0) {
            $sectionEl.find(this.opts.sectionHeaderSelector).find('.t3js-record-title').parent()
                .append('<span class="' + this.opts.sectionHeaderPreviewSelector.replace(/\./, '') + '"></span>');
        }
        $sectionEl.find(this.opts.sectionHeaderPreviewSelector).text(previewContent);
    }
}
// setting some default values
FlexFormElement.defaults = {
    deleteIconSelector: '.t3js-delete',
    sectionSelector: '.t3js-flex-section',
    sectionContentSelector: '.t3js-flex-section-content',
    sectionHeaderSelector: '.t3js-flex-section-header',
    sectionHeaderPreviewSelector: '.t3js-flex-section-header-preview',
    sectionActionInputFieldSelector: '.t3js-flex-control-action',
    sectionToggleInputFieldSelector: '.t3js-flex-control-toggle',
    sectionToggleIconOpenSelector: '.t3js-flex-control-toggle-icon-open',
    sectionToggleIconCloseSelector: '.t3js-flex-control-toggle-icon-close',
    sectionToggleButtonSelector: '[data-toggle="formengine-flex"]',
    flexFormToggleAllSectionsSelector: '.t3js-form-field-toggle-flexsection',
    sectionDeletedClass: 't3js-flex-section-deleted',
    allowRestructure: false,
    flexformId: false,
};
// register the flex functions as jQuery Plugin
$.fn.t3FormEngineFlexFormElement = function (options) {
    // apply all util functions to ourself (for use in templates, etc.)
    return this.each(function () {
        new FlexFormElement(this, options);
    });
};
// Initialization Code
$(function () {
    // run the flexform functions on all containers (which contains one or more sections)
    $('.t3-flex-container').t3FormEngineFlexFormElement();
    // Add handler to fetch container data on click on "add container" buttons
    $(document).on('click', '.t3js-flex-container-add', function (e) {
        const me = $(this);
        e.preventDefault();
        (new AjaxRequest(TYPO3.settings.ajaxUrls.record_flex_container_add)).post({
            vanillaUid: me.data('vanillauid'),
            databaseRowUid: me.data('databaserowuid'),
            command: me.data('command'),
            tableName: me.data('tablename'),
            fieldName: me.data('fieldname'),
            recordTypeValue: me.data('recordtypevalue'),
            dataStructureIdentifier: me.data('datastructureidentifier'),
            flexFormSheetName: me.data('flexformsheetname'),
            flexFormFieldName: me.data('flexformfieldname'),
            flexFormContainerName: me.data('flexformcontainername'),
        }).then(async (response) => {
            const data = await response.resolve();
            me.closest('.t3-form-field-container').find('.t3-flex-container').append(data.html);
            $('.t3-flex-container').t3FormEngineFlexFormElement();
            if (data.scriptCall && data.scriptCall.length > 0) {
                $.each(data.scriptCall, function (index, value) {
                    // eslint-disable-next-line no-eval
                    eval(value);
                });
            }
            if (data.stylesheetFiles && data.stylesheetFiles.length > 0) {
                $.each(data.stylesheetFiles, function (index, stylesheetFile) {
                    let element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.type = 'text/css';
                    element.href = stylesheetFile;
                    document.head.appendChild(element);
                });
            }
            FormEngine.reinitialize();
            FormEngine.Validation.initializeInputFields();
            FormEngine.Validation.validate();
        });
    });
});
