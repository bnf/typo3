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
import{MessageUtility as e}from"@typo3/backend/utility/message-utility.js"
import{AjaxDispatcher as t}from"@typo3/backend/form-engine/inline-relation/ajax-dispatcher.js"
import o from"nprogress"
import n from"sortablejs"
import i from"@typo3/backend/form-engine.js"
import r from"@typo3/backend/form-engine-validation.js"
import a from"@typo3/backend/icons.js"
import s from"@typo3/backend/info-window.js"
import c from"@typo3/backend/modal.js"
import l from"@typo3/core/event/regular-event.js"
import d from"@typo3/backend/severity.js"
import u from"@typo3/backend/utility.js"
import{selector as h}from"@typo3/core/literals.js"
var p,g,m,f
!function(e){e.toggleSelector='[data-bs-toggle="formengine-file"]',e.controlSectionSelector=".t3js-formengine-file-header-control",e.deleteRecordButtonSelector=".t3js-editform-delete-file-reference",e.enableDisableRecordButtonSelector=".t3js-toggle-visibility-button",e.infoWindowButton='[data-action="infowindow"]',e.synchronizeLocalizeRecordButtonSelector=".t3js-synchronizelocalize-button",e.controlContainer=".t3js-file-controls"}(p||(p={})),function(e){e.new="isNewFileReference",e.visible="panel-visible",e.collapsed="panel-collapsed",e.notLoaded="t3js-not-loaded"}(g||(g={})),function(e){e.structureSeparator="-"}(m||(m={})),function(e){e.DOWN="down",e.UP="up"}(f||(f={}))
class b extends HTMLElement{constructor(){super(...arguments),this.container=null,this.recordsContainer=null,this.ajaxDispatcher=null,this.appearance=null,this.requestQueue={},this.progressQueue={},this.handlePostMessage=t=>{if(!e.verifyOrigin(t.origin))throw"Denied message sent by "+t.origin
if("typo3:foreignRelation:insert"===t.data.actionName){if(void 0===t.data.objectGroup)throw"No object group defined for message"
if(t.data.objectGroup!==this.container.dataset.objectGroup)return
this.importRecord([t.data.objectGroup,t.data.uid]).then((()=>{if(t.source){const o={actionName:"typo3:foreignRelation:inserted",objectGroup:t.data.objectId,table:t.data.table,uid:t.data.uid}
e.send(o,t.source)}}))}if("typo3:foreignRelation:delete"===t.data.actionName){if(t.data.objectGroup!==this.container.dataset.objectGroup)return
const o=t.data.directRemoval||!1,n=[t.data.objectGroup,t.data.uid].join("-")
this.deleteRecord(n,o)}}}connectedCallback(){const e=this.getAttribute("identifier")||""
this.container=this.querySelector(h`[id="${e}"]`),null!==this.container&&(this.recordsContainer=this.container.querySelector(h`[id="${this.container.getAttribute("id")}_records"]`),this.ajaxDispatcher=new t(this.container.dataset.objectGroup),this.registerEvents())}registerEvents(){this.registerInfoButton(),this.registerSort(),this.registerEnableDisableButton(),this.registerDeleteButton(),this.registerSynchronizeLocalize(),this.registerToggle(),new l("message",this.handlePostMessage).bindTo(window),this.getAppearance().useSortable&&new n(this.recordsContainer,{group:this.recordsContainer.getAttribute("id"),handle:".sortableHandle",onSort:()=>{this.updateSorting()}})}getFileReferenceContainer(e){return this.container.querySelector(h`[data-object-id="${e}"]`)}getCollapseButton(e){return this.container.querySelector(h`[aria-controls="${e}_fields"]`)}collapseElement(e,t){const o=this.getCollapseButton(t)
e.classList.remove(g.visible),e.classList.add(g.collapsed),o.setAttribute("aria-expanded","false")}expandElement(e,t){const o=this.getCollapseButton(t)
e.classList.remove(g.collapsed),e.classList.add(g.visible),o.setAttribute("aria-expanded","true")}isNewRecord(e){return this.getFileReferenceContainer(e).classList.contains(g.new)}updateExpandedCollapsedStateLocally(e,t){const o=this.getFileReferenceContainer(e),n=this.container.querySelectorAll('[name="uc[inlineView]['+o.dataset.topmostParentTable+"]["+o.dataset.topmostParentUid+"]"+o.dataset.fieldName+'"]')
n.length&&(n[0].value=t?"1":"0")}registerToggle(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.loadRecordDetails(t.closest(p.toggleSelector).parentElement.dataset.objectId)})).delegateTo(this.container,`${p.toggleSelector} .form-irre-header-cell:not(${p.controlSectionSelector}`)}registerSort(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.changeSortingByButton(t.closest("[data-object-id]").dataset.objectId,t.dataset.direction)})).delegateTo(this.container,p.controlSectionSelector+' [data-action="sort"]')}createRecord(e,t,afterUid=null){let o=this.container.dataset.objectGroup
null!==afterUid&&(o+=m.structureSeparator+afterUid),null!==afterUid?(this.getFileReferenceContainer(o).insertAdjacentHTML("afterend",t),this.memorizeAddRecord(e,afterUid)):(this.recordsContainer.insertAdjacentHTML("beforeend",t),this.memorizeAddRecord(e,null))}async importRecord(e,t){return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("file_reference_create")),e).then((async e=>{this.isBelowMax()&&this.createRecord(e.compilerInput.uid,e.data,void 0!==t?t:null)}))}registerEnableDisableButton(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=t.closest("[data-object-id]").dataset.objectId,n=this.getFileReferenceContainer(o),i=h`data${n.dataset.fieldName}[${t.dataset.hiddenField}]`,s=this.recordsContainer.querySelector('[data-formengine-input-name="'+i+'"'),c=this.recordsContainer.querySelector('[name="'+i+'"')
null!==s&&null!==c&&(s.checked=!s.checked,c.value=s.checked?"1":"0",r.markFieldAsChanged(s))
const l="t3-form-field-container-inline-hidden"
let d
n.classList.contains(l)?(d="actions-edit-hide",n.classList.remove(l)):(d="actions-edit-unhide",n.classList.add(l)),a.getIcon(d,a.sizes.small).then((e=>{t.replaceChild(document.createRange().createContextualFragment(e),t.querySelector(".t3js-icon"))}))})).delegateTo(this.container,p.enableDisableRecordButtonSelector)}registerInfoButton(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),s.showItem(t.dataset.infoTable,t.dataset.infoUid)})).delegateTo(this.container,p.infoWindowButton)}registerDeleteButton(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?",n=(TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete the record '%s'?").replace("%s",t.dataset.recordInfo)
c.confirm(o,n,d.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no",trigger:(e,t)=>t.hideModal()},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes",trigger:(e,o)=>{this.deleteRecord(t.closest("[data-object-id]").dataset.objectId),o.hideModal()}}])})).delegateTo(this.container,p.deleteRecordButtonSelector)}registerSynchronizeLocalize(){new l("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("file_reference_synchronizelocalize")),[this.container.dataset.objectGroup,t.dataset.type]).then((async e=>{this.recordsContainer.insertAdjacentHTML("beforeend",e.data)
const t=this.container.dataset.objectGroup+m.structureSeparator
for(const o of e.compilerInput.delete)this.deleteRecord(t+o,!0)
for(const n of Object.values(e.compilerInput.localize)){if(void 0!==n.remove){const i=this.getFileReferenceContainer(t+n.remove)
i.parentElement.removeChild(i)}this.memorizeAddRecord(n.uid,null)}}))})).delegateTo(this.container,p.synchronizeLocalizeRecordButtonSelector)}loadRecordDetails(e){const t=this.recordsContainer.querySelector(h`[id="${e}_fields"]`),o=this.getFileReferenceContainer(e),n=void 0!==this.requestQueue[e]
if(null!==t&&!o.classList.contains(g.notLoaded))this.collapseExpandRecord(e)
else{const a=this.getProgress(e,o.dataset.objectIdHash)
if(n)this.requestQueue[e].abort(),delete this.requestQueue[e],delete this.progressQueue[e],a.done()
else{const s=this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("file_reference_details"))
this.ajaxDispatcher.send(s,[e]).then((async n=>{delete this.requestQueue[e],delete this.progressQueue[e],o.classList.remove(g.notLoaded),t.innerHTML=n.data,this.collapseExpandRecord(e),a.done(),i.reinitialize(),r.initializeInputFields(),r.validate(this.container)})),this.requestQueue[e]=s,a.start()}}}collapseExpandRecord(e){const t=this.getFileReferenceContainer(e),o=!0===this.getAppearance().expandSingle,n=t.classList.contains(g.collapsed)
let i=[]
const r=[]
o&&n&&(i=this.collapseAllRecords(t.dataset.objectUid)),t.classList.contains(g.collapsed)?this.expandElement(t,e):this.collapseElement(t,e),this.isNewRecord(e)?this.updateExpandedCollapsedStateLocally(e,n):n?r.push(t.dataset.objectUid):n||i.push(t.dataset.objectUid),this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("file_reference_expandcollapse")),[e,r.join(","),i.join(",")])}memorizeAddRecord(e,afterUid=null){const t=this.getFormFieldForElements()
if(null===t)return
let o=u.trimExplode(",",t.value)
if(afterUid){const n=[]
for(let a=0;a<o.length;a++)o[a].length&&n.push(o[a]),afterUid===o[a]&&n.push(e)
o=n}else o.push(e)
t.value=o.join(","),r.markFieldAsChanged(t),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,o),this.isBelowMax()||this.toggleContainerControls(!1),i.reinitialize(),r.initializeInputFields(),r.validate(this.container)}memorizeRemoveRecord(e){const t=this.getFormFieldForElements()
if(null===t)return[]
const o=u.trimExplode(",",t.value),n=o.indexOf(e)
return n>-1&&(o.splice(n,1),t.value=o.join(","),r.markFieldAsChanged(t),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,o)),o}changeSortingByButton(e,t){const o=this.getFileReferenceContainer(e),n=o.dataset.objectUid,i=Array.from(this.recordsContainer.children).map((e=>e.dataset.objectUid)),r=i.indexOf(n)
let a=!1
if(t===f.UP&&r>0?(i[r]=i[r-1],i[r-1]=n,a=!0):t===f.DOWN&&r<i.length-1&&(i[r]=i[r+1],i[r+1]=n,a=!0),a){const s=this.container.dataset.objectGroup+m.structureSeparator,c=t===f.UP?1:0
o.parentElement.insertBefore(this.getFileReferenceContainer(s+i[r-c]),this.getFileReferenceContainer(s+i[r+1-c])),this.updateSorting()}}updateSorting(){const e=this.getFormFieldForElements()
if(null===e)return
const t=Array.from(this.recordsContainer.querySelectorAll(h`[data-object-parent-group="${this.container.dataset.objectGroup}"][data-placeholder-record="0"]`)).map((e=>e.dataset.objectUid))
e.value=t.join(","),r.markFieldAsChanged(e),document.dispatchEvent(new Event("formengine:files:sorting-changed")),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,t)}deleteRecord(e,forceDirectRemoval=!1){const t=this.getFileReferenceContainer(e),o=t.dataset.objectUid
if(t.classList.add("t3js-file-reference-deleted"),!this.isNewRecord(e)&&!forceDirectRemoval){const n=this.container.querySelector(h`[name="cmd${t.dataset.fieldName}[delete]"]`)
n.removeAttribute("disabled"),t.parentElement.insertAdjacentElement("afterbegin",n)}new l("transitionend",(()=>{t.remove(),r.validate(this.container)})).bindTo(t),this.memorizeRemoveRecord(o),t.classList.add("form-irre-object--deleted"),this.isBelowMax()&&this.toggleContainerControls(!0)}toggleContainerControls(e){this.container.querySelectorAll(p.controlContainer).forEach((t=>{t.querySelectorAll("button, a").forEach((t=>{t.style.display=e?null:"none"}))}))}getProgress(e,t){const n="#"+t+"_header"
let i
return void 0!==this.progressQueue[e]?i=this.progressQueue[e]:((i=o).configure({parent:n,showSpinner:!1}),this.progressQueue[e]=i),i}collapseAllRecords(e){const t=this.getFormFieldForElements(),o=[]
if(null!==t){const n=u.trimExplode(",",t.value)
for(const i of n){if(i===e)continue
const r=this.container.dataset.objectGroup+m.structureSeparator+i,a=this.getFileReferenceContainer(r)
a.classList.contains(g.visible)&&(this.collapseElement(a,r),this.isNewRecord(r)?this.updateExpandedCollapsedStateLocally(r,!1):o.push(i))}}return o}getFormFieldForElements(){const e=this.container.querySelectorAll(h`[name="${this.container.dataset.formField}"]`)
return e.length>0?e[0]:null}redrawSortingButtons(e,records=[]){if(0===records.length){const t=this.getFormFieldForElements()
null!==t&&(records=u.trimExplode(",",t.value))}0!==records.length&&records.forEach(((t,o)=>{const n=this.getFileReferenceContainer(e+m.structureSeparator+t),i=this.container.querySelector('[id="'+n.dataset.objectIdHash+'_header"]'),r=i.querySelector('[data-action="sort"][data-direction="'+f.UP+'"]')
if(null!==r){let s="actions-move-up"
0===o?(r.classList.add("disabled"),s="empty-empty"):r.classList.remove("disabled"),a.getIcon(s,a.sizes.small).then((e=>{r.replaceChild(document.createRange().createContextualFragment(e),r.querySelector(".t3js-icon"))}))}const c=i.querySelector('[data-action="sort"][data-direction="'+f.DOWN+'"]')
if(null!==c){s="actions-move-down"
o===records.length-1?(c.classList.add("disabled"),s="empty-empty"):c.classList.remove("disabled"),a.getIcon(s,a.sizes.small).then((e=>{c.replaceChild(document.createRange().createContextualFragment(e),c.querySelector(".t3js-icon"))}))}}))}isBelowMax(){const e=this.getFormFieldForElements()
if(null===e)return!0
if(void 0!==TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup]){if(u.trimExplode(",",e.value).length>=TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup].max)return!1}return!0}getAppearance(){if(null===this.appearance&&(this.appearance={},"string"==typeof this.container.dataset.appearance))try{this.appearance=JSON.parse(this.container.dataset.appearance)}catch(e){console.error(e)}return this.appearance}}window.customElements.define("typo3-formengine-container-files",b)
