define(['jquery', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', 'bootstrap', '../../../../../../backend/Resources/Public/TypeScript/Modal', '../../../../../../backend/Resources/Public/TypeScript/Notification', '../AbstractInteractableModule', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Renderable/ProgressBar', '../../Router'], function ($, AjaxRequest, bootstrap, Modal, Notification, AbstractInteractableModule, Severity, InfoBox, ProgressBar, Router) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/ExtensionCompatTester
     */
    class ExtensionCompatTester extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorCheckTrigger = '.t3js-extensionCompatTester-check';
            this.selectorUninstallTrigger = '.t3js-extensionCompatTester-uninstall';
            this.selectorOutputContainer = '.t3js-extensionCompatTester-output';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getLoadedExtensionList();
            currentModal.on('click', this.selectorCheckTrigger, () => {
                this.findInModal(this.selectorUninstallTrigger).addClass('hidden');
                this.findInModal(this.selectorOutputContainer).empty();
                this.getLoadedExtensionList();
            });
            currentModal.on('click', this.selectorUninstallTrigger, (e) => {
                this.uninstallExtension($__default['default'](e.target).data('extension'));
            });
        }
        getLoadedExtensionList() {
            this.setModalButtonsState(false);
            this.findInModal('.modal-loading').hide();
            const modalContent = this.getModalBody();
            const $outputContainer = this.findInModal(this.selectorOutputContainer);
            const message = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.append(message);
            (new AjaxRequest(Router.getUrl('extensionCompatTesterLoadedExtensionList')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                modalContent.empty().append(data.html);
                Modal.setButtons(data.buttons);
                const $innerOutputContainer = this.findInModal(this.selectorOutputContainer);
                const progressBar = ProgressBar.render(Severity.loading, 'Loading...', '');
                $innerOutputContainer.append(progressBar);
                if (data.success === true) {
                    this.loadExtLocalconf().then(() => {
                        $innerOutputContainer.append(InfoBox.render(Severity.ok, 'ext_localconf.php of all loaded extensions successfully loaded', ''));
                        this.loadExtTables().then(() => {
                            $innerOutputContainer.append(InfoBox.render(Severity.ok, 'ext_tables.php of all loaded extensions successfully loaded', ''));
                        }, async (error) => {
                            this.renderFailureMessages('ext_tables.php', (await error.response.json()).brokenExtensions, $innerOutputContainer);
                        }).finally(() => {
                            this.unlockModal();
                        });
                    }, async (error) => {
                        this.renderFailureMessages('ext_localconf.php', (await error.response.json()).brokenExtensions, $innerOutputContainer);
                        $innerOutputContainer.append(InfoBox.render(Severity.notice, 'Skipped scanning ext_tables.php files due to previous errors', ''));
                        this.unlockModal();
                    });
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
        unlockModal() {
            this.findInModal(this.selectorOutputContainer).find('.alert-loading').remove();
            this.findInModal(this.selectorCheckTrigger).removeClass('disabled').prop('disabled', false);
        }
        renderFailureMessages(scope, brokenExtensions, $outputContainer) {
            for (let extension of brokenExtensions) {
                let uninstallAction;
                if (!extension.isProtected) {
                    uninstallAction = $__default['default']('<button />', { 'class': 'btn btn-danger t3js-extensionCompatTester-uninstall' })
                        .attr('data-extension', extension.name)
                        .text('Uninstall extension "' + extension.name + '"');
                }
                $outputContainer.append(InfoBox.render(Severity.error, 'Loading ' + scope + ' of extension "' + extension.name + '" failed', (extension.isProtected ? 'Extension is mandatory and cannot be uninstalled.' : '')), uninstallAction);
            }
            this.unlockModal();
        }
        loadExtLocalconf() {
            const executeToken = this.getModuleContent().data('extension-compat-tester-load-ext_localconf-token');
            return new AjaxRequest(Router.getUrl()).post({
                'install': {
                    'action': 'extensionCompatTesterLoadExtLocalconf',
                    'token': executeToken,
                },
            });
        }
        loadExtTables() {
            const executeToken = this.getModuleContent().data('extension-compat-tester-load-ext_tables-token');
            return new AjaxRequest(Router.getUrl()).post({
                'install': {
                    'action': 'extensionCompatTesterLoadExtTables',
                    'token': executeToken,
                },
            });
        }
        /**
         * Send an ajax request to uninstall an extension (or multiple extensions)
         *
         * @param extension string of extension(s) - may be comma separated
         */
        uninstallExtension(extension) {
            const executeToken = this.getModuleContent().data('extension-compat-tester-uninstall-extension-token');
            const modalContent = this.getModalBody();
            const $outputContainer = $__default['default'](this.selectorOutputContainer);
            const message = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.append(message);
            (new AjaxRequest(Router.getUrl()))
                .post({
                install: {
                    action: 'extensionCompatTesterUninstallExtension',
                    token: executeToken,
                    extension: extension,
                },
            })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success) {
                    if (Array.isArray(data.status)) {
                        data.status.forEach((element) => {
                            const aMessage = InfoBox.render(element.severity, element.title, element.message);
                            modalContent.find(this.selectorOutputContainer).empty().append(aMessage);
                        });
                    }
                    this.findInModal(this.selectorUninstallTrigger).addClass('hidden');
                    this.getLoadedExtensionList();
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    new ExtensionCompatTester();

});
