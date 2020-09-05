import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import DeferredAction from '../../../../backend/Resources/Public/JavaScript/ActionButton/DeferredAction.esm.js';
import NotificationService from '../../../../backend/Resources/Public/JavaScript/Notification.esm.js';

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
 * Module: TYPO3/CMS/Redirects/EventHandler
 * @exports TYPO3/CMS/Redirects/EventHandler
 */
class EventHandler {
    constructor() {
        document.addEventListener('typo3:redirects:slugChanged', (evt) => this.onSlugChanged(evt.detail));
    }
    onSlugChanged(detail) {
        let actions = [];
        const correlations = detail.correlations;
        if (detail.autoUpdateSlugs) {
            actions.push({
                label: TYPO3.lang['notification.redirects.button.revert_update'],
                action: new DeferredAction(() => this.revert([
                    correlations.correlationIdSlugUpdate,
                    correlations.correlationIdRedirectCreation,
                ])),
            });
        }
        if (detail.autoCreateRedirects) {
            actions.push({
                label: TYPO3.lang['notification.redirects.button.revert_redirect'],
                action: new DeferredAction(() => this.revert([
                    correlations.correlationIdRedirectCreation,
                ])),
            });
        }
        let title = TYPO3.lang['notification.slug_only.title'];
        let message = TYPO3.lang['notification.slug_only.message'];
        if (detail.autoCreateRedirects) {
            title = TYPO3.lang['notification.slug_and_redirects.title'];
            message = TYPO3.lang['notification.slug_and_redirects.message'];
        }
        NotificationService.info(title, message, 0, actions);
    }
    revert(correlationIds) {
        const request = new AjaxRequest(TYPO3.settings.ajaxUrls.redirects_revert_correlation).withQueryArguments({
            correlation_ids: correlationIds
        }).get();
        request.then(async (response) => {
            const json = await response.resolve();
            if (json.status === 'ok') {
                NotificationService.success(json.title, json.message);
            }
            if (json.status === 'error') {
                NotificationService.error(json.title, json.message);
            }
        }).catch(() => {
            NotificationService.error(TYPO3.lang.redirects_error_title, TYPO3.lang.redirects_error_message);
        });
        return request;
    }
}
var EventHandler$1 = new EventHandler();

export default EventHandler$1;
