define(['./Enum/Severity', 'jquery', '../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', './Icons', './Wizard'], function (Severity, $, AjaxRequest, Icons, Wizard) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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
    class Localization {
        constructor() {
            this.triggerButton = '.t3js-localize';
            this.localizationMode = null;
            this.sourceLanguage = null;
            this.records = [];
            $__default['default'](() => {
                this.initialize();
            });
        }
        initialize() {
            const me = this;
            Icons.getIcon('actions-localize', Icons.sizes.large).then((localizeIconMarkup) => {
                Icons.getIcon('actions-edit-copy', Icons.sizes.large).then((copyIconMarkup) => {
                    $__default['default'](me.triggerButton).removeClass('disabled');
                    $__default['default'](document).on('click', me.triggerButton, (e) => {
                        e.preventDefault();
                        const $triggerButton = $__default['default'](e.currentTarget);
                        const actions = [];
                        let slideStep1 = '';
                        if ($triggerButton.data('allowTranslate')) {
                            actions.push('<div class="row">'
                                + '<div class="btn-group col-sm-3">'
                                + '<label class="btn btn-block btn-default t3js-localization-option" data-helptext=".t3js-helptext-translate">'
                                + localizeIconMarkup
                                + '<input type="radio" name="mode" id="mode_translate" value="localize" style="display: none">'
                                + '<br>Translate</label>'
                                + '</div>'
                                + '<div class="col-sm-9">'
                                + '<p class="t3js-helptext t3js-helptext-translate text-muted">' + TYPO3.lang['localize.educate.translate'] + '</p>'
                                + '</div>'
                                + '</div>');
                        }
                        if ($triggerButton.data('allowCopy')) {
                            actions.push('<div class="row">'
                                + '<div class="col-sm-3 btn-group">'
                                + '<label class="btn btn-block btn-default t3js-localization-option" data-helptext=".t3js-helptext-copy">'
                                + copyIconMarkup
                                + '<input type="radio" name="mode" id="mode_copy" value="copyFromLanguage" style="display: none">'
                                + '<br>Copy</label>'
                                + '</div>'
                                + '<div class="col-sm-9">'
                                + '<p class="t3js-helptext t3js-helptext-copy text-muted">' + TYPO3.lang['localize.educate.copy'] + '</p>'
                                + '</div>'
                                + '</div>');
                        }
                        if ($triggerButton.data('allowTranslate') === 0 && $triggerButton.data('allowCopy') === 0) {
                            actions.push('<div class="row">'
                                + '<div class="col-sm-12">'
                                + '<div class="alert alert-warning">'
                                + '<div class="media">'
                                + '<div class="media-left">'
                                + '<span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-exclamation fa-stack-1x"></i></span>'
                                + '</div>'
                                + '<div class="media-body">'
                                + '<p class="alert-message">' + TYPO3.lang['localize.educate.noTranslate'] + '</p>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>');
                        }
                        slideStep1 += '<div data-toggle="buttons">' + actions.join('<hr>') + '</div>';
                        Wizard.addSlide('localize-choose-action', TYPO3.lang['localize.wizard.header_page']
                            .replace('{0}', $triggerButton.data('page'))
                            .replace('{1}', $triggerButton.data('languageName')), slideStep1, Severity.SeverityEnum.info);
                        Wizard.addSlide('localize-choose-language', TYPO3.lang['localize.view.chooseLanguage'], '', Severity.SeverityEnum.info, ($slide) => {
                            Icons.getIcon('spinner-circle-dark', Icons.sizes.large).then((markup) => {
                                $slide.html('<div class="text-center">' + markup + '</div>');
                                this.loadAvailableLanguages(parseInt($triggerButton.data('pageId'), 10), parseInt($triggerButton.data('languageId'), 10)).then(async (response) => {
                                    const result = await response.resolve();
                                    if (result.length === 1) {
                                        // We only have one result, auto select the record and continue
                                        this.sourceLanguage = result[0].uid;
                                        Wizard.unlockNextStep().trigger('click');
                                        return;
                                    }
                                    Wizard.getComponent().on('click', '.t3js-language-option', (optionEvt) => {
                                        const $me = $__default['default'](optionEvt.currentTarget);
                                        const $radio = $me.find('input[type="radio"]');
                                        this.sourceLanguage = $radio.val();
                                        console.log('Localization.ts@132', this.sourceLanguage);
                                        Wizard.unlockNextStep();
                                    });
                                    const $languageButtons = $__default['default']('<div />', { class: 'row', 'data-toggle': 'buttons' });
                                    for (const languageObject of result) {
                                        $languageButtons.append($__default['default']('<div />', { class: 'col-sm-4' }).append($__default['default']('<label />', { class: 'btn btn-default btn-block t3js-language-option option' })
                                            .text(' ' + languageObject.title)
                                            .prepend(languageObject.flagIcon)
                                            .prepend($__default['default']('<input />', {
                                            type: 'radio',
                                            name: 'language',
                                            id: 'language' + languageObject.uid,
                                            value: languageObject.uid,
                                            style: 'display: none;',
                                        }))));
                                    }
                                    $slide.empty().append($languageButtons);
                                });
                            });
                        });
                        Wizard.addSlide('localize-summary', TYPO3.lang['localize.view.summary'], '', Severity.SeverityEnum.info, ($slide) => {
                            Icons.getIcon('spinner-circle-dark', Icons.sizes.large).then((markup) => {
                                $slide.html('<div class="text-center">' + markup + '</div>');
                            });
                            this.getSummary(parseInt($triggerButton.data('pageId'), 10), parseInt($triggerButton.data('languageId'), 10)).then(async (response) => {
                                const result = await response.resolve();
                                $slide.empty();
                                this.records = [];
                                const columns = result.columns.columns;
                                const columnList = result.columns.columnList;
                                columnList.forEach((colPos) => {
                                    if (typeof result.records[colPos] === 'undefined') {
                                        return;
                                    }
                                    const column = columns[colPos];
                                    const $row = $__default['default']('<div />', { class: 'row' });
                                    result.records[colPos].forEach((record) => {
                                        const label = ' (' + record.uid + ') ' + record.title;
                                        this.records.push(record.uid);
                                        $row.append($__default['default']('<div />', { 'class': 'col-sm-6' }).append($__default['default']('<div />', { 'class': 'input-group' }).append($__default['default']('<span />', { 'class': 'input-group-addon' }).append($__default['default']('<input />', {
                                            type: 'checkbox',
                                            'class': 't3js-localization-toggle-record',
                                            id: 'record-uid-' + record.uid,
                                            checked: 'checked',
                                            'data-uid': record.uid,
                                            'aria-label': label,
                                        })), $__default['default']('<label />', {
                                            'class': 'form-control',
                                            for: 'record-uid-' + record.uid,
                                        }).text(label).prepend(record.icon))));
                                    });
                                    $slide.append($__default['default']('<fieldset />', {
                                        'class': 'localization-fieldset',
                                    }).append($__default['default']('<label />').text(column).prepend($__default['default']('<input />', {
                                        'class': 't3js-localization-toggle-column',
                                        type: 'checkbox',
                                        checked: 'checked',
                                    })), $row));
                                });
                                Wizard.unlockNextStep();
                                Wizard.getComponent().on('change', '.t3js-localization-toggle-record', (cmpEvt) => {
                                    const $me = $__default['default'](cmpEvt.currentTarget);
                                    const uid = $me.data('uid');
                                    const $parent = $me.closest('fieldset');
                                    const $columnCheckbox = $parent.find('.t3js-localization-toggle-column');
                                    if ($me.is(':checked')) {
                                        this.records.push(uid);
                                    }
                                    else {
                                        const index = this.records.indexOf(uid);
                                        if (index > -1) {
                                            this.records.splice(index, 1);
                                        }
                                    }
                                    const $allChildren = $parent.find('.t3js-localization-toggle-record');
                                    const $checkedChildren = $parent.find('.t3js-localization-toggle-record:checked');
                                    $columnCheckbox.prop('checked', $checkedChildren.length > 0);
                                    $columnCheckbox.prop('indeterminate', $checkedChildren.length > 0 && $checkedChildren.length < $allChildren.length);
                                    if (this.records.length > 0) {
                                        Wizard.unlockNextStep();
                                    }
                                    else {
                                        Wizard.lockNextStep();
                                    }
                                }).on('change', '.t3js-localization-toggle-column', (toggleEvt) => {
                                    const $me = $__default['default'](toggleEvt.currentTarget);
                                    const $children = $me.closest('fieldset').find('.t3js-localization-toggle-record');
                                    $children.prop('checked', $me.is(':checked'));
                                    $children.trigger('change');
                                });
                            });
                        });
                        Wizard.addFinalProcessingSlide(() => {
                            this.localizeRecords(parseInt($triggerButton.data('pageId'), 10), parseInt($triggerButton.data('languageId'), 10), this.records).then(() => {
                                Wizard.dismiss();
                                document.location.reload();
                            });
                        }).then(() => {
                            Wizard.show();
                            Wizard.getComponent().on('click', '.t3js-localization-option', (optionEvt) => {
                                const $me = $__default['default'](optionEvt.currentTarget);
                                const $radio = $me.find('input[type="radio"]');
                                if ($me.data('helptext')) {
                                    const $container = $__default['default'](optionEvt.delegateTarget);
                                    $container.find('.t3js-helptext').addClass('text-muted');
                                    $container.find($me.data('helptext')).removeClass('text-muted');
                                }
                                this.localizationMode = $radio.val();
                                Wizard.unlockNextStep();
                            });
                        });
                    });
                });
            });
        }
        /**
         * Load available languages from page
         *
         * @param {number} pageId
         * @param {number} languageId
         * @returns {Promise<AjaxResponse>}
         */
        loadAvailableLanguages(pageId, languageId) {
            return new AjaxRequest(TYPO3.settings.ajaxUrls.page_languages).withQueryArguments({
                pageId: pageId,
                languageId: languageId,
            }).get();
        }
        /**
         * Get summary for record processing
         *
         * @param {number} pageId
         * @param {number} languageId
         * @returns {Promise<AjaxResponse>}
         */
        getSummary(pageId, languageId) {
            return new AjaxRequest(TYPO3.settings.ajaxUrls.records_localize_summary).withQueryArguments({
                pageId: pageId,
                destLanguageId: languageId,
                languageId: this.sourceLanguage,
            }).get();
        }
        /**
         * Localize records
         *
         * @param {number} pageId
         * @param {number} languageId
         * @param {Array<number>} uidList
         * @returns {Promise<AjaxResponse>}
         */
        localizeRecords(pageId, languageId, uidList) {
            return new AjaxRequest(TYPO3.settings.ajaxUrls.records_localize).withQueryArguments({
                pageId: pageId,
                srcLanguageId: this.sourceLanguage,
                destLanguageId: languageId,
                action: this.localizationMode,
                uidList: uidList,
            }).get();
        }
    }
    new Localization();

});
