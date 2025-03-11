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
import"@typo3/install/renderable/clearable.js"
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/notification.js"
import o from"@typo3/core/ajax/ajax-request.js"
import s from"@typo3/install/router.js"
import a from"@typo3/core/event/debounce-event.js"
import"@typo3/backend/element/icon-element.js"
import l from"@typo3/core/event/regular-event.js"
import{Collapse as r}from"bootstrap"
var i
!function(e){e.fulltextSearch=".t3js-upgradeDocs-fulltext-search",e.changeLogsForVersionContainer=".t3js-version-changes",e.changeLogsForVersion=".t3js-changelog-list",e.selectPureField=".t3js-upgradeDocs-select-pure",e.upgradeDoc=".t3js-upgrade-doc"}(i||(i={}))
export default new class extends e{initialize(e){super.initialize(e),this.loadModuleFrameAgnostic("select-pure").then((()=>{this.getContent()})),new l("click",((e,t)=>{this.markRead(t)})).delegateTo(e,".t3js-upgradeDocs-markRead"),new l("click",((e,t)=>{this.unmarkRead(t)})).delegateTo(e,".t3js-upgradeDocs-unmarkRead")}getContent(){const e=this.getModalBody()
new o(s.getUrl("upgradeDocsGetContent")).get({cache:"no-cache"}).then((async t=>{const o=await t.resolve()
!0===o.success&&"undefined"!==o.html&&o.html.length>0&&(e.innerHTML=o.html,this.initializeFullTextSearch(),this.initializeSelectPure(),this.loadChangelogs())}),(t=>{s.handleAjaxError(t,e)}))}loadChangelogs(){const e=[],a=this.getModalBody()
this.currentModal.querySelectorAll(i.changeLogsForVersionContainer).forEach((l=>{const r=new o(s.getUrl("upgradeDocsGetChangelogForVersion")).withQueryArguments({install:{version:l.dataset.version}}).get({cache:"no-cache"}).then((async e=>{const o=await e.resolve()
if(!0===o.success){const s=l,a=s.querySelector(i.changeLogsForVersion)
a.innerHTML=o.html,this.moveNotRelevantDocuments(a),s.querySelector(".t3js-panel-loading").remove()}else t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{s.handleAjaxError(e,a)}))
e.push(r)})),Promise.all(e).then((()=>{this.fulltextSearchField.disabled=!1,this.appendItemsToSelectPure()}))}initializeFullTextSearch(){this.fulltextSearchField=this.findInModal(i.fulltextSearch)
const e=this.fulltextSearchField
e.clearable({onClear:()=>{this.combinedFilterSearch()}}),e.focus(),new a("keyup",(()=>{this.combinedFilterSearch()})).bindTo(e)}initializeSelectPure(){this.selectPureField=this.getModalBody().querySelector(i.selectPureField),this.selectPureField.addEventListener("change",(()=>{this.combinedFilterSearch(),this.selectPureField.close()}))}appendItemsToSelectPure(){let e=""
this.currentModal.querySelectorAll(i.upgradeDoc).forEach((t=>{e+=t.dataset.itemTags+","}))
const t=[...new Set(e.slice(0,-1).split(",")).values()].reduce(((e,t)=>{const o=t.toLowerCase()
return e.every((e=>e.toLowerCase()!==o))&&e.push(t),e}),[]).sort(((e,t)=>e.toLowerCase().localeCompare(t.toLowerCase())))
this.selectPureField.enable()
for(const o of t){const s=this.selectPureField.ownerDocument.createElement("option-pure")
s.textContent=o,s.setAttribute("value",o),this.selectPureField.appendChild(s)}}combinedFilterSearch(){const e=this.getModalBody(),t=e.querySelectorAll(i.upgradeDoc)
if(this.selectPureField.values.length<1&&this.fulltextSearchField.value.length<1){return void this.currentModal.querySelectorAll(".panel-version .panel-collapse.show").forEach((e=>{new l("hidden.bs.collapse",(()=>{0===this.currentModal.querySelectorAll(".panel-version .panel-collapse.collapsing").length&&t.forEach((e=>{e.classList.remove("hidden","searchhit","filterhit")}))}),{once:!0}).bindTo(e),r.getOrCreateInstance(e).hide()}))}if(t.forEach((e=>{e.classList.remove("searchhit","filterhit")})),this.selectPureField.values.length>0){t.forEach((e=>{e.classList.add("hidden"),e.classList.remove("filterhit")}))
const o=this.selectPureField.values.map((e=>'[data-item-tags*="'+e+'"]')).join("")
e.querySelectorAll(o).forEach((e=>{e.classList.remove("hidden"),e.classList.add("searchhit","filterhit")}))}else t.forEach((e=>{e.classList.add("filterhit"),e.classList.remove("hidden")}))
const s=this.fulltextSearchField.value
e.querySelectorAll(".filterhit").forEach((e=>{e.textContent.toLowerCase().trim().includes(s.toLowerCase())?(e.classList.remove("hidden"),e.classList.add("searchhit")):(e.classList.remove("searchhit"),e.classList.add("hidden"))})),e.querySelectorAll(".searchhit").forEach((e=>{const t=e.closest(".panel-collapse")
window.setTimeout((()=>{r.getOrCreateInstance(t).show()}),20)})),e.querySelectorAll(".panel-version").forEach((e=>{if(e.querySelectorAll(".searchhit, .filterhit").length<1){const t=e.querySelector(":scope > .panel-collapse")
r.getOrCreateInstance(t).hide()}}))}moveNotRelevantDocuments(e){this.findInModal(".panel-body-read").append(e.querySelector('[data-item-state="read"]')??""),this.findInModal(".panel-body-not-affected").append(e.querySelector('[data-item-state="notAffected"]')??"")}markRead(e){const t=this.getModalBody(),a=this.getModuleContent().dataset.upgradeDocsMarkReadToken,l=e.closest("button")
l.classList.toggle("t3js-upgradeDocs-unmarkRead"),l.classList.toggle("t3js-upgradeDocs-markRead"),l.querySelectorAll("typo3-backend-icon,.t3js-icon").forEach((e=>{e.outerHTML='<typo3-backend-icon identifier="actions-ban" size="small"></typo3-backend-icon>'})),this.findInModal(".panel-body-read").append(l.closest(".panel")),new o(s.getUrl()).post({install:{ignoreFile:l.dataset.filepath,token:a,action:"upgradeDocsMarkRead"}}).catch((e=>{s.handleAjaxError(e,t)}))}unmarkRead(e){const t=this.getModalBody(),a=this.getModuleContent().dataset.upgradeDocsUnmarkReadToken,l=e.closest("button"),r=l.closest(".panel").dataset.itemVersion
l.classList.toggle("t3js-upgradeDocs-markRead"),l.classList.toggle("t3js-upgradeDocs-unmarkRead"),l.querySelectorAll("typo3-backend-icon,.t3js-icon").forEach((e=>{e.outerHTML='<typo3-backend-icon identifier="actions-check" size="small"></typo3-backend-icon>'})),this.findInModal('*[data-group-version="'+r+'"] .panel-body').append(l.closest(".panel")),new o(s.getUrl()).post({install:{ignoreFile:l.dataset.filepath,token:a,action:"upgradeDocsUnmarkRead"}}).catch((e=>{s.handleAjaxError(e,t)}))}}
