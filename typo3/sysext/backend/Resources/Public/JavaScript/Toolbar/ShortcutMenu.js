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
define(["jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","../Icons","../Modal","../Notification","../Viewport"],(function(t,e,o,r,c,s){"use strict";var a;!function(t){t.containerSelector="#typo3-cms-backend-backend-toolbaritems-shortcuttoolbaritem",t.toolbarIconSelector=".dropdown-toggle span.icon",t.toolbarMenuSelector=".dropdown-menu",t.shortcutItemSelector=".t3js-topbar-shortcut",t.shortcutDeleteSelector=".t3js-shortcut-delete",t.shortcutEditSelector=".t3js-shortcut-edit",t.shortcutFormTitleSelector='input[name="shortcut-title"]',t.shortcutFormGroupSelector='select[name="shortcut-group"]',t.shortcutFormSaveSelector=".shortcut-form-save",t.shortcutFormCancelSelector=".shortcut-form-cancel",t.shortcutFormSelector=".shortcut-form"}(a||(a={}));let n=new class{constructor(){this.initializeEvents=()=>{t(a.containerSelector).on("click",a.shortcutDeleteSelector,e=>{e.preventDefault(),e.stopImmediatePropagation(),this.deleteShortcut(t(e.currentTarget).closest(a.shortcutItemSelector))}).on("click",a.shortcutFormGroupSelector,t=>{t.preventDefault(),t.stopImmediatePropagation()}).on("click",a.shortcutEditSelector,e=>{e.preventDefault(),e.stopImmediatePropagation(),this.editShortcut(t(e.currentTarget).closest(a.shortcutItemSelector))}).on("click",a.shortcutFormSaveSelector,e=>{e.preventDefault(),e.stopImmediatePropagation(),this.saveShortcutForm(t(e.currentTarget).closest(a.shortcutFormSelector))}).on("submit",a.shortcutFormSelector,e=>{e.preventDefault(),e.stopImmediatePropagation(),this.saveShortcutForm(t(e.currentTarget).closest(a.shortcutFormSelector))}).on("click",a.shortcutFormCancelSelector,t=>{t.preventDefault(),t.stopImmediatePropagation(),this.refreshMenu()})},s.Topbar.Toolbar.registerEvent(this.initializeEvents)}createShortcut(c,s,n,l,i){void 0!==l&&r.confirm(TYPO3.lang["bookmark.create"],l).on("confirm.button.ok",r=>{const l=t(a.toolbarIconSelector,a.containerSelector),u=l.clone();o.getIcon("spinner-circle-light",o.sizes.small).then(t=>{l.replaceWith(t)}),new e(TYPO3.settings.ajaxUrls.shortcut_create).post({routeIdentifier:c,arguments:s,displayName:n}).then(()=>{this.refreshMenu(),t(a.toolbarIconSelector,a.containerSelector).replaceWith(u),"object"==typeof i&&(o.getIcon("actions-system-shortcut-active",o.sizes.small).then(e=>{t(i).html(e)}),t(i).addClass("active"),t(i).attr("title",null),t(i).attr("onclick",null))}),t(r.currentTarget).trigger("modal-dismiss")}).on("confirm.button.cancel",e=>{t(e.currentTarget).trigger("modal-dismiss")})}deleteShortcut(o){r.confirm(TYPO3.lang["bookmark.delete"],TYPO3.lang["bookmark.confirmDelete"]).on("confirm.button.ok",r=>{new e(TYPO3.settings.ajaxUrls.shortcut_remove).post({shortcutId:o.data("shortcutid")}).then(()=>{this.refreshMenu()}),t(r.currentTarget).trigger("modal-dismiss")}).on("confirm.button.cancel",e=>{t(e.currentTarget).trigger("modal-dismiss")})}editShortcut(o){new e(TYPO3.settings.ajaxUrls.shortcut_editform).withQueryArguments({shortcutId:o.data("shortcutid"),shortcutGroup:o.data("shortcutgroup")}).get({cache:"no-cache"}).then(async e=>{t(a.containerSelector).find(a.toolbarMenuSelector).html(await e.resolve())})}saveShortcutForm(t){new e(TYPO3.settings.ajaxUrls.shortcut_saveform).post({shortcutId:t.data("shortcutid"),shortcutTitle:t.find(a.shortcutFormTitleSelector).val(),shortcutGroup:t.find(a.shortcutFormGroupSelector).val()}).then(()=>{c.success(TYPO3.lang["bookmark.savedTitle"],TYPO3.lang["bookmark.savedMessage"]),this.refreshMenu()})}refreshMenu(){new e(TYPO3.settings.ajaxUrls.shortcut_list).get({cache:"no-cache"}).then(async e=>{t(a.toolbarMenuSelector,a.containerSelector).html(await e.resolve())})}};return TYPO3.ShortcutMenu=n,n}));