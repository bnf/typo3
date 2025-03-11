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
import"@typo3/install/renderable/wrap-group.js"
import"@typo3/install/renderable/offset-group.js"
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/module-menu.js"
import o from"@typo3/backend/notification.js"
import r from"@typo3/core/ajax/ajax-request.js"
import a from"@typo3/install/router.js"
import{topLevelModuleImport as n}from"@typo3/backend/utility/top-level-module-import.js"
import s from"@typo3/core/event/regular-event.js"
import{Collapse as i}from"bootstrap"
import l from"@typo3/core/event/debounce-event.js"
import{KeyTypesEnum as c}from"@typo3/backend/enum/key-types.js"
var d
!function(e){e.formListener=".t3js-extensionConfiguration-form",e.searchInput=".t3js-extensionConfiguration-search"}(d||(d={}))
export default new class extends e{initialize(e){super.initialize(e),this.getContent(),new s("keydown",(t=>{const o=e.querySelector(d.searchInput)
t.ctrlKey||t.metaKey?"f"!==t.key&&"F"!==t.key||(t.preventDefault(),o.focus()):t.key===c.ESCAPE&&(t.preventDefault(),o.value="",o.focus())})).bindTo(e),new l("input",((e,t)=>{const o=t.value
this.search(o)}),100).delegateTo(e,d.searchInput),new s("change",((e,t)=>{const o=t.value
this.search(o)})).delegateTo(e,d.searchInput),new s("submit",((e,t)=>{e.preventDefault(),this.write(t)})).delegateTo(e,d.formListener)}search(e){this.currentModal.querySelectorAll(".search-item").forEach((t=>{""===e||t.textContent.toLowerCase().trim().includes(e.toLowerCase())?(t.classList.add("searchhit"),t.classList.remove("hidden")):(t.classList.remove("searchhit"),t.classList.add("hidden"))})),this.currentModal.querySelectorAll(".searchhit").forEach((e=>{i.getOrCreateInstance(e).show()}))}getContent(){const e=this.getModalBody()
new r(a.getUrl("extensionConfigurationGetContent")).get({cache:"no-cache"}).then((async t=>{const o=await t.resolve()
!0===o.success&&(e.innerHTML=o.html,e.querySelector(d.searchInput).clearable(),this.initializeWrap(),this.initializeColorPicker())}),(t=>{a.handleAjaxError(t,e)}))}initializeColorPicker(){window.location!==window.parent.location?n("@typo3/backend/color-picker.js"):import("@typo3/backend/color-picker.js")}write(e){const n=this.getModalBody(),s=this.getModuleContent().dataset.extensionConfigurationWriteToken,i={}
for(const[name,value]of new FormData(e))i[name]=value.toString()
new r(a.getUrl()).post({install:{token:s,action:"extensionConfigurationWrite",extensionKey:e.dataset.extensionKey,extensionConfiguration:i}}).then((async e=>{const r=await e.resolve()
!0===r.success&&Array.isArray(r.status)?(r.status.forEach((e=>{o.showMessage(e.title,e.message,e.severity)})),"backend"===document.body.dataset.context&&t.App.refreshMenu()):o.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{a.handleAjaxError(e,n)}))}initializeWrap(){window.location!==window.parent.location&&(n("@typo3/install/renderable/wrap-group.js"),n("@typo3/install/renderable/offset-group.js")),this.currentModal.querySelectorAll(".t3js-emconf-offset").forEach((e=>{const t=e.parentElement
e.setAttribute("data-offsetfield-x","#"+e.id+"_offset_x"),e.setAttribute("data-offsetfield-y","#"+e.id+"_offset_y"),e.classList.add("hidden")
const o=t.ownerDocument.createElement("typo3-install-offset-group")
o.offsetId=e.id,o.values=e.value.split(","),t.appendChild(o),t.querySelectorAll(".t3js-emconf-offsetfield").forEach((e=>{new s("keyup",(e=>{const o=t.querySelector(e.currentTarget.dataset.target)
o.value=t.querySelector(o.dataset.offsetfieldX).value+","+t.querySelector(o.dataset.offsetfieldY).value})).bindTo(e)}))})),this.currentModal.querySelectorAll(".t3js-emconf-wrap").forEach((e=>{const t=e.parentElement
e.setAttribute("data-wrapfield-start","#"+e.id+"_wrap_start"),e.setAttribute("data-wrapfield-end","#"+e.id+"_wrap_end"),e.classList.add("hidden")
const o=t.ownerDocument.createElement("typo3-install-wrap-group")
o.wrapId=e.id,o.values=e.value.split("|"),t.appendChild(o),t.querySelectorAll(".t3js-emconf-wrapfield").forEach((e=>{new s("keyup",(e=>{const o=t.querySelector(e.currentTarget.dataset.target)
o.value=t.querySelector(o.dataset.wrapfieldStart).value+"|"+t.querySelector(o.dataset.wrapfieldEnd).value})).bindTo(e)}))}))}}
