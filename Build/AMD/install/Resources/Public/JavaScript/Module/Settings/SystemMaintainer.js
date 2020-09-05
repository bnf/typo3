define(['require', '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Router', '../AbstractInteractableModule'], function (require, AjaxRequest, jquery, bootstrap, Modal, Notification, Router, AbstractInteractableModule) { 'use strict';

    function _interopNamespaceDefaultOnly(e) {
        return Object.freeze({__proto__: null, 'default': e});
    }

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
     * Module: TYPO3/CMS/Install/Module/SystemMaintainer
     */
    class SystemMaintainer extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorWriteTrigger = '.t3js-systemMaintainer-write';
            this.selectorChosenContainer = '.t3js-systemMaintainer-chosen';
            this.selectorChosenField = '.t3js-systemMaintainer-chosen-select';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            const isInIframe = window.location !== window.parent.location;
            if (isInIframe) {
                top.require(['TYPO3/CMS/Install/chosen.jquery.min'], () => {
                    this.getList();
                });
            }
            else {
                new Promise(function (resolve, reject) { require(['../../chosen.jquery.min'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefaultOnly(m)); }, reject) }).then(() => {
                    this.getList();
                });
            }
            currentModal.on('click', this.selectorWriteTrigger, (e) => {
                e.preventDefault();
                this.write();
            });
        }
        getList() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('systemMaintainerGetList')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.html(data.html);
                    Modal.setButtons(data.buttons);
                    if (Array.isArray(data.users)) {
                        data.users.forEach((element) => {
                            let name = element.username;
                            if (element.disable) {
                                name = '[DISABLED] ' + name;
                            }
                            const $option = jquery('<option>', { 'value': element.uid }).text(name);
                            if (element.isSystemMaintainer) {
                                $option.attr('selected', 'selected');
                            }
                            modalContent.find(this.selectorChosenField).append($option);
                        });
                    }
                    const config = {
                        '.t3js-systemMaintainer-chosen-select': {
                            width: '100%',
                            placeholder_text_multiple: 'users',
                        },
                    };
                    for (const selector in config) {
                        if (config.hasOwnProperty(selector)) {
                            modalContent.find(selector).chosen(config[selector]);
                        }
                    }
                    modalContent.find(this.selectorChosenContainer).show();
                    modalContent.find(this.selectorChosenField).trigger('chosen:updated');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        write() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('system-maintainer-write-token');
            const selectedUsers = this.findInModal(this.selectorChosenField).val();
            (new AjaxRequest(Router.getUrl())).post({
                install: {
                    users: selectedUsers,
                    token: executeToken,
                    action: 'systemMaintainerWrite',
                },
            }).then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    if (Array.isArray(data.status)) {
                        data.status.forEach((element) => {
                            Notification.success(element.title, element.message);
                        });
                    }
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
    var SystemMaintainer$1 = new SystemMaintainer();

    return SystemMaintainer$1;

});
