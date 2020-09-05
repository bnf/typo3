define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../../../backend/Resources/Public/JavaScript/Modal', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Renderable/Severity', '../../Renderable/InfoBox', '../../Renderable/ProgressBar', '../../Router', '../AbstractInteractableModule'], function (AjaxRequest, jquery, Modal, Notification, Severity, InfoBox, ProgressBar, Router, AbstractInteractableModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/TcaExtTablesCheck
     */
    class TcaExtTablesCheck extends AbstractInteractableModule.AbstractInteractableModule {
        constructor() {
            super(...arguments);
            this.selectorCheckTrigger = '.t3js-tcaExtTablesCheck-check';
            this.selectorOutputContainer = '.t3js-tcaExtTablesCheck-output';
        }
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.check();
            currentModal.on('click', this.selectorCheckTrigger, (e) => {
                e.preventDefault();
                this.check();
            });
        }
        check() {
            this.setModalButtonsState(false);
            const modalContent = this.getModalBody();
            const $outputContainer = jquery(this.selectorOutputContainer);
            const m = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.empty().html(m);
            (new AjaxRequest(Router.getUrl('tcaExtTablesCheck')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                modalContent.empty().append(data.html);
                Modal.setButtons(data.buttons);
                if (data.success === true && Array.isArray(data.status)) {
                    if (data.status.length > 0) {
                        const aMessage = InfoBox.render(Severity.warning, 'Following extensions change TCA in ext_tables.php', 'Check ext_tables.php files, look for ExtensionManagementUtility calls and $GLOBALS[\'TCA\'] modifications');
                        modalContent.find(this.selectorOutputContainer).append(aMessage);
                        data.status.forEach((element) => {
                            const m2 = InfoBox.render(element.severity, element.title, element.message);
                            $outputContainer.append(m2);
                            modalContent.append(m2);
                        });
                    }
                    else {
                        const aMessage = InfoBox.render(Severity.ok, 'No TCA changes in ext_tables.php files. Good job!', '');
                        modalContent.find(this.selectorOutputContainer).append(aMessage);
                    }
                }
                else {
                    Notification.error('Something went wrong', 'Please use the module "Check for broken extensions" to find a possible extension causing this issue.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    var TcaExtTablesCheck$1 = new TcaExtTablesCheck();

    return TcaExtTablesCheck$1;

});
