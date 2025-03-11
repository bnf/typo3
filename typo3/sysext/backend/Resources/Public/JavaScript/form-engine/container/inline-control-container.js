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
import n from"@typo3/core/document-service.js"
import o from"nprogress"
import i from"sortablejs"
import r from"@typo3/backend/form-engine.js"
import a from"@typo3/backend/form-engine-validation.js"
import s from"@typo3/backend/icons.js"
import l from"@typo3/backend/info-window.js"
import c from"@typo3/backend/modal.js"
import d from"@typo3/backend/notification.js"
import u from"@typo3/core/event/regular-event.js"
import p from"@typo3/backend/severity.js"
import h from"@typo3/backend/utility.js"
import{selector as m}from"@typo3/core/literals.js"
var g,f,b,j
!function(e){e.toggleSelector='[data-bs-toggle="formengine-inline"]',e.controlSectionSelector=".t3js-formengine-irre-control",e.createNewRecordButtonSelector=".t3js-create-new-button",e.createNewRecordBySelectorSelector=".t3js-create-new-selector",e.deleteRecordButtonSelector=".t3js-editform-delete-inline-record",e.enableDisableRecordButtonSelector=".t3js-toggle-visibility-button",e.infoWindowButton='[data-action="infowindow"]',e.synchronizeLocalizeRecordButtonSelector=".t3js-synchronizelocalize-button",e.uniqueValueSelectors="select.t3js-inline-unique",e.revertUniqueness=".t3js-revert-unique",e.controlContainer=".t3js-inline-controls"}(g||(g={})),function(e){e.new="inlineIsNewRecord",e.visible="panel-visible",e.collapsed="panel-collapsed",e.notLoaded="t3js-not-loaded"}(f||(f={})),function(e){e.structureSeparator="-"}(b||(b={})),function(e){e.DOWN="down",e.UP="up"}(j||(j={}))
class v{constructor(o){this.container=null,this.ajaxDispatcher=null,this.appearance=null,this.requestQueue={},this.progressQueue={},this.noTitleString=TYPO3.lang?TYPO3.lang["FormEngine.noRecordTitle"]:"[No title]",this.handlePostMessage=t=>{if(!e.verifyOrigin(t.origin))throw"Denied message sent by "+t.origin
if("typo3:foreignRelation:insert"===t.data.actionName){if(void 0===t.data.objectGroup)throw"No object group defined for message"
if(t.data.objectGroup!==this.container.dataset.objectGroup)return
if(this.isUniqueElementUsed(parseInt(t.data.uid,10),t.data.table))return void d.error("There is already a relation to the selected element")
this.importRecord([t.data.objectGroup,t.data.uid]).then((()=>{if(t.source){const n={actionName:"typo3:foreignRelation:inserted",objectGroup:t.data.objectId,table:t.data.table,uid:t.data.uid}
e.send(n,t.source)}}))}if("typo3:foreignRelation:delete"===t.data.actionName){if(t.data.objectGroup!==this.container.dataset.objectGroup)return
const n=t.data.directRemoval||!1,o=[t.data.objectGroup,t.data.uid].join("-")
this.deleteRecord(o,n)}},n.ready().then((e=>{this.container=e.getElementById(o),this.ajaxDispatcher=new t(this.container.dataset.objectGroup),this.registerEvents()}))}static getInlineRecordContainer(e){return document.querySelector(m`[data-object-id="${e}"]`)}static getCollapseButton(e){return document.querySelector(m`[aria-controls="${e}_fields"]`)}static toggleElement(e){const t=v.getInlineRecordContainer(e)
t.classList.contains(f.collapsed)?v.expandElement(t,e):v.collapseElement(t,e)}static collapseElement(e,t){const n=v.getCollapseButton(t)
e.classList.remove(f.visible),e.classList.add(f.collapsed),n.setAttribute("aria-expanded","false")}static expandElement(e,t){const n=v.getCollapseButton(t)
e.classList.remove(f.collapsed),e.classList.add(f.visible),n.setAttribute("aria-expanded","true")}static isNewRecord(e){return v.getInlineRecordContainer(e).classList.contains(f.new)}static updateExpandedCollapsedStateLocally(e,t){const n=v.getInlineRecordContainer(e),o="uc[inlineView]["+n.dataset.topmostParentTable+"]["+n.dataset.topmostParentUid+"]"+n.dataset.fieldName,i=document.getElementsByName(o)
i.length&&(i[0].value=t?"1":"0")}static getValuesFromHashMap(e){return Object.keys(e).map((t=>e[t]))}static selectOptionValueExists(e,t){return null!==e.querySelector(m`option[value="${t}"]`)}static removeSelectOptionByValue(e,t){const n=e.querySelector(m`option[value="${t}"]`)
null!==n&&n.remove()}static reAddSelectOption(e,t,n){if(v.selectOptionValueExists(e,t))return
const o=e.querySelectorAll("option")
let i=-1
for(const r of Object.keys(n.possible)){if(r===t)break
for(let a=0;a<o.length;++a){if(o[a].value===r){i=a
break}}}-1===i?i=0:i<o.length&&i++
const s=document.createElement("option")
s.text=n.possible[t],s.value=t,e.insertBefore(s,e.options[i])}registerEvents(){if(this.registerInfoButton(),this.registerSort(),this.registerCreateRecordButton(),this.registerEnableDisableButton(),this.registerDeleteButton(),this.registerSynchronizeLocalize(),this.registerRevertUniquenessAction(),this.registerToggle(),this.registerCreateRecordBySelector(),this.registerUniqueSelectFieldChanged(),new u("message",this.handlePostMessage).bindTo(window),this.getAppearance().useSortable){const e=document.getElementById(this.container.getAttribute("id")+"_records")
new i(e,{group:e.getAttribute("id"),handle:".sortableHandle",onSort:()=>{this.updateSorting()}})}}registerToggle(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.loadRecordDetails(t.closest(g.toggleSelector).parentElement.dataset.objectId)})).delegateTo(this.container,`${g.toggleSelector} .form-irre-header-cell:not(${g.controlSectionSelector}`)}registerSort(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.changeSortingByButton(t.closest("[data-object-id]").dataset.objectId,t.dataset.direction)})).delegateTo(this.container,g.controlSectionSelector+' [data-action="sort"]')}registerCreateRecordButton(){new u("click",((e,t)=>{if(e.preventDefault(),e.stopImmediatePropagation(),this.isBelowMax()){let n=this.container.dataset.objectGroup
void 0!==t.dataset.recordUid&&(n+=b.structureSeparator+t.dataset.recordUid),this.importRecord([n,this.container.querySelector(g.createNewRecordBySelectorSelector)?.value],t.dataset.recordUid??null)}})).delegateTo(this.container,g.createNewRecordButtonSelector)}registerCreateRecordBySelector(){new u("change",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const n=t,o=n.options[n.selectedIndex].getAttribute("value")
this.importRecord([this.container.dataset.objectGroup,o])})).delegateTo(this.container,g.createNewRecordBySelectorSelector)}createRecord(e,t,afterUid=null,selectedValue=null){let n=this.container.dataset.objectGroup
null!==afterUid&&(n+=b.structureSeparator+afterUid),null!==afterUid?(v.getInlineRecordContainer(n).insertAdjacentHTML("afterend",t),this.memorizeAddRecord(e,afterUid,selectedValue)):(document.getElementById(this.container.getAttribute("id")+"_records").insertAdjacentHTML("beforeend",t),this.memorizeAddRecord(e,null,selectedValue))}async importRecord(e,t){return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("record_inline_create")),e).then((async e=>{this.isBelowMax()&&this.createRecord(e.compilerInput.uid,e.data,void 0!==t?t:null,void 0!==e.compilerInput.childChildUid?e.compilerInput.childChildUid:null)}))}registerEnableDisableButton(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const n=t.closest("[data-object-id]").dataset.objectId,o=v.getInlineRecordContainer(n),i=m`data${o.dataset.fieldName}[${t.dataset.hiddenField}]`,r=document.querySelector('[data-formengine-input-name="'+i+'"'),l=document.querySelector('[name="'+i+'"')
null!==r&&null!==l&&(r.checked=!r.checked,l.value=r.checked?"1":"0",a.markFieldAsChanged(r))
const c="t3-form-field-container-inline-hidden"
let d
o.classList.contains(c)?(d="actions-edit-hide",o.classList.remove(c)):(d="actions-edit-unhide",o.classList.add(c)),s.getIcon(d,s.sizes.small).then((e=>{t.replaceChild(document.createRange().createContextualFragment(e),t.querySelector(".t3js-icon"))}))})).delegateTo(this.container,g.enableDisableRecordButtonSelector)}registerInfoButton(){new u("click",(function(e){e.preventDefault(),e.stopImmediatePropagation(),l.showItem(this.dataset.infoTable,this.dataset.infoUid)})).delegateTo(this.container,g.infoWindowButton)}registerDeleteButton(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const n=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?",o=(TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete the record '%s'?").replace("%s",t.dataset.recordInfo),i=c.confirm(n,o,p.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes"}])
i.addEventListener("button.clicked",(e=>{if("yes"===e.target.name){const n=t.closest("[data-object-id]").dataset.objectId
this.deleteRecord(n)}i.hideModal()}))})).delegateTo(this.container,g.deleteRecordButtonSelector)}registerSynchronizeLocalize(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("record_inline_synchronizelocalize")),[this.container.dataset.objectGroup,t.dataset.type]).then((async e=>{document.getElementById(this.container.getAttribute("id")+"_records").insertAdjacentHTML("beforeend",e.data)
const t=this.container.dataset.objectGroup+b.structureSeparator
for(const n of e.compilerInput.delete)this.deleteRecord(t+n,!0)
for(const o of Object.values(e.compilerInput.localize)){if(void 0!==o.remove){const i=v.getInlineRecordContainer(t+o.remove)
i.parentElement.removeChild(i)}this.memorizeAddRecord(o.uid,null,o.selectedValue)}}))})).delegateTo(this.container,g.synchronizeLocalizeRecordButtonSelector)}registerUniqueSelectFieldChanged(){new u("change",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const n=t.closest("[data-object-id]")
if(null!==n){const o=n.dataset.objectId,i=n.dataset.objectUid
this.handleChangedField(t,o)
const r=this.getFormFieldForElements()
if(null===r)return
this.updateUnique(t,r,i)}})).delegateTo(this.container,g.uniqueValueSelectors)}registerRevertUniquenessAction(){new u("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.revertUnique(t.dataset.uid)})).delegateTo(this.container,g.revertUniqueness)}loadRecordDetails(e){const t=document.getElementById(e+"_fields"),n=v.getInlineRecordContainer(e),o=void 0!==this.requestQueue[e]
if(null!==t&&!n.classList.contains(f.notLoaded))this.collapseExpandRecord(e)
else{const i=this.getProgress(e,n.dataset.objectIdHash)
if(o)this.requestQueue[e].abort(),delete this.requestQueue[e],delete this.progressQueue[e],i.done()
else{const s=this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("record_inline_details"))
this.ajaxDispatcher.send(s,[e]).then((async n=>{if(delete this.requestQueue[e],delete this.progressQueue[e],o.classList.remove(f.notLoaded),t.innerHTML=n.data,this.collapseExpandRecord(e),i.done(),r.reinitialize(),a.initializeInputFields(),a.validate(this.container),this.hasObjectGroupDefinedUniqueConstraints()){const o=v.getInlineRecordContainer(e)
this.removeUsed(o)}})),this.requestQueue[e]=s,i.start()}}}collapseExpandRecord(e){const t=v.getInlineRecordContainer(e),n=!0===this.getAppearance().expandSingle,o=t.classList.contains(f.collapsed)
let i=[]
const r=[]
n&&o&&(i=this.collapseAllRecords(t.dataset.objectUid)),v.toggleElement(e),v.isNewRecord(e)?v.updateExpandedCollapsedStateLocally(e,o):o?r.push(t.dataset.objectUid):o||i.push(t.dataset.objectUid),this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("record_inline_expandcollapse")),[e,r.join(","),i.join(",")])}memorizeAddRecord(e,afterUid=null,selectedValue=null){const t=this.getFormFieldForElements()
if(null===t)return
let n=h.trimExplode(",",t.value)
if(afterUid){const o=[]
for(let i=0;i<n.length;i++)n[i].length&&o.push(n[i]),afterUid===n[i]&&o.push(e)
n=o}else n.push(e)
t.value=n.join(","),a.markFieldAsChanged(t),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,n),this.setUnique(e,selectedValue),this.isBelowMax()||this.toggleContainerControls(!1),r.reinitialize(),a.initializeInputFields(),a.validate(this.container)}memorizeRemoveRecord(e){const t=this.getFormFieldForElements()
if(null===t)return[]
const n=h.trimExplode(",",t.value),o=n.indexOf(e)
return o>-1&&(n.splice(o,1),t.value=n.join(","),a.markFieldAsChanged(t),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,n)),n}changeSortingByButton(e,t){const n=v.getInlineRecordContainer(e),o=n.dataset.objectUid,i=document.getElementById(this.container.getAttribute("id")+"_records"),r=Array.from(i.children).map((e=>e.dataset.objectUid)),a=r.indexOf(o)
let s=!1
if(t===j.UP&&a>0?(r[a]=r[a-1],r[a-1]=o,s=!0):t===j.DOWN&&a<r.length-1&&(r[a]=r[a+1],r[a+1]=o,s=!0),s){const l=this.container.dataset.objectGroup+b.structureSeparator,c=t===j.UP?1:0
n.parentElement.insertBefore(v.getInlineRecordContainer(l+r[a-c]),v.getInlineRecordContainer(l+r[a+1-c])),this.updateSorting()}}updateSorting(){const e=this.getFormFieldForElements()
if(null===e)return
const t=document.getElementById(this.container.getAttribute("id")+"_records"),n=Array.from(t.querySelectorAll(m`[data-object-parent-group="${this.container.dataset.objectGroup}"][data-placeholder-record="0"]`)).map((e=>e.dataset.objectUid))
e.value=n.join(","),a.markFieldAsChanged(e),document.dispatchEvent(new Event("inline:sorting-changed")),document.dispatchEvent(new Event("change")),this.redrawSortingButtons(this.container.dataset.objectGroup,n)}deleteRecord(e,forceDirectRemoval=!1){const t=v.getInlineRecordContainer(e),n=t.dataset.objectUid
if(t.classList.add("t3js-inline-record-deleted"),!v.isNewRecord(e)&&!forceDirectRemoval){const o=this.container.querySelector(m`[name="cmd${t.dataset.fieldName}[delete]"]`)
o.removeAttribute("disabled"),t.parentElement.insertAdjacentElement("afterbegin",o)}new u("transitionend",(()=>{t.remove(),a.validate(this.container)})).bindTo(t),this.revertUnique(n),this.memorizeRemoveRecord(n),t.classList.add("form-irre-object--deleted"),this.isBelowMax()&&this.toggleContainerControls(!0)}toggleContainerControls(e){this.container.querySelectorAll(":scope > "+g.controlContainer).forEach((t=>{t.querySelectorAll("button, a").forEach((t=>{t.style.display=e?null:"none"}))}))}getProgress(e,t){const n="#"+t+"_header"
let i
return void 0!==this.progressQueue[e]?i=this.progressQueue[e]:((i=o).configure({parent:n,showSpinner:!1}),this.progressQueue[e]=i),i}collapseAllRecords(e){const t=this.getFormFieldForElements(),n=[]
if(null!==t){const o=h.trimExplode(",",t.value)
for(const i of o){if(i===e)continue
const r=this.container.dataset.objectGroup+b.structureSeparator+i,a=v.getInlineRecordContainer(r)
a.classList.contains(f.visible)&&(v.collapseElement(a,r),v.isNewRecord(r)?v.updateExpandedCollapsedStateLocally(r,!1):n.push(i))}}return n}getFormFieldForElements(){const e=document.getElementsByName(this.container.dataset.formField)
return e.length>0?e[0]:null}redrawSortingButtons(e,records=[]){if(0===records.length){const t=this.getFormFieldForElements()
null!==t&&(records=h.trimExplode(",",t.value))}0!==records.length&&records.forEach(((t,n)=>{const o=v.getInlineRecordContainer(e+b.structureSeparator+t).dataset.objectIdHash+"_header",i=document.getElementById(o),r=i.querySelector(m`[data-action="sort"][data-direction="${j.UP}"]`)
if(null!==r){let a="actions-move-up"
0===n?(r.classList.add("disabled"),a="empty-empty"):r.classList.remove("disabled"),s.getIcon(a,s.sizes.small).then((e=>{r.replaceChild(document.createRange().createContextualFragment(e),r.querySelector(".t3js-icon"))}))}const l=i.querySelector(m`[data-action="sort"][data-direction="${j.DOWN}"]`)
if(null!==l){a="actions-move-down"
n===records.length-1?(l.classList.add("disabled"),a="empty-empty"):l.classList.remove("disabled"),s.getIcon(a,s.sizes.small).then((e=>{l.replaceChild(document.createRange().createContextualFragment(e),l.querySelector(".t3js-icon"))}))}}))}isBelowMax(){const e=this.getFormFieldForElements()
if(null===e)return!0
if(void 0!==TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup]){if(h.trimExplode(",",e.value).length>=TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup].max)return!1
if(this.hasObjectGroupDefinedUniqueConstraints()){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup]
if(t.used.length>=t.max&&t.max>=0)return!1}}return!0}isUniqueElementUsed(e,t){if(!this.hasObjectGroupDefinedUniqueConstraints())return!1
const n=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],o=v.getValuesFromHashMap(n.used)
if("select"===n.type&&-1!==o.indexOf(e))return!0
if("groupdb"===n.type)for(let i=o.length-1;i>=0;i--)if(o[i].table===t&&o[i].uid===e)return!0
return!1}removeUsed(e){if(!this.hasObjectGroupDefinedUniqueConstraints())return
const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup]
if("select"!==t.type)return
const n=e.querySelector('[name="data['+t.table+"]["+e.dataset.objectUid+"]["+t.field+']"]'),o=v.getValuesFromHashMap(t.used)
if(null!==n){const i=n.options[n.selectedIndex].value
for(const r of o)r!==i&&v.removeSelectOptionByValue(n,r)}}setUnique(e,t){if(!this.hasObjectGroupDefinedUniqueConstraints())return
const n=document.getElementById(this.container.dataset.objectGroup+"_selector"),o=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup]
if("select"===o.type){if(!o.selector||-1!==o.max){const i=this.getFormFieldForElements(),r=this.container.dataset.objectGroup+b.structureSeparator+e
let a=v.getInlineRecordContainer(r).querySelector('[name="data['+o.table+"]["+e+"]["+o.field+']"]')
const s=v.getValuesFromHashMap(o.used)
if(null!==n){if(null!==a){for(const l of s)v.removeSelectOptionByValue(a,l)
o.selector||(t=a.options[0].value,a.options[0].selected=!0,this.updateUnique(a,i,e),this.handleChangedField(a,this.container.dataset.objectGroup+"["+e+"]"))}for(const l of s)v.removeSelectOptionByValue(a,l)
void 0!==o.used.length&&(o.used={}),o.used[e]={table:o.elTable,uid:t}}if(null!==i&&v.selectOptionValueExists(n,t)){const c=h.trimExplode(",",i.value)
for(const d of c)null!==(a=document.querySelector('[name="data['+o.table+"]["+d+"]["+o.field+']"]'))&&d!==e&&v.removeSelectOptionByValue(a,t)}}}else"groupdb"===o.type&&(o.used[e]={table:o.elTable,uid:t})
"select"===o.selector&&v.selectOptionValueExists(n,t)&&(v.removeSelectOptionByValue(n,t),o.used[e]={table:o.elTable,uid:t})}updateUnique(e,t,n){if(!this.hasObjectGroupDefinedUniqueConstraints())return
const o=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],i=o.used[n]
if("select"===o.selector){const r=document.getElementById(this.container.dataset.objectGroup+"_selector")
v.removeSelectOptionByValue(r,e.value),void 0!==i&&v.reAddSelectOption(r,i,o)}if(o.selector&&-1===o.max)return
if(!o||null===t)return
const a=h.trimExplode(",",t.value)
let s
for(const l of a)null!==(s=document.querySelector('[name="data['+o.table+"]["+l+"]["+o.field+']"]'))&&s!==e&&(v.removeSelectOptionByValue(s,e.value),void 0!==i&&v.reAddSelectOption(s,i,o))
o.used[n]=e.value}revertUnique(e){if(!this.hasObjectGroupDefinedUniqueConstraints())return
const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],n=this.container.dataset.objectGroup+b.structureSeparator+e,o=v.getInlineRecordContainer(n),i=o.querySelector('[name="data['+t.table+"]["+o.dataset.objectUid+"]["+t.field+']"]')
if("select"===t.type){let r
if(null!==i)r=i.value
else{if(""===o.dataset.tableUniqueOriginalValue)return
r=o.dataset.tableUniqueOriginalValue}if("select"===t.selector&&!isNaN(parseInt(r,10))){const a=document.getElementById(this.container.dataset.objectGroup+"_selector")
v.reAddSelectOption(a,r,t)}if(t.selector&&-1===t.max)return
const s=this.getFormFieldForElements()
if(null===s)return
const l=h.trimExplode(",",s.value)
let c
for(let d=0;d<l.length;d++)null!==(c=document.querySelector('[name="data['+t.table+"]["+l[d]+"]["+t.field+']"]'))&&v.reAddSelectOption(c,r,t)
delete t.used[e]}else"groupdb"===t.type&&delete t.used[e]}hasObjectGroupDefinedUniqueConstraints(){return void 0!==TYPO3.settings.FormEngineInline.unique&&void 0!==TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup]}handleChangedField(e,t){let n
n=e instanceof HTMLSelectElement?e.options[e.selectedIndex].text:e.value,document.getElementById(t+"_label").textContent=n.length?n:this.noTitleString}getAppearance(){if(null===this.appearance&&(this.appearance={},"string"==typeof this.container.dataset.appearance))try{this.appearance=JSON.parse(this.container.dataset.appearance)}catch(e){console.error(e)}return this.appearance}}export default v
