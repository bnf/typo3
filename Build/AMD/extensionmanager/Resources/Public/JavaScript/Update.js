define(['../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../backend/Resources/Public/JavaScript/Notification', '../../../../core/Resources/Public/JavaScript/Contrib/nprogress'], function (AjaxRequest, jquery, Notification, nprogress) { 'use strict';

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
    var ExtensionManagerUpdateIdentifier;
    (function (ExtensionManagerUpdateIdentifier) {
        ExtensionManagerUpdateIdentifier["extensionTable"] = "#terTable";
        ExtensionManagerUpdateIdentifier["terUpdateAction"] = ".update-from-ter";
        ExtensionManagerUpdateIdentifier["pagination"] = ".pagination-wrap";
        ExtensionManagerUpdateIdentifier["splashscreen"] = ".splash-receivedata";
        ExtensionManagerUpdateIdentifier["terTableWrapper"] = "#terTableWrapper .table";
    })(ExtensionManagerUpdateIdentifier || (ExtensionManagerUpdateIdentifier = {}));
    class ExtensionManagerUpdate {
        /**
         * Register "update from ter" action
         */
        initializeEvents() {
            jquery(ExtensionManagerUpdateIdentifier.terUpdateAction).each((index, element) => {
                // "this" is the form which updates the extension list from
                // TER on submit
                const $me = jquery(element);
                const updateURL = $me.attr('action');
                $me.attr('action', '#');
                $me.on('submit', () => {
                    // Force update on click.
                    this.updateFromTer(updateURL, true);
                    // Prevent normal submit action.
                    return false;
                });
                // This might give problems when there are more "update"-buttons,
                // each one would trigger a TER-this.
                this.updateFromTer(updateURL, false);
            });
        }
        updateFromTer(url, forceUpdate) {
            if (forceUpdate) {
                url = url + '&tx_extensionmanager_tools_extensionmanagerextensionmanager%5BforceUpdateCheck%5D=1';
            }
            // Hide triggers for TER update
            jquery(ExtensionManagerUpdateIdentifier.terUpdateAction).addClass('extensionmanager-is-hidden');
            // Hide extension table
            jquery(ExtensionManagerUpdateIdentifier.extensionTable).hide();
            // Show loaders
            jquery(ExtensionManagerUpdateIdentifier.splashscreen).addClass('extensionmanager-is-shown');
            jquery(ExtensionManagerUpdateIdentifier.terTableWrapper).addClass('extensionmanager-is-loading');
            jquery(ExtensionManagerUpdateIdentifier.pagination).addClass('extensionmanager-is-loading');
            let reload = false;
            nprogress.start();
            new AjaxRequest(url).get().then(async (response) => {
                const data = await response.resolve();
                // Something went wrong, show message
                if (data.errorMessage.length) {
                    Notification.error(TYPO3.lang['extensionList.updateFromTerFlashMessage.title'], data.errorMessage, 10);
                }
                // Message with latest updates
                const $lastUpdate = jquery(ExtensionManagerUpdateIdentifier.terUpdateAction + ' .extension-list-last-updated');
                $lastUpdate.text(data.timeSinceLastUpdate);
                $lastUpdate.attr('title', TYPO3.lang['extensionList.updateFromTer.lastUpdate.timeOfLastUpdate'] + data.lastUpdateTime);
                if (data.updated) {
                    // Reload page
                    reload = true;
                    window.location.replace(window.location.href);
                }
            }, async (error) => {
                // Create an error message with diagnosis info.
                const errorMessage = error.response.statusText + '(' + error.response.status + '): ' + await error.response.text();
                Notification.warning(TYPO3.lang['extensionList.updateFromTerFlashMessage.title'], errorMessage, 10);
            }).finally(() => {
                nprogress.done();
                if (!reload) {
                    // Hide loaders
                    jquery(ExtensionManagerUpdateIdentifier.splashscreen).removeClass('extensionmanager-is-shown');
                    jquery(ExtensionManagerUpdateIdentifier.terTableWrapper).removeClass('extensionmanager-is-loading');
                    jquery(ExtensionManagerUpdateIdentifier.pagination).removeClass('extensionmanager-is-loading');
                    // Show triggers for TER-update
                    jquery(ExtensionManagerUpdateIdentifier.terUpdateAction).removeClass('extensionmanager-is-hidden');
                    // Show extension table
                    jquery(ExtensionManagerUpdateIdentifier.extensionTable).show();
                }
            });
        }
    }

    return ExtensionManagerUpdate;

});
