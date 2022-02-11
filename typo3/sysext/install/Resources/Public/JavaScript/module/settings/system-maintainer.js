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
import"bootstrap";import $ from"jquery";import{AbstractInteractableModule}from"@typo3/install/module/abstract-interactable-module.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";import Modal from"@typo3/backend/modal.js";import Notification from"@typo3/backend/notification.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Router from"@typo3/install/router.js";class SystemMaintainer extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorWriteTrigger=".t3js-systemMaintainer-write",this.selectorChosenContainer=".t3js-systemMaintainer-chosen",this.selectorChosenField=".t3js-systemMaintainer-chosen-select"}initialize(t){this.currentModal=t;window.location!==window.parent.location?topLevelModuleImport("TYPO3/CMS/Install/chosen.jquery.min.js").then(()=>{this.getList()}):import("@typo3/install/chosen.jquery.min.js").then(()=>{this.getList()}),t.on("click",this.selectorWriteTrigger,t=>{t.preventDefault(),this.write()})}getList(){const t=this.getModalBody();new AjaxRequest(Router.getUrl("systemMaintainerGetList")).get({cache:"no-cache"}).then(async e=>{const s=await e.resolve();if(!0===s.success){t.html(s.html),Modal.setButtons(s.buttons),Array.isArray(s.users)&&s.users.forEach(e=>{let s=e.username;e.disable&&(s="[DISABLED] "+s);const o=$("<option>",{value:e.uid}).text(s);e.isSystemMaintainer&&o.attr("selected","selected"),t.find(this.selectorChosenField).append(o)});const e={".t3js-systemMaintainer-chosen-select":{width:"100%",placeholder_text_multiple:"users"}};for(const s in e)e.hasOwnProperty(s)&&t.find(s).chosen(e[s]);t.find(this.selectorChosenContainer).show(),t.find(this.selectorChosenField).trigger("chosen:updated")}},e=>{Router.handleAjaxError(e,t)})}write(){this.setModalButtonsState(!1);const t=this.getModalBody(),e=this.getModuleContent().data("system-maintainer-write-token"),s=this.findInModal(this.selectorChosenField).val();new AjaxRequest(Router.getUrl()).post({install:{users:s,token:e,action:"systemMaintainerWrite"}}).then(async t=>{const e=await t.resolve();!0===e.success?Array.isArray(e.status)&&e.status.forEach(t=>{Notification.success(t.title,t.message)}):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{Router.handleAjaxError(e,t)}).finally(()=>{this.setModalButtonsState(!0)})}}export default new SystemMaintainer;