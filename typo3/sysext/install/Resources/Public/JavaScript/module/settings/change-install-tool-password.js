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
import t from"@typo3/backend/modal.js";import s from"@typo3/backend/notification.js";import e from"@typo3/core/ajax/ajax-request.js";import o from"@typo3/install/router.js";import a from"@typo3/install/module/password-strength.js";import{AbstractInteractableModule as n}from"@typo3/install/module/abstract-interactable-module.js";import l from"@typo3/core/event/regular-event.js";var r;!function(t){t.changeButton=".t3js-changeInstallToolPassword-change"}(r||(r={}));export default new class extends n{initialize(t){super.initialize(t),this.getData(),new l("click",(t=>{t.preventDefault(),this.change()})).delegateTo(t,r.changeButton)}getData(){const n=this.getModalBody();new e(o.getUrl("changeInstallToolPasswordGetData")).get({cache:"no-cache"}).then((async e=>{const o=await e.resolve();!0===o.success?(n.innerHTML=o.html,a.initialize(n.querySelector(".t3-install-form-password-strength")),t.setButtons(o.buttons)):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{o.handleAjaxError(t,n)}))}change(){this.setModalButtonsState(!1);const t=this.getModalBody(),a=this.getModuleContent().dataset.installToolToken;new e(o.getUrl()).post({install:{action:"changeInstallToolPassword",token:a,password:this.findInModal(".t3js-changeInstallToolPassword-password").value,passwordCheck:this.findInModal(".t3js-changeInstallToolPassword-password-check").value}}).then((async t=>{const e=await t.resolve();!0===e.success&&Array.isArray(e.status)?e.status.forEach((t=>{s.showMessage(t.title,t.message,t.severity)})):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(s=>{o.handleAjaxError(s,t)})).finally((()=>{this.findInModal(".t3js-changeInstallToolPassword-password").value="",this.findInModal(".t3js-changeInstallToolPassword-password-check").value="",this.setModalButtonsState(!0)}))}};