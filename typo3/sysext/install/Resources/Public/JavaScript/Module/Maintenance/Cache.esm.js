import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import NotificationService from '../../../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import Router from '../../Router.esm.js';
import { AbstractInlineModule } from '../AbstractInlineModule.esm.js';

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
 * Module: TYPO3/CMS/Install/Module/Cache
 */
class Cache extends AbstractInlineModule {
    initialize($trigger) {
        this.setButtonState($trigger, false);
        (new AjaxRequest(Router.getUrl('cacheClearAll', 'maintenance')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                if (data.status.length > 0) {
                    data.status.forEach((element) => {
                        NotificationService.success(element.title, element.message);
                    });
                }
            }
            else {
                NotificationService.error('Something went wrong clearing caches');
            }
        }, () => {
            // In case the clear cache action fails (typically 500 from server), do not kill the entire
            // install tool, instead show a notification that something went wrong.
            NotificationService.error('Clearing caches failed', 'Clearing caches went wrong on the server side. Check the system for broken extensions or missing database tables and try again.');
        })
            .finally(() => {
            this.setButtonState($trigger, true);
        });
    }
}
var Cache$1 = new Cache();

export default Cache$1;
