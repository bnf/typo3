define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Router', '../AbstractInteractableModule'], function (AjaxRequest, Notification, Router, AbstractInteractableModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/PhpInfo
     */
    class PhpInfo extends AbstractInteractableModule.AbstractInteractableModule {
        initialize(currentModal) {
            this.currentModal = currentModal;
            this.getData();
        }
        getData() {
            const modalContent = this.getModalBody();
            (new AjaxRequest(Router.getUrl('phpInfoGetData')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    modalContent.empty().append(data.html);
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
        }
    }
    var PhpInfo$1 = new PhpInfo();

    return PhpInfo$1;

});
