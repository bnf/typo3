define(['require', './Enum/KeyTypes', 'jquery', './Storage/Persistent', './Wizard/NewContentElement'], function (require, KeyTypes, $, Persistent, NewContentElement) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespaceDefaultOnly(e) {
        return Object.freeze({__proto__: null, 'default': e});
    }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
            $__default['default'](() => {
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
            if (!$__default['default'].isReady) {
                $__default['default'](() => {
                    this.initializePageTitleRenaming();
                });
                return;
            }
            if (this.pageId <= 0) {
                return;
            }
            const $editActionLink = $__default['default']('<a class="hidden" href="#" data-action="edit"><span class="t3-icon fa fa-pencil"></span></a>');
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
            this.$pageTitle = $__default['default'](IdentifierEnum.pageTitle + ':first');
            this.$showHiddenElementsCheckbox = $__default['default']('#checkTt_content_showHidden');
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
            const $me = $__default['default'](e.currentTarget);
            const $hiddenElements = $__default['default'](IdentifierEnum.hiddenElements);
            // show a spinner to show activity
            const $spinner = $__default['default']('<span />', { class: 'checkbox-spinner fa fa-circle-o-notch fa-spin' });
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
            const $inputFieldWrap = $__default['default']('<form>' +
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
                    case KeyTypes.KeyTypesEnum.ENTER:
                        $inputFieldWrap.find('[data-action="submit"]').trigger('click');
                        break;
                    case KeyTypes.KeyTypesEnum.ESCAPE:
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
            new Promise(function (resolve, reject) { require(['./AjaxDataHandler'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(({ default: DataHandler }) => {
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
            $__default['default'](IdentifierEnum.newButton).on('click', (e) => {
                e.preventDefault();
                const $me = $__default['default'](e.currentTarget);
                NewContentElement.wizard($me.attr('href'), $me.data('title'));
            });
        }
    }
    var PageActions$1 = new PageActions();

    return PageActions$1;

});
