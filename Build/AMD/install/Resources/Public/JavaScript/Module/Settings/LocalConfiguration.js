define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Router', '../AbstractInteractableModule', '../../Renderable/Clearable'], function (AjaxRequest, jquery, bootstrap, Modal, Notification, Router, AbstractInteractableModule, Clearable) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/LocalConfiguration
     */
    class LocalConfiguration extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorToggleAllTrigger = '.t3js-localConfiguration-toggleAll';
            this.selectorWriteTrigger = '.t3js-localConfiguration-write';
            this.selectorSearchTrigger = '.t3js-localConfiguration-search';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getContent();
            // Write out new settings
            currentModal.on('click', this.selectorWriteTrigger, () => {
                this.write();
            });
            // Expand / collapse "Toggle all" button
            currentModal.on('click', this.selectorToggleAllTrigger, () => {
                const modalContent = this.getModalBody();
                const panels = modalContent.find('.panel-collapse');
                const action = (panels.eq(0).hasClass('in')) ? 'hide' : 'show';
                panels.collapse(action);
            });
            // Make jquerys "contains" work case-insensitive
            jQuery.expr[':'].contains = jQuery.expr.createPseudo((arg) => {
                return (elem) => {
                    return jQuery(elem).text().toUpperCase().includes(arg.toUpperCase());
                };
            });
            // Focus search field on certain user interactions
            currentModal.on('keydown', (e) => {
                const $searchInput = currentModal.find(this.selectorSearchTrigger);
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
            currentModal.on('keyup', this.selectorSearchTrigger, (e) => {
                const typedQuery = jquery(e.target).val();
                const $searchInput = currentModal.find((this.selectorSearchTrigger));
                currentModal.find('div.item').each((index, element) => {
                    const $item = jquery(element);
                    if (jquery(':contains(' + typedQuery + ')', $item).length > 0 || jquery('input[value*="' + typedQuery + '"]', $item).length > 0) {
                        $item.removeClass('hidden').addClass('searchhit');
                    }
                    else {
                        $item.removeClass('searchhit').addClass('hidden');
                    }
                });
                currentModal.find('.searchhit').parent().collapse('show');
                // Make search field clearable
                const searchInput = $searchInput.get(0);
                searchInput.clearable();
                searchInput.focus();
            });
        }
        getContent() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('localConfigurationGetContent')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.html(data.html);
                    Modal.setButtons(data.buttons);
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        write() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('local-configuration-write-token');
            const configurationValues = {};
            this.findInModal('.t3js-localConfiguration-pathValue').each((i, element) => {
                const $element = jquery(element);
                if ($element.attr('type') === 'checkbox') {
                    if (element.checked) {
                        configurationValues[$element.data('path')] = '1';
                    }
                    else {
                        configurationValues[$element.data('path')] = '0';
                    }
                }
                else {
                    configurationValues[$element.data('path')] = $element.val();
                }
            });
            (new AjaxRequest(Router.getUrl())).post({
                install: {
                    action: 'localConfigurationWrite',
                    token: executeToken,
                    configurationValues: configurationValues,
                },
            }).then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.showMessage(element.title, element.message, element.severity);
                    });
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            }).finally(() => {
                this.setModalButtonsState(true);
            });
        }
    }
    var LocalConfiguration$1 = new LocalConfiguration();

    return LocalConfiguration$1;

});
