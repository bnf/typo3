import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Persistent from './Storage/Persistent.esm.js';
import { KeyTypesEnum } from './Enum/KeyTypes.esm.js';
import NewContentElement from './Wizard/NewContentElement.esm.js';

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
var IdentifierEnum;
(function (IdentifierEnum) {
    IdentifierEnum["pageTitle"] = ".t3js-title-inlineedit";
    IdentifierEnum["hiddenElements"] = ".t3js-hidden-record";
    IdentifierEnum["newButton"] = ".t3js-toggle-new-content-element-wizard";
})(IdentifierEnum || (IdentifierEnum = {}));
/**
 * Module: TYPO3/CMS/Backend/PageActions
 * JavaScript implementations for page actions
 */
class PageActions {
    constructor() {
        this.pageId = 0;
        this.pageOverlayId = 0;
        this.$pageTitle = null;
        this.$showHiddenElementsCheckbox = null;
        jQuery(() => {
            this.initializeElements();
            this.initializeEvents();
            this.initializeNewContentElementWizard();
            this.initializePageTitleRenaming();
        });
    }
    /**
     * Set the page id (used in the RequireJS callback)
     *
     * @param {number} pageId
     */
    setPageId(pageId) {
        this.pageId = pageId;
    }
    /**
     * Set the overlay id
     *
     * @param {number} overlayId
     */
    setLanguageOverlayId(overlayId) {
        this.pageOverlayId = overlayId;
    }
    /**
     * Initialize page title renaming
     */
    initializePageTitleRenaming() {
        if (!jQuery.isReady) {
            jQuery(() => {
                this.initializePageTitleRenaming();
            });
            return;
        }
        if (this.pageId <= 0) {
            return;
        }
        const $editActionLink = jQuery('<a class="hidden" href="#" data-action="edit"><span class="t3-icon fa fa-pencil"></span></a>');
        $editActionLink.on('click', (e) => {
            e.preventDefault();
            this.editPageTitle();
        });
        this.$pageTitle
            .on('dblclick', () => {
            this.editPageTitle();
        })
            .on('mouseover', () => {
            $editActionLink.removeClass('hidden');
        })
            .on('mouseout', () => {
            $editActionLink.addClass('hidden');
        })
            .append($editActionLink);
    }
    /**
     * Initialize elements
     */
    initializeElements() {
        this.$pageTitle = jQuery(IdentifierEnum.pageTitle + ':first');
        this.$showHiddenElementsCheckbox = jQuery('#checkTt_content_showHidden');
    }
    /**
     * Initialize events
     */
    initializeEvents() {
        this.$showHiddenElementsCheckbox.on('change', this.toggleContentElementVisibility);
    }
    /**
     * Toggles the "Show hidden content elements" checkbox
     */
    toggleContentElementVisibility(e) {
        const $me = jQuery(e.currentTarget);
        const $hiddenElements = jQuery(IdentifierEnum.hiddenElements);
        // show a spinner to show activity
        const $spinner = jQuery('<span />', { class: 'checkbox-spinner fa fa-circle-o-notch fa-spin' });
        $me.hide().after($spinner);
        if ($me.prop('checked')) {
            $hiddenElements.slideDown();
        }
        else {
            $hiddenElements.slideUp();
        }
        Persistent.set('moduleData.web_layout.tt_content_showHidden', $me.prop('checked') ? '1' : '0').done(() => {
            $spinner.remove();
            $me.show();
        });
    }
    /**
     * Changes the h1 to an edit form
     */
    editPageTitle() {
        const $inputFieldWrap = jQuery('<form>' +
            '<div class="form-group">' +
            '<div class="input-group input-group-lg">' +
            '<input class="form-control t3js-title-edit-input">' +
            '<span class="input-group-btn">' +
            '<button class="btn btn-default" type="button" data-action="submit"><span class="t3-icon fa fa-floppy-o"></span></button> ' +
            '</span>' +
            '<span class="input-group-btn">' +
            '<button class="btn btn-default" type="button" data-action="cancel"><span class="t3-icon fa fa-times"></span></button> ' +
            '</span>' +
            '</div>' +
            '</div>' +
            '</form>'), $inputField = $inputFieldWrap.find('input');
        $inputFieldWrap.find('[data-action="cancel"]').on('click', () => {
            $inputFieldWrap.replaceWith(this.$pageTitle);
            this.initializePageTitleRenaming();
        });
        $inputFieldWrap.find('[data-action="submit"]').on('click', () => {
            const newPageTitle = $inputField.val().trim();
            if (newPageTitle !== '' && this.$pageTitle.text() !== newPageTitle) {
                this.saveChanges($inputField);
            }
            else {
                $inputFieldWrap.find('[data-action="cancel"]').trigger('click');
            }
        });
        // the form stuff is a wacky workaround to prevent the submission of the docheader form
        $inputField.parents('form').on('submit', (e) => {
            e.preventDefault();
            return false;
        });
        const $h1 = this.$pageTitle;
        $h1.children().last().remove();
        $h1.replaceWith($inputFieldWrap);
        $inputField.val($h1.text()).focus();
        $inputField.on('keyup', (e) => {
            switch (e.which) {
                case KeyTypesEnum.ENTER:
                    $inputFieldWrap.find('[data-action="submit"]').trigger('click');
                    break;
                case KeyTypesEnum.ESCAPE:
                    $inputFieldWrap.find('[data-action="cancel"]').trigger('click');
                    break;
                default:
            }
        });
    }
    /**
     * Save the changes and reload the page tree
     *
     * @param {JQuery} $field
     */
    saveChanges($field) {
        const $inputFieldWrap = $field.parents('form');
        $inputFieldWrap.find('button').addClass('disabled');
        $field.attr('disabled', 'disabled');
        let parameters = {};
        let recordUid;
        if (this.pageOverlayId > 0) {
            recordUid = this.pageOverlayId;
        }
        else {
            recordUid = this.pageId;
        }
        parameters.data = {};
        parameters.data.pages = {};
        parameters.data.pages[recordUid] = { title: $field.val() };
        import('./AjaxDataHandler.esm.js').then(({ default: DataHandler }) => {
            DataHandler.process(parameters).then(() => {
                $inputFieldWrap.find('[data-action=cancel]').trigger('click');
                this.$pageTitle.text($field.val());
                this.initializePageTitleRenaming();
                top.TYPO3.Backend.NavigationContainer.PageTree.refreshTree();
            }).catch(() => {
                $inputFieldWrap.find('[data-action=cancel]').trigger('click');
            });
        });
    }
    /**
     * Activate New Content Element Wizard
     */
    initializeNewContentElementWizard() {
        Array.from(document.querySelectorAll(IdentifierEnum.newButton)).forEach((element) => {
            element.classList.remove('disabled');
        });
        jQuery(IdentifierEnum.newButton).on('click', (e) => {
            e.preventDefault();
            const $me = jQuery(e.currentTarget);
            NewContentElement.wizard($me.attr('href'), $me.data('title'));
        });
    }
}
var PageActions$1 = new PageActions();

export default PageActions$1;
