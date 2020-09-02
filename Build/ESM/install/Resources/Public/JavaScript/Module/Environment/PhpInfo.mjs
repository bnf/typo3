import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.mjs';
import { AbstractInteractableModule } from '../AbstractInteractableModule.mjs';
import Router from '../../Router.mjs';

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
class PhpInfo extends AbstractInteractableModule {
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
                NotificationService.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
}
var PhpInfo$1 = new PhpInfo();

export default PhpInfo$1;
