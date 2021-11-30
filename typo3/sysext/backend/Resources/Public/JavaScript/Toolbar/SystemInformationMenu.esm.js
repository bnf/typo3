import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../Icons.esm.js';
import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Viewport from '../Viewport.esm.js';
import Persistent from '../Storage/Persistent.esm.js';

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
    Identifiers["containerSelector"] = "#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem";
    Identifiers["toolbarIconSelector"] = ".toolbar-item-icon .t3js-icon";
    Identifiers["menuContainerSelector"] = ".dropdown-menu";
    Identifiers["moduleLinks"] = ".t3js-systeminformation-module";
    Identifiers["counter"] = ".t3js-systeminformation-counter";
})(Identifiers || (Identifiers = {}));
/**
 * Module: TYPO3/CMS/Backend/Toolbar/SystemInformationMenu
 * System information menu handler
 */
class SystemInformationMenu {
    constructor() {
        this.timer = null;
        this.updateMenu = () => {
            const $toolbarItemIcon = jQuery(Identifiers.toolbarIconSelector, Identifiers.containerSelector);
            const $existingIcon = $toolbarItemIcon.clone();
            const $menuContainer = jQuery(Identifiers.containerSelector).find(Identifiers.menuContainerSelector);
            if (this.timer !== null) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            Icons.getIcon('spinner-circle-light', Icons.sizes.small).then((spinner) => {
                $toolbarItemIcon.replaceWith(spinner);
            });
            (new AjaxRequest(TYPO3.settings.ajaxUrls.systeminformation_render)).get().then(async (response) => {
                $menuContainer.html(await response.resolve());
                SystemInformationMenu.updateCounter();
                jQuery(Identifiers.moduleLinks).on('click', this.openModule);
            }).finally(() => {
                jQuery(Identifiers.toolbarIconSelector, Identifiers.containerSelector).replaceWith($existingIcon);
                // reload error data every five minutes
                this.timer = setTimeout(this.updateMenu, 1000 * 300);
            });
        };
        Viewport.Topbar.Toolbar.registerEvent(this.updateMenu);
    }
    /**
     * Updates the counter
     */
    static updateCounter() {
        const $container = jQuery(Identifiers.containerSelector).find(Identifiers.menuContainerSelector).find('.t3js-systeminformation-container');
        const $counter = jQuery(Identifiers.counter);
        const count = $container.data('count');
        const badgeClass = $container.data('severityclass');
        $counter.text(count).toggle(parseInt(count, 10) > 0);
        // ensure all default classes are available and previous
        // (at this time in processing unknown) class is removed
        $counter.removeClass();
        $counter.addClass('t3js-systeminformation-counter toolbar-item-badge badge rounded-pill');
        // badgeClass e.g. could be 'badge-info', 'badge-danger', ...
        if (badgeClass !== '') {
            $counter.addClass(badgeClass);
        }
    }
    /**
     * Updates the UC and opens the linked module
     *
     * @param {Event} e
     */
    openModule(e) {
        e.preventDefault();
        e.stopPropagation();
        let storedSystemInformationSettings = {};
        const moduleStorageObject = {};
        const requestedModule = jQuery(e.currentTarget).data('modulename');
        const moduleParams = jQuery(e.currentTarget).data('moduleparams');
        const timestamp = Math.floor((new Date()).getTime() / 1000);
        if (Persistent.isset('systeminformation')) {
            storedSystemInformationSettings = JSON.parse(Persistent.get('systeminformation'));
        }
        moduleStorageObject[requestedModule] = { lastAccess: timestamp };
        jQuery.extend(true, storedSystemInformationSettings, moduleStorageObject);
        const $ajax = Persistent.set('systeminformation', JSON.stringify(storedSystemInformationSettings));
        $ajax.done(() => {
            // finally, open the module now
            TYPO3.ModuleMenu.App.showModule(requestedModule, moduleParams);
            Viewport.Topbar.refresh();
        });
    }
}
var SystemInformationMenu$1 = new SystemInformationMenu();

export default SystemInformationMenu$1;
