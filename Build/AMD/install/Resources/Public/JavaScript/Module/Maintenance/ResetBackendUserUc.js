define(['../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../../../backend/Resources/Public/JavaScript/Notification', '../../Router', '../AbstractInlineModule'], function (AjaxRequest, Notification, Router, AbstractInlineModule) { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/ResetBackendUserUc
     */
    class ResetBackendUserUc extends AbstractInlineModule.AbstractInlineModule {
        initialize($trigger) {
            this.setButtonState($trigger, false);
            (new AjaxRequest(Router.getUrl('resetBackendUserUc')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true && Array.isArray(data.status)) {
                    if (data.status.length > 0) {
                        data.status.forEach((element) => {
                            Notification.success(element.title, element.message);
                        });
                    }
                }
                else {
                    Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                }
            }, () => {
                // In case the reset action fails (typically 500 from server), do not kill the entire
                // install tool, instead show a notification that something went wrong.
                Notification.error('Reset preferences of all backend users failed', 'Resetting preferences of all backend users failed for an unknown reason. Please check your server\'s logs for further investigation.');
            })
                .finally(() => {
                this.setButtonState($trigger, true);
            });
        }
    }
    var ResetBackendUserUc$1 = new ResetBackendUserUc();

    return ResetBackendUserUc$1;

});
