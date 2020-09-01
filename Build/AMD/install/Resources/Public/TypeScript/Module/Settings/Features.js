define(['jquery', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', '../../../../../../backend/Resources/Public/TypeScript/Modal', '../../../../../../backend/Resources/Public/TypeScript/Notification', '../AbstractInteractableModule', '../../Router'], function ($, AjaxRequest, Modal, Notification, AbstractInteractableModule, Router) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/Features
     */
    class Features extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorSaveTrigger = '.t3js-features-save';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getContent();
            currentModal.on('click', this.selectorSaveTrigger, (e) => {
                e.preventDefault();
                this.save();
            });
        }
        getContent() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('featuresGetContent')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        save() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const executeToken = this.getModuleContent().data('features-save-token');
            const postData = {};
            $__default['default'](this.findInModal('form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            postData['install[action]'] = 'featuresSave';
            postData['install[token]'] = executeToken;
            (new AjaxRequest(Router.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.showMessage(element.title, element.message, element.severity);
                    });
                    this.getContent();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    new Features();

});
