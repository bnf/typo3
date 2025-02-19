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
import"bootstrap";import{AbstractInteractableModule as t}from"@typo3/install/module/abstract-interactable-module.js";import e from"@typo3/backend/modal.js";import s from"@typo3/backend/notification.js";import r from"@typo3/core/ajax/ajax-request.js";import a from"@typo3/install/router.js";import o from"@typo3/core/event/regular-event.js";var i;!function(t){t.writeTrigger=".t3js-systemMaintainer-write",t.selectPureField=".t3js-systemMaintainer-select-pure"}(i||(i={}));var n=new class extends t{initialize(t){super.initialize(t),this.loadModuleFrameAgnostic("select-pure").then((()=>{this.getList()})),new o("click",(t=>{t.preventDefault(),this.write()})).delegateTo(t,i.writeTrigger)}getList(){const t=this.getModalBody();new r(a.getUrl("systemMaintainerGetList")).get({cache:"no-cache"}).then((async s=>{const r=await s.resolve();!0===r.success&&(t.innerHTML=r.html,e.setButtons(r.buttons))}),(e=>{a.handleAjaxError(e,t)}))}write(){this.setModalButtonsState(!1);const t=this.getModalBody(),e=this.getModuleContent().dataset.systemMaintainerWriteToken,o=this.findInModal(i.selectPureField).values;new r(a.getUrl()).post({install:{users:o,token:e,action:"systemMaintainerWrite"}}).then((async t=>{const e=await t.resolve();!0===e.success?Array.isArray(e.status)&&e.status.forEach((t=>{s.success(t.title,t.message)})):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{a.handleAjaxError(e,t)})).finally((()=>{this.setModalButtonsState(!0)}))}};export{n as default};