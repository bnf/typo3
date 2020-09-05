import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../../../../../backend/Resources/Public/JavaScript/Icons.esm.js';
import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Viewport from '../../../../../backend/Resources/Public/JavaScript/Viewport.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["containerSelector"] = "#typo3-cms-opendocs-backend-toolbaritems-opendocstoolbaritem";
    Selectors["closeSelector"] = ".t3js-topbar-opendocs-close";
    Selectors["menuContainerSelector"] = ".dropdown-menu";
    Selectors["toolbarIconSelector"] = ".toolbar-item-icon .t3js-icon";
    Selectors["openDocumentsItemsSelector"] = ".t3js-topbar-opendocs-item";
    Selectors["counterSelector"] = "#tx-opendocs-counter";
    Selectors["entrySelector"] = ".t3js-open-doc";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Opendocs/OpendocsMenu
 * main JS part taking care of
 *  - navigating to the documents
 *  - updating the menu
 */
class OpendocsMenu {
    constructor() {
        this.hashDataAttributeName = 'opendocsidentifier';
        /**
         * closes the menu (e.g. when clicked on an item)
         */
        this.toggleMenu = () => {
            jQuery('.scaffold').removeClass('scaffold-toolbar-expanded');
            jQuery(Selectors.containerSelector).toggleClass('open');
        };
        Viewport.Topbar.Toolbar.registerEvent(() => {
            this.initializeEvents();
            this.updateMenu();
        });
    }
    /**
     * Updates the number of open documents in the toolbar according to the
     * number of items in the menu bar.
     */
    static updateNumberOfDocs() {
        const num = jQuery(Selectors.containerSelector).find(Selectors.openDocumentsItemsSelector).length;
        jQuery(Selectors.counterSelector).text(num).toggle(num > 0);
    }
    /**
     * Displays the menu and does the AJAX call to the TYPO3 backend
     */
    updateMenu() {
        let $toolbarItemIcon = jQuery(Selectors.toolbarIconSelector, Selectors.containerSelector);
        let $existingIcon = $toolbarItemIcon.clone();
        Icons.getIcon('spinner-circle-light', Icons.sizes.small).done((spinner) => {
            $toolbarItemIcon.replaceWith(spinner);
        });
        (new AjaxRequest(TYPO3.settings.ajaxUrls.opendocs_menu)).get().then(async (response) => {
            jQuery(Selectors.containerSelector).find(Selectors.menuContainerSelector).html(await response.resolve());
            OpendocsMenu.updateNumberOfDocs();
        }).finally(() => {
            // Re-open the menu after closing a document
            jQuery(Selectors.toolbarIconSelector, Selectors.containerSelector).replaceWith($existingIcon);
        });
    }
    initializeEvents() {
        // send a request when removing an opendoc
        jQuery(Selectors.containerSelector).on('click', Selectors.closeSelector, (evt) => {
            evt.preventDefault();
            const md5 = jQuery(evt.currentTarget).data(this.hashDataAttributeName);
            this.closeDocument(md5);
        }).on('click', Selectors.entrySelector, (evt) => {
            evt.preventDefault();
            const $entry = jQuery(evt.currentTarget);
            this.toggleMenu();
            window.jump($entry.attr('href'), 'web_list', 'web', $entry.data('pid'));
        });
    }
    /**
     * Closes an open document
     */
    closeDocument(md5sum) {
        const payload = {};
        if (md5sum) {
            payload.md5sum = md5sum;
        }
        (new AjaxRequest(TYPO3.settings.ajaxUrls.opendocs_closedoc)).post(payload).then(async (response) => {
            jQuery(Selectors.menuContainerSelector, Selectors.containerSelector).html(await response.resolve());
            OpendocsMenu.updateNumberOfDocs();
            // Re-open the menu after closing a document
            jQuery(Selectors.containerSelector).toggleClass('open');
        });
    }
}
let opendocsMenuObject;
opendocsMenuObject = new OpendocsMenu();
if (typeof TYPO3 !== 'undefined') {
    TYPO3.OpendocsMenu = opendocsMenuObject;
}
var opendocsMenuObject$1 = opendocsMenuObject;

export default opendocsMenuObject$1;
