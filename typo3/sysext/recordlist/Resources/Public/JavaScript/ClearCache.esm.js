import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../../../../backend/Resources/Public/JavaScript/Icons.esm.js';
import NotificationService from '../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
var Identifiers;
(function (Identifiers) {
    Identifiers["clearCache"] = ".t3js-clear-page-cache";
    Identifiers["icon"] = ".t3js-icon";
})(Identifiers || (Identifiers = {}));
/**
 * Module: TYPO3/CMS/Recordlist/ClearCache
 */
class ClearCache {
    static setDisabled(element, isDisabled) {
        element.disabled = isDisabled;
        element.classList.toggle('disabled', isDisabled);
    }
    /**
     * Send an AJAX request to clear a page's cache
     *
     * @param {number} pageId
     * @return Promise<AjaxResponse>
     */
    static sendClearCacheRequest(pageId) {
        const request = new AjaxRequest(TYPO3.settings.ajaxUrls.web_list_clearpagecache).withQueryArguments({ id: pageId }).get({ cache: 'no-cache' });
        request.then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                NotificationService.success(data.title, data.message, 1);
            }
            else {
                NotificationService.error(data.title, data.message, 1);
            }
        }, () => {
            NotificationService.error('Clearing page caches went wrong on the server side.');
        });
        return request;
    }
    constructor() {
        this.registerClickHandler();
    }
    registerClickHandler() {
        const trigger = document.querySelector(`${Identifiers.clearCache}:not([disabled])`);
        if (trigger !== null) {
            new RegularEvent('click', (e) => {
                e.preventDefault();
                // The action trigger behaves like a button
                const me = e.currentTarget;
                const id = parseInt(me.dataset.id, 10);
                ClearCache.setDisabled(me, true);
                Icons.getIcon('spinner-circle-dark', Icons.sizes.small, null, 'disabled').then((icon) => {
                    me.querySelector(Identifiers.icon).outerHTML = icon;
                });
                ClearCache.sendClearCacheRequest(id).finally(() => {
                    Icons.getIcon('actions-system-cache-clear', Icons.sizes.small).then((icon) => {
                        me.querySelector(Identifiers.icon).outerHTML = icon;
                    });
                    ClearCache.setDisabled(me, false);
                });
            }).bindTo(trigger);
        }
    }
}
var ClearCache$1 = new ClearCache();

export default ClearCache$1;
