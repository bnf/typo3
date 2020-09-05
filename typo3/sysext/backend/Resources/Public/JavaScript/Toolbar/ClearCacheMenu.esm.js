import $ from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../Icons.esm.js';
import NotificationService from '../Notification.esm.js';
import Viewport from '../Viewport.esm.js';

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
    Identifiers["containerSelector"] = "#typo3-cms-backend-backend-toolbaritems-clearcachetoolbaritem";
    Identifiers["menuItemSelector"] = "a.toolbar-cache-flush-action";
    Identifiers["toolbarIconSelector"] = ".toolbar-item-icon .t3js-icon";
})(Identifiers || (Identifiers = {}));
/**
 * Module: TYPO3/CMS/Backend/Toolbar/ClearCacheMenu
 * main functionality for clearing caches via the top bar
 * reloading the clear cache icon
 */
class ClearCacheMenu {
    constructor() {
        /**
         * Registers listeners for the icons inside the dropdown to trigger
         * the clear cache call
         */
        this.initializeEvents = () => {
            $(Identifiers.containerSelector).on('click', Identifiers.menuItemSelector, (evt) => {
                evt.preventDefault();
                const ajaxUrl = $(evt.currentTarget).attr('href');
                if (ajaxUrl) {
                    this.clearCache(ajaxUrl);
                }
            });
        };
        Viewport.Topbar.Toolbar.registerEvent(this.initializeEvents);
    }
    /**
     * Calls TYPO3 to clear a cache, then changes the topbar icon
     * to a spinner. Restores the original topbar icon when the request completed.
     *
     * @param {string} ajaxUrl The URL to load
     */
    clearCache(ajaxUrl) {
        // Close clear cache menu
        $(Identifiers.containerSelector).removeClass('open');
        const $toolbarItemIcon = $(Identifiers.toolbarIconSelector, Identifiers.containerSelector);
        const $existingIcon = $toolbarItemIcon.clone();
        Icons.getIcon('spinner-circle-light', Icons.sizes.small).then((spinner) => {
            $toolbarItemIcon.replaceWith(spinner);
        });
        (new AjaxRequest(ajaxUrl)).post({}).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                NotificationService.success(data.title, data.message);
            }
            else if (data.success === false) {
                NotificationService.error(data.title, data.message);
            }
        }, () => {
            NotificationService.error(TYPO3.lang['flushCaches.error'], TYPO3.lang['flushCaches.error.description']);
        }).finally(() => {
            $(Identifiers.toolbarIconSelector, Identifiers.containerSelector).replaceWith($existingIcon);
        });
    }
}
var ClearCacheMenu$1 = new ClearCacheMenu();

export default ClearCacheMenu$1;
