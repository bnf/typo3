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
import"bootstrap"
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/modal.js"
import n from"@typo3/backend/notification.js"
import o from"@typo3/core/ajax/ajax-request.js"
import{InfoBox as s}from"@typo3/install/renderable/info-box.js"
import a from"@typo3/install/renderable/severity.js"
import i from"@typo3/install/router.js"
import r from"@typo3/core/event/regular-event.js"
var l
!function(e){e.checkTrigger=".t3js-extensionCompatTester-check",e.uninstallTrigger=".t3js-extensionCompatTester-uninstall",e.outputContainer=".t3js-extensionCompatTester-output"}(l||(l={}))
export default new class extends e{initialize(e){super.initialize(e),this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js").then((()=>{this.getLoadedExtensionList()})),new r("click",(()=>{this.findInModal(l.uninstallTrigger)?.classList?.add("hidden")
const e=this.findInModal(l.outputContainer)
e&&(e.innerHTML=""),this.getLoadedExtensionList()})).delegateTo(e,l.checkTrigger),new r("click",((e,t)=>{this.uninstallExtension(t.dataset.extension)})).delegateTo(e,l.uninstallTrigger)}getLoadedExtensionList(){this.setModalButtonsState(!1)
const e=this.getModalBody(),r=this.findInModal(l.outputContainer)
r&&this.renderProgressBar(r,{},"append"),new o(i.getUrl("extensionCompatTesterLoadedExtensionList")).get({cache:"no-cache"}).then((async o=>{const i=await o.resolve()
e.innerHTML=i.html,t.setButtons(i.buttons)
const r=this.findInModal(l.outputContainer)
this.renderProgressBar(r,{},"append"),!0===i.success?this.loadExtLocalconf().then((()=>{r.append(s.create(a.ok,"ext_localconf.php of all loaded extensions successfully loaded")),this.loadExtTables().then((()=>{r.append(s.create(a.ok,"ext_tables.php of all loaded extensions successfully loaded"))}),(async e=>{this.renderFailureMessages("ext_tables.php",(await e.response.json()).brokenExtensions,r)})).finally((()=>{this.unlockModal()}))}),(async e=>{this.renderFailureMessages("ext_localconf.php",(await e.response.json()).brokenExtensions,r),r.append(s.create(a.notice,"Skipped scanning ext_tables.php files due to previous errors")),this.unlockModal()})):(n.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log."),this.unlockModal())}),(t=>{i.handleAjaxError(t,e),this.unlockModal()}))}unlockModal(){this.findInModal(l.outputContainer)?.querySelector("typo3-backend-progress-bar")?.remove(),this.setModalButtonsState(!0)}renderFailureMessages(e,t,n){for(const o of t){let i
o.isProtected||((i=document.createElement("button")).classList.add("btn","btn-danger","t3js-extensionCompatTester-uninstall"),i.dataset.extension=o.name,i.innerText='Uninstall extension "'+o.name+'"'),n.append(s.create(a.error,"Loading "+e+' of extension "'+o.name+'" failed',o.isProtected?"Extension is mandatory and cannot be uninstalled.":""),i)}this.unlockModal()}loadExtLocalconf(){const e=this.getModuleContent().dataset.extensionCompatTesterLoadExt_localconfToken
return new o(i.getUrl()).post({install:{action:"extensionCompatTesterLoadExtLocalconf",token:e}})}loadExtTables(){const e=this.getModuleContent().dataset.extensionCompatTesterLoadExt_tablesToken
return new o(i.getUrl()).post({install:{action:"extensionCompatTesterLoadExtTables",token:e}})}uninstallExtension(e){const t=this.getModuleContent().dataset.extensionCompatTesterUninstallExtensionToken,a=this.getModalBody(),r=this.findInModal(l.outputContainer)
this.renderProgressBar(r,{},"append"),new o(i.getUrl()).post({install:{action:"extensionCompatTesterUninstallExtension",token:t,extension:e}}).then((async e=>{const t=await e.resolve()
t.success?(Array.isArray(t.status)&&t.status.forEach((e=>{a.querySelector(l.outputContainer).replaceChildren(s.create(e.severity,e.title,e.message))})),this.findInModal(l.uninstallTrigger).classList.add("hidden"),this.getLoadedExtensionList()):n.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{i.handleAjaxError(e,a)}))}}
