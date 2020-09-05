import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import Router from '../../Router.esm.js';
import { AbstractInteractableModule } from '../AbstractInteractableModule.esm.js';

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
 * Module: TYPO3/CMS/Install/Module/SystemInformation
 */
class SystemInformation extends AbstractInteractableModule {
    initialize(currentModal) {
        this.currentModal = currentModal;
        this.getData();
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('systemInformationGetData')))
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
var SystemInformation$1 = new SystemInformation();

export default SystemInformation$1;
