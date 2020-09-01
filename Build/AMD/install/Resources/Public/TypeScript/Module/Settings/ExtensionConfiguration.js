define(['jquery', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', 'bootstrap', '../../../../../../backend/Resources/Public/TypeScript/Notification', '../../../../../../backend/Resources/Public/TypeScript/ModuleMenu', '../AbstractInteractableModule', '../../Router', '../../Renderable/Clearable'], function ($, AjaxRequest, bootstrap, Notification, ModuleMenu, AbstractInteractableModule, Router, Clearable) { 'use strict';

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
    /**
     * Module: TYPO3/CMS/Install/Module/ExtensionConfiguration
     */
    class ExtensionConfiguration extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorFormListener = '.t3js-extensionConfiguration-form';
            this.selectorSearchInput = '.t3js-extensionConfiguration-search';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getContent();
            // Focus search field on certain user interactions
            currentModal.on('keydown', (e) => {
                const $searchInput = currentModal.find(this.selectorSearchInput);
                if (e.ctrlKey || e.metaKey) {
                    // Focus search field on ctrl-f
                    if (String.fromCharCode(e.which).toLowerCase() === 'f') {
                        e.preventDefault();
                        $searchInput.trigger('focus');
                    }
                }
                else if (e.keyCode === 27) {
                    // Clear search on ESC key
                    e.preventDefault();
                    $searchInput.val('').trigger('focus');
                }
            });
            // Perform expand collapse on search matches
            currentModal.on('keyup', this.selectorSearchInput, (e) => {
                const typedQuery = $__default['default'](e.target).val();
                const $searchInput = currentModal.find(this.selectorSearchInput);
                currentModal.find('.search-item').each((index, element) => {
                    const $item = $__default['default'](element);
                    if ($__default['default'](':contains(' + typedQuery + ')', $item).length > 0 || $__default['default']('input[value*="' + typedQuery + '"]', $item).length > 0) {
                        $item.removeClass('hidden').addClass('searchhit');
                    }
                    else {
                        $item.removeClass('searchhit').addClass('hidden');
                    }
                });
                currentModal.find('.searchhit').collapse('show');
                // Make search field clearable
                const searchInput = $searchInput.get(0);
                searchInput.clearable();
                searchInput.focus();
            });
            currentModal.on('submit', this.selectorFormListener, (e) => {
                e.preventDefault();
                this.write($__default['default'](e.currentTarget));
            });
        }
        getContent() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('extensionConfigurationGetContent')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.html(data.html);
                    this.initializeWrap();
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        /**
         * Submit the form and show the result message
         *
         * @param {JQuery} $form The form of the current extension
         */
        write($form) {
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('extension-configuration-write-token');
            const extensionConfiguration = {};
            $__default['default'].each($form.serializeArray(), (index, element) => {
                extensionConfiguration[element.name] = element.value;
            });
            (new AjaxRequest(Router.getUrl()))
                .post({
                install: {
                    token: executeToken,
                    action: 'extensionConfigurationWrite',
                    extensionKey: $form.attr('data-extensionKey'),
                    extensionConfiguration: extensionConfiguration,
                },
            })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.showMessage(element.title, element.message, element.severity);
                    });
                    if ($__default['default']('body').data('context') === 'backend') {
                        ModuleMenu.App.refreshMenu();
                    }
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        /**
         * configuration properties
         */
        initializeWrap() {
            this.findInModal('.t3js-emconf-offset').each((index, element) => {
                var _a, _b;
                const $me = $__default['default'](element);
                const $parent = $me.parent();
                const id = $me.attr('id');
                const val = $me.attr('value');
                const valArr = val.split(',');
                $me
                    .attr('data-offsetfield-x', '#' + id + '_offset_x')
                    .attr('data-offsetfield-y', '#' + id + '_offset_y')
                    .wrap('<div class="hidden"></div>');
                const elementX = $__default['default']('<div>', { 'class': 'form-multigroup-item' }).append($__default['default']('<div>', { 'class': 'input-group' }).append($__default['default']('<div>', { 'class': 'input-group-addon' }).text('x'), $__default['default']('<input>', {
                    'id': id + '_offset_x',
                    'class': 'form-control t3js-emconf-offsetfield',
                    'data-target': '#' + id,
                    'value': (_a = valArr[0]) === null || _a === void 0 ? void 0 : _a.trim(),
                })));
                const elementY = $__default['default']('<div>', { 'class': 'form-multigroup-item' }).append($__default['default']('<div>', { 'class': 'input-group' }).append($__default['default']('<div>', { 'class': 'input-group-addon' }).text('y'), $__default['default']('<input>', {
                    'id': id + '_offset_y',
                    'class': 'form-control t3js-emconf-offsetfield',
                    'data-target': '#' + id,
                    'value': (_b = valArr[1]) === null || _b === void 0 ? void 0 : _b.trim(),
                })));
                const offsetGroup = $__default['default']('<div>', { 'class': 'form-multigroup-wrap' }).append(elementX, elementY);
                $parent.append(offsetGroup);
                $parent.find('.t3js-emconf-offsetfield').on('keyup', (evt) => {
                    const $target = $parent.find($__default['default'](evt.currentTarget).data('target'));
                    $target.val($parent.find($target.data('offsetfield-x')).val() + ',' + $parent.find($target.data('offsetfield-y')).val());
                });
            });
            this.findInModal('.t3js-emconf-wrap').each((index, element) => {
                var _a, _b;
                const $me = $__default['default'](element);
                const $parent = $me.parent();
                const id = $me.attr('id');
                const val = $me.attr('value');
                const valArr = val.split('|');
                $me.attr('data-wrapfield-start', '#' + id + '_wrap_start')
                    .attr('data-wrapfield-end', '#' + id + '_wrap_end')
                    .wrap('<div class="hidden"></div>');
                const wrapGroup = $__default['default']('<div>', { 'class': 'form-multigroup-wrap' }).append($__default['default']('<div>', { 'class': 'form-multigroup-item' }).append($__default['default']('<input>', {
                    'id': id + '_wrap_start',
                    'class': 'form-control t3js-emconf-wrapfield',
                    'data-target': '#' + id,
                    'value': (_a = valArr[0]) === null || _a === void 0 ? void 0 : _a.trim(),
                })), $__default['default']('<div>', { 'class': 'form-multigroup-item' }).append($__default['default']('<input>', {
                    'id': id + '_wrap_end',
                    'class': 'form-control t3js-emconf-wrapfield',
                    'data-target': '#' + id,
                    'value': (_b = valArr[1]) === null || _b === void 0 ? void 0 : _b.trim(),
                })));
                $parent.append(wrapGroup);
                $parent.find('.t3js-emconf-wrapfield').on('keyup', (evt) => {
                    const $target = $parent.find($__default['default'](evt.currentTarget).data('target'));
                    $target.val($parent.find($target.data('wrapfield-start')).val() + '|' + $parent.find($target.data('wrapfield-end')).val());
                });
            });
        }
    }
    new ExtensionConfiguration();

});
