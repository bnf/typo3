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
import t from"@typo3/backend/notification.js"
import s from"@typo3/core/ajax/ajax-request.js"
import a from"@typo3/core/security-utility.js"
import{FlashMessage as r}from"@typo3/install/renderable/flash-message.js"
import{InfoBox as i}from"@typo3/install/renderable/info-box.js"
import o from"@typo3/install/renderable/severity.js"
import n from"@typo3/install/router.js"
import d from"@typo3/core/event/regular-event.js"
var l
!function(e){e.outputWizardsContainer=".t3js-upgradeWizards-wizards-output",e.outputMessagesContainer=".t3js-upgradeWizards-wizards-messages-output",e.outputDoneContainer=".t3js-upgradeWizards-done-output",e.wizardsBlockingAddsTemplate="#t3js-upgradeWizards-blocking-adds-template",e.wizardsBlockingAddsRows=".t3js-upgradeWizards-blocking-adds-rows",e.wizardsBlockingAddsExecute=".t3js-upgradeWizards-blocking-adds-execute",e.wizardsBlockingCharsetTemplate="#t3js-upgradeWizards-blocking-charset-template",e.wizardsBlockingCharsetFix=".t3js-upgradeWizards-blocking-charset-fix",e.wizardsDoneBodyTemplate="#t3js-upgradeWizards-done-body-template",e.wizardsDoneRows=".t3js-upgradeWizards-done-rows",e.wizardsDoneRowTemplate="#t3js-upgradeWizards-done-row-template",e.wizardsDoneRowMarkUndone=".t3js-upgradeWizards-done-markUndone",e.wizardsDoneRowTitle=".t3js-upgradeWizards-done-title",e.wizardsListTemplate="#t3js-upgradeWizards-list-template",e.wizardsListRows=".t3js-upgradeWizards-list-rows",e.wizardsListRowTemplate="#t3js-upgradeWizards-list-row-template",e.wizardsListRowTitle=".t3js-upgradeWizards-list-row-title",e.wizardsListRowExplanation=".t3js-upgradeWizards-list-row-explanation",e.wizardsListRowExecute=".t3js-upgradeWizards-list-row-execute",e.wizardsInputTemplate="#t3js-upgradeWizards-input",e.wizardsInputTitle=".t3js-upgradeWizards-input-title",e.wizardsInputDescription=".t3js-upgradeWizards-input-description",e.wizardsInputHtml=".t3js-upgradeWizards-input-html",e.wizardsInputPerform=".t3js-upgradeWizards-input-perform",e.wizardsInputAbort=".t3js-upgradeWizards-input-abort"}(l||(l={}))
class c extends e{constructor(){super(),this.securityUtility=new a}static removeLoadingMessage(e){e.querySelectorAll("typo3-backend-progress-bar").forEach((e=>e.remove()))}initialize(e){super.initialize(e),Promise.all([this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js"),this.loadModuleFrameAgnostic("@typo3/install/renderable/flash-message.js")]).then((async()=>{await this.getData(),this.doneUpgrades()})),new d("click",((e,t)=>{t.disabled=!0,this.markUndone(t.dataset.identifier)})).delegateTo(e,l.wizardsDoneRowMarkUndone),new d("click",(()=>{this.blockingUpgradesDatabaseCharsetFix()})).delegateTo(e,l.wizardsBlockingCharsetFix),new d("click",(()=>{this.blockingUpgradesDatabaseAddsExecute()})).delegateTo(e,l.wizardsBlockingAddsExecute),new d("click",((e,t)=>{this.wizardInput(t.dataset.identifier,t.dataset.title)})).delegateTo(e,l.wizardsListRowExecute),new d("click",((e,t)=>{this.wizardExecute(t.dataset.identifier,t.dataset.title)})).delegateTo(e,l.wizardsInputPerform),new d("click",(()=>{this.findInModal(l.outputWizardsContainer).innerHTML="",this.wizardsList()})).delegateTo(e,l.wizardsInputAbort)}getData(){const e=this.getModalBody(),a=this.findInModal(l.outputWizardsContainer)
return new s(n.getUrl("upgradeWizardsGetData")).get({cache:"no-cache"}).then((async s=>{const a=await s.resolve()
!0===a.success?(e.innerHTML=a.html,this.blockingUpgradesDatabaseCharsetTest()):t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,a)}))}blockingUpgradesDatabaseCharsetTest(){const e=this.getModalBody(),t=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(t,{label:"Checking database charset..."}),new s(n.getUrl("upgradeWizardsBlockingDatabaseCharsetTest")).get({cache:"no-cache"}).then((async s=>{const a=await s.resolve()
!0===a.success&&(!0===a.needsUpdate?(c.removeLoadingMessage(t),e.querySelector(l.outputWizardsContainer).appendChild(e.querySelector(l.wizardsBlockingCharsetTemplate).content.cloneNode(!0))):this.blockingUpgradesDatabaseAdds())}),(e=>{n.handleAjaxError(e,t)}))}blockingUpgradesDatabaseCharsetFix(){const e=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(e,{label:"Setting database charset to UTF-8..."}),new s(n.getUrl("upgradeWizardsBlockingDatabaseCharsetFix")).get({cache:"no-cache"}).then((async t=>{const s=await t.resolve()
!0===s.success?Array.isArray(s.status)&&s.status.length>0&&s.status.forEach((t=>{e.append(i.create(t.severity,t.title,t.message))})):(c.removeLoadingMessage(e),e.append(r.create(o.error,"Something went wrong")))}),(t=>{n.handleAjaxError(t,e)}))}blockingUpgradesDatabaseAdds(){const e=this.getModalBody(),a=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(a,{label:"Check for missing mandatory database tables and fields..."}),new s(n.getUrl("upgradeWizardsBlockingDatabaseAdds")).get({cache:"no-cache"}).then((async s=>{const r=await s.resolve()
if(!0===r.success)if(!0===r.needsUpdate){const i=e.querySelector(l.wizardsBlockingAddsTemplate).content.cloneNode(!0)
"object"==typeof r.adds.tables&&r.adds.tables.forEach((e=>{const t="Table: "+this.securityUtility.encodeHtml(e.table)
i.querySelector(l.wizardsBlockingAddsRows).append(t,document.createElement("br"))})),"object"==typeof r.adds.columns&&r.adds.columns.forEach((e=>{const t="Table: "+this.securityUtility.encodeHtml(e.table)+", Field: "+this.securityUtility.encodeHtml(e.field)
i.querySelector(l.wizardsBlockingAddsRows).append(t,document.createElement("br"))})),"object"==typeof r.adds.indexes&&r.adds.indexes.forEach((e=>{const t="Table: "+this.securityUtility.encodeHtml(e.table)+", Index: "+this.securityUtility.encodeHtml(e.index)
i.querySelector(l.wizardsBlockingAddsRows).append(t,document.createElement("br"))})),e.querySelector(l.outputWizardsContainer).appendChild(i)}else this.wizardsList()
else c.removeLoadingMessage(a),t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,a)}))}blockingUpgradesDatabaseAddsExecute(){const e=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(e,{label:"Adding database tables and fields..."}),new s(n.getUrl("upgradeWizardsBlockingDatabaseExecute")).get({cache:"no-cache"}).then((async t=>{const s=await t.resolve()
if(Array.isArray(s.status)&&s.status.length>0&&s.status.forEach((t=>{e.append(i.create(t.severity,t.title,t.message))})),!0===s.success)this.wizardsList()
else if(Array.isArray(s.status)&&0!==s.status.length){const a=document.createElement("div")
a.classList.add("btn-toolbar","mt-3","mb-4")
const n=document.createElement("button")
n.classList.add("btn","btn-default"),n.innerText="Retry database migration"
const l=document.createElement("button")
l.classList.add("btn","btn-danger"),l.innerText="Proceed despite of errors",new d("click",(()=>{this.blockingUpgradesDatabaseAddsExecute()})).bindTo(n),new d("click",(()=>{a.remove(),this.wizardsList()})).bindTo(l),a.appendChild(n),a.appendChild(l),e.appendChild(a)}else e.append(r.create(o.error,"Something went wrong"))}),(t=>{n.handleAjaxError(t,e)}))}wizardsList(){const e=this.getModalBody(),a=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(a,{label:"Loading upgrade wizards..."}),new s(n.getUrl("upgradeWizardsList")).get({cache:"no-cache"}).then((async s=>{const r=await s.resolve()
c.removeLoadingMessage(a)
const i=e.querySelector(l.wizardsListTemplate).content.cloneNode(!0)
if(!0===r.success){let n=0,d=0
Array.isArray(r.wizards)&&r.wizards.length>0&&(d=r.wizards.length,r.wizards.forEach((t=>{if(!0===t.shouldRenderWizard){const s=e.querySelector(l.wizardsListRowTemplate).content.cloneNode(!0)
n+=1,s.querySelector(l.wizardsListRowTitle).innerText=t.title,s.querySelector(l.wizardsListRowExplanation).innerText=t.explanation,s.querySelector(l.wizardsListRowExecute).setAttribute("data-identifier",t.identifier),s.querySelector(l.wizardsListRowExecute).setAttribute("data-title",t.title),i.querySelector(l.wizardsListRows).append(s)}})))
let u=100
const p=i.querySelector("typo3-backend-progress-bar")
n>0?u=Math.round((d-n)/r.wizards.length*100):p.severity=o.ok,p.value=u,p.label=`${d-n} of ${d} upgrade wizards executed`,e.querySelector(l.outputWizardsContainer).appendChild(i)}else t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,a)}))}wizardInput(e,t){const a=this.getModuleContent().dataset.upgradeWizardsInputToken,i=this.getModalBody(),o=this.findInModal(l.outputWizardsContainer)
this.renderProgressBar(o,{label:'Loading "'+t+'"...'}),i.animate({scrollTop:i.scrollTop-Math.abs(i.querySelector(".t3js-upgrade-status-section").getBoundingClientRect().top)},250),new s(n.getUrl("upgradeWizardsInput")).post({install:{action:"upgradeWizardsInput",token:a,identifier:e}}).then((async e=>{const t=await e.resolve()
o.innerHTML=""
const s=i.querySelector(l.wizardsInputTemplate).content.cloneNode(!0)
if(!0===t.success){Array.isArray(t.status)&&t.status.forEach((e=>{o.append(r.create(e.severity,e.title,e.message))})),t.userInput.wizardHtml.length>0&&(s.querySelector(l.wizardsInputHtml).innerHTML=t.userInput.wizardHtml),s.querySelector(l.wizardsInputTitle).innerText=t.userInput.title,s.querySelector(l.wizardsInputDescription).innerHTML=this.securityUtility.stripHtml(t.userInput.description).replace(/\n/g,"<br>")
const a=s.querySelector(l.wizardsInputPerform)
a.setAttribute("data-identifier",t.userInput.identifier),a.setAttribute("data-title",t.userInput.title)}i.querySelector(l.outputWizardsContainer).appendChild(s)}),(e=>{n.handleAjaxError(e,o)}))}wizardExecute(e,a){const r=this.getModuleContent().dataset.upgradeWizardsExecuteToken,o=this.getModalBody(),d={"install[action]":"upgradeWizardsExecute","install[token]":r,"install[identifier]":e},c=new FormData(this.findInModal(l.outputWizardsContainer+" form"))
for(const[name,value]of c)d[name]=value.toString()
const u=this.findInModal(l.outputWizardsContainer),p=this.findInModal(l.outputMessagesContainer)
this.renderProgressBar(u,{label:'Executing "'+a+'"...'}),new s(n.getUrl()).post(d).then((async e=>{const s=await e.resolve()
if(p.replaceChildren(),!0===s.success){if(Array.isArray(s.status)){const a=[]
s.status.forEach((e=>{a.push(i.create(e.severity,e.title,e.message))})),p.append(...a)}this.wizardsList(),o.querySelector(l.outputDoneContainer).innerHTML="",this.doneUpgrades()}else t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,u)}))}doneUpgrades(){const e=this.getModalBody(),a=e.querySelector(l.outputDoneContainer)
this.renderProgressBar(a,{label:"Loading executed upgrade wizards..."}),new s(n.getUrl("upgradeWizardsDoneUpgrades")).get({cache:"no-cache"}).then((async s=>{const r=await s.resolve()
if(c.removeLoadingMessage(a),!0===r.success){Array.isArray(r.status)&&r.status.length>0&&r.status.forEach((e=>{a.append(i.create(e.severity,e.title,e.message))}))
const o=e.querySelector(l.wizardsDoneBodyTemplate).content.cloneNode(!0),n=o.querySelector(l.wizardsDoneRows)
let d=!1
Array.isArray(r.wizardsDone)&&r.wizardsDone.length>0&&r.wizardsDone.forEach((t=>{d=!0
const s=e.querySelector(l.wizardsDoneRowTemplate).content.cloneNode(!0)
s.querySelector(l.wizardsDoneRowMarkUndone).setAttribute("data-identifier",t.identifier),s.querySelector(l.wizardsDoneRowTitle).innerText=t.title,n.appendChild(s)})),Array.isArray(r.rowUpdatersDone)&&r.rowUpdatersDone.length>0&&r.rowUpdatersDone.forEach((t=>{d=!0
const s=e.querySelector(l.wizardsDoneRowTemplate).content.cloneNode(!0)
s.querySelector(l.wizardsDoneRowMarkUndone).setAttribute("data-identifier",t.identifier),s.querySelector(l.wizardsDoneRowTitle).innerText=t.title,n.appendChild(s)})),d&&e.querySelector(l.outputDoneContainer).appendChild(o)}else t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,a)}))}markUndone(e){const a=this.getModuleContent().dataset.upgradeWizardsMarkUndoneToken,r=this.getModalBody(),i=this.findInModal(l.outputMessagesContainer),o=this.findInModal(l.outputDoneContainer)
this.renderProgressBar(o,{label:"Marking upgrade wizard as undone..."}),new s(n.getUrl()).post({install:{action:"upgradeWizardsMarkUndone",token:a,identifier:e}}).then((async e=>{const s=await e.resolve()
i.replaceChildren(),o.replaceChildren(),r.querySelector(l.outputDoneContainer).replaceChildren(),!0===s.success&&Array.isArray(s.status)?s.status.forEach((e=>{t.success(e.title,e.message),this.doneUpgrades(),this.blockingUpgradesDatabaseCharsetTest()})):t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{n.handleAjaxError(e,o)}))}}export default new c
