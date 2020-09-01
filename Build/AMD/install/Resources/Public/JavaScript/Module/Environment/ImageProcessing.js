define(['jquery', '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', 'bootstrap', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../AbstractInteractableModule', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Router'], function ($, AjaxRequest, bootstrap, Modal, Notification, AbstractInteractableModule, Severity, InfoBox, Router) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/ImageProcessing
     */
    class ImageProcessing extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorExecuteTrigger = '.t3js-imageProcessing-execute';
            this.selectorTestContainer = '.t3js-imageProcessing-twinContainer';
            this.selectorTwinImageTemplate = '.t3js-imageProcessing-twinImage-template';
            this.selectorCommandContainer = '.t3js-imageProcessing-command';
            this.selectorCommandText = '.t3js-imageProcessing-command-text';
            this.selectorTwinImages = '.t3js-imageProcessing-images';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
            currentModal.on('click', this.selectorExecuteTrigger, (e) => {
                e.preventDefault();
                this.runTests();
            });
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('imageProcessingGetData')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                    Modal.setButtons(data.buttons);
                    this.runTests();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        runTests() {
            const modalContent = this.getModalBody();
            const $triggerButton = this.findInModal(this.selectorExecuteTrigger);
            this.setModalButtonsState(false);
            const $twinImageTemplate = this.findInModal(this.selectorTwinImageTemplate);
            const promises = [];
            modalContent.find(this.selectorTestContainer).each((index, container) => {
                const $container = $__default['default'](container);
                const testType = $container.data('test');
                const message = InfoBox.render(Severity.loading, 'Loading...', '');
                $container.empty().html(message);
                const request = (new AjaxRequest(Router.getUrl(testType)))
                    .get({ cache: 'no-cache' })
                    .then(async (response) => {
                    const data = await response.resolve();
                    if (data.success === true) {
                        $container.empty();
                        if (Array.isArray(data.status)) {
                            data.status.forEach((element) => {
                                const aMessage = InfoBox.render(element.severity, element.title, element.message);
                                $container.append(aMessage);
                            });
                        }
                        const $aTwin = $twinImageTemplate.clone();
                        $aTwin.removeClass('t3js-imageProcessing-twinImage-template');
                        if (data.fileExists === true) {
                            $aTwin.find('img.reference').attr('src', data.referenceFile);
                            $aTwin.find('img.result').attr('src', data.outputFile);
                            $aTwin.find(this.selectorTwinImages).show();
                        }
                        if (Array.isArray(data.command) && data.command.length > 0) {
                            $aTwin.find(this.selectorCommandContainer).show();
                            const commandText = [];
                            data.command.forEach((aElement) => {
                                commandText.push('<strong>Command:</strong>\n' + aElement[1]);
                                if (aElement.length === 3) {
                                    commandText.push('<strong>Result:</strong>\n' + aElement[2]);
                                }
                            });
                            $aTwin.find(this.selectorCommandText).html(commandText.join('\n'));
                        }
                        $container.append($aTwin);
                    }
                }, (error) => {
                    Router.handleAjaxError(error, modalContent);
                });
                promises.push(request);
            });
            Promise.all(promises).then(() => {
                $triggerButton.removeClass('disabled').prop('disabled', false);
            });
        }
    }
    var ImageProcessing$1 = new ImageProcessing();

    return ImageProcessing$1;

});
