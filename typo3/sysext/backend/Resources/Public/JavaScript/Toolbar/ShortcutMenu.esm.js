import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../Icons.esm.js';
import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from '../Modal.esm.js';
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
    Identifiers["containerSelector"] = "#typo3-cms-backend-backend-toolbaritems-shortcuttoolbaritem";
    Identifiers["toolbarIconSelector"] = ".dropdown-toggle span.icon";
    Identifiers["toolbarMenuSelector"] = ".dropdown-menu";
    Identifiers["shortcutItemSelector"] = ".t3js-topbar-shortcut";
    Identifiers["shortcutDeleteSelector"] = ".t3js-shortcut-delete";
    Identifiers["shortcutEditSelector"] = ".t3js-shortcut-edit";
    Identifiers["shortcutFormTitleSelector"] = "input[name=\"shortcut-title\"]";
    Identifiers["shortcutFormGroupSelector"] = "select[name=\"shortcut-group\"]";
    Identifiers["shortcutFormSaveSelector"] = ".shortcut-form-save";
    Identifiers["shortcutFormCancelSelector"] = ".shortcut-form-cancel";
    Identifiers["shortcutFormSelector"] = ".shortcut-form";
})(Identifiers || (Identifiers = {}));
/**
 * Module =TYPO3/CMS/Backend/Toolbar/ShortcutMenu
 * shortcut menu logic to add new shortcut, remove a shortcut
 * and edit a shortcut
 */
class ShortcutMenu {
    constructor() {
        this.initializeEvents = () => {
            jQuery(Identifiers.containerSelector).on('click', Identifiers.shortcutDeleteSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.deleteShortcut(jQuery(evt.currentTarget).closest(Identifiers.shortcutItemSelector));
            }).on('click', Identifiers.shortcutFormGroupSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }).on('click', Identifiers.shortcutEditSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.editShortcut(jQuery(evt.currentTarget).closest(Identifiers.shortcutItemSelector));
            }).on('click', Identifiers.shortcutFormSaveSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.saveShortcutForm(jQuery(evt.currentTarget).closest(Identifiers.shortcutFormSelector));
            }).on('submit', Identifiers.shortcutFormSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.saveShortcutForm(jQuery(evt.currentTarget).closest(Identifiers.shortcutFormSelector));
            }).on('click', Identifiers.shortcutFormCancelSelector, (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.refreshMenu();
            });
        };
        Viewport.Topbar.Toolbar.registerEvent(this.initializeEvents);
    }
    /**
     * makes a call to the backend class to create a new shortcut,
     * when finished it reloads the menu
     *
     * @param {String} moduleName
     * @param {String} url
     * @param {String} confirmationText
     * @param {String} motherModule
     * @param {Object} shortcutButton
     * @param {String} displayName
     */
    createShortcut(moduleName, url, confirmationText, motherModule, shortcutButton, displayName) {
        if (typeof confirmationText !== 'undefined') {
            Modal.confirm(TYPO3.lang['bookmark.create'], confirmationText).on('confirm.button.ok', (e) => {
                const $toolbarItemIcon = jQuery(Identifiers.toolbarIconSelector, Identifiers.containerSelector);
                const $existingIcon = $toolbarItemIcon.clone();
                Icons.getIcon('spinner-circle-light', Icons.sizes.small).then((spinner) => {
                    $toolbarItemIcon.replaceWith(spinner);
                });
                (new AjaxRequest(TYPO3.settings.ajaxUrls.shortcut_create)).post({
                    module: moduleName,
                    url: url,
                    motherModName: motherModule,
                    displayName: displayName,
                }).then(() => {
                    this.refreshMenu();
                    jQuery(Identifiers.toolbarIconSelector, Identifiers.containerSelector).replaceWith($existingIcon);
                    if (typeof shortcutButton === 'object') {
                        Icons.getIcon('actions-system-shortcut-active', Icons.sizes.small).then((icon) => {
                            jQuery(shortcutButton).html(icon);
                        });
                        jQuery(shortcutButton).addClass('active');
                        jQuery(shortcutButton).attr('title', null);
                        jQuery(shortcutButton).attr('onclick', null);
                    }
                });
                jQuery(e.currentTarget).trigger('modal-dismiss');
            })
                .on('confirm.button.cancel', (e) => {
                jQuery(e.currentTarget).trigger('modal-dismiss');
            });
        }
    }
    /**
     * Removes an existing short by sending an AJAX call
     *
     * @param {JQuery} $shortcutRecord
     */
    deleteShortcut($shortcutRecord) {
        Modal.confirm(TYPO3.lang['bookmark.delete'], TYPO3.lang['bookmark.confirmDelete'])
            .on('confirm.button.ok', (e) => {
            (new AjaxRequest(TYPO3.settings.ajaxUrls.shortcut_remove)).post({
                shortcutId: $shortcutRecord.data('shortcutid'),
            }).then(() => {
                // a reload is used in order to restore the original behaviour
                // e.g. remove groups that are now empty because the last one in the group
                // was removed
                this.refreshMenu();
            });
            jQuery(e.currentTarget).trigger('modal-dismiss');
        })
            .on('confirm.button.cancel', (e) => {
            jQuery(e.currentTarget).trigger('modal-dismiss');
        });
    }
    /**
     * Build the in-place-editor for a shortcut
     *
     * @param {JQuery} $shortcutRecord
     */
    editShortcut($shortcutRecord) {
        // load the form
        (new AjaxRequest(TYPO3.settings.ajaxUrls.shortcut_editform)).withQueryArguments({
            shortcutId: $shortcutRecord.data('shortcutid'),
            shortcutGroup: $shortcutRecord.data('shortcutgroup'),
        }).get({ cache: 'no-cache' }).then(async (response) => {
            jQuery(Identifiers.containerSelector).find(Identifiers.toolbarMenuSelector).html(await response.resolve());
        });
    }
    /**
     * Save the data from the in-place-editor for a shortcut
     *
     * @param {JQuery} $shortcutForm
     */
    saveShortcutForm($shortcutForm) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.shortcut_saveform)).post({
            shortcutId: $shortcutForm.data('shortcutid'),
            shortcutTitle: $shortcutForm.find(Identifiers.shortcutFormTitleSelector).val(),
            shortcutGroup: $shortcutForm.find(Identifiers.shortcutFormGroupSelector).val(),
        }).then(() => {
            NotificationService.success(TYPO3.lang['bookmark.savedTitle'], TYPO3.lang['bookmark.savedMessage']);
            this.refreshMenu();
        });
    }
    /**
     * Reloads the menu after an update
     */
    refreshMenu() {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.shortcut_list)).get({ cache: 'no-cache' }).then(async (response) => {
            jQuery(Identifiers.toolbarMenuSelector, Identifiers.containerSelector).html(await response.resolve());
        });
    }
}
let shortcutMenuObject = new ShortcutMenu();
TYPO3.ShortcutMenu = shortcutMenuObject;

export default shortcutMenuObject;
