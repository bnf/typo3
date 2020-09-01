define(['jquery', '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../Icons', '../Notification', '../Viewport'], function ($, AjaxRequest, Icons, Notification, Viewport) { 'use strict';

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
                $__default['default'](Identifiers.containerSelector).on('click', Identifiers.menuItemSelector, (evt) => {
                    evt.preventDefault();
                    const ajaxUrl = $__default['default'](evt.currentTarget).attr('href');
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
            $__default['default'](Identifiers.containerSelector).removeClass('open');
            const $toolbarItemIcon = $__default['default'](Identifiers.toolbarIconSelector, Identifiers.containerSelector);
            const $existingIcon = $toolbarItemIcon.clone();
            Icons.getIcon('spinner-circle-light', Icons.sizes.small).then((spinner) => {
                $toolbarItemIcon.replaceWith(spinner);
            });
            (new AjaxRequest(ajaxUrl)).post({}).then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    Notification.success(data.title, data.message);
                }
                else if (data.success === false) {
                    Notification.error(data.title, data.message);
                }
            }, () => {
                Notification.error(TYPO3.lang['flushCaches.error'], TYPO3.lang['flushCaches.error.description']);
            }).finally(() => {
                $__default['default'](Identifiers.toolbarIconSelector, Identifiers.containerSelector).replaceWith($existingIcon);
            });
        }
    }
    var ClearCacheMenu$1 = new ClearCacheMenu();

    return ClearCacheMenu$1;

});
