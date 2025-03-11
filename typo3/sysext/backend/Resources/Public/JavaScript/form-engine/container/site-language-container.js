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
import r from"@typo3/backend/form-engine.js"
import i from"@typo3/backend/form-engine-validation.js"
import{default as n}from"@typo3/backend/modal.js"
import a from"@typo3/backend/notification.js"
import s from"@typo3/core/event/regular-event.js"
import l from"@typo3/backend/severity.js"
import c from"@typo3/backend/utility.js"
import{selector as d}from"@typo3/core/literals.js"
var u,p,m
!function(e){e.toggleSelector='[data-bs-toggle="formengine-inline"]',e.controlSectionSelector=".t3js-formengine-irre-control",e.createNewRecordButtonSelector=".t3js-create-new-button",e.createNewRecordBySelectorSelector=".t3js-create-new-selector",e.deleteRecordButtonSelector=".t3js-editform-delete-inline-record",e.createNewRecordPresetSelector=".t3js-create-new-preset"}(u||(u={})),function(e){e.new="inlineIsNewRecord",e.visible="panel-visible",e.collapsed="panel-collapsed",e.notLoaded="t3js-not-loaded"}(p||(p={})),function(e){e.structureSeparator="-"}(m||(m={}))
class h extends HTMLElement{constructor(){super(...arguments),this.container=null,this.ajaxDispatcher=null,this.requestQueue={},this.progressQueue={},this.handlePostMessage=t=>{if(!e.verifyOrigin(t.origin))throw"Denied message sent by "+t.origin
if("typo3:foreignRelation:insert"===t.data.actionName){if(void 0===t.data.objectGroup)throw"No object group defined for message"
if(t.data.objectGroup!==this.container.dataset.objectGroup)return
if(this.isUniqueElementUsed(parseInt(t.data.uid,10)))return void a.error("There is already a relation to the selected element")
this.importRecord([t.data.objectGroup,t.data.uid]).then((()=>{if(t.source){const o={actionName:"typo3:foreignRelation:inserted",objectGroup:t.data.objectId,table:t.data.table,uid:t.data.uid}
e.send(o,t.source)}}))}if("typo3:foreignRelation:delete"===t.data.actionName){if(t.data.objectGroup!==this.container.dataset.objectGroup)return
const o=t.data.directRemoval||!1,r=[t.data.objectGroup,t.data.uid].join("-")
this.deleteRecord(r,o)}}}static getInlineRecordContainer(e){return document.querySelector(d`[data-object-id="${e}"]`)}static getValuesFromHashMap(e){return Object.keys(e).map((t=>e[t]))}static selectOptionValueExists(e,t){return null!==e.querySelector(d`option[value="${t}"]`)}static removeSelectOptionByValue(e,t){const o=e.querySelector(d`option[value="${t}"]`)
null!==o&&o.remove()}static reAddSelectOption(e,t,o){if(h.selectOptionValueExists(e,t))return
const r=e.querySelectorAll("option")
let i=-1
for(const n of Object.keys(o.possible)){if(n===t)break
for(let a=0;a<r.length;++a){if(r[a].value===n){i=a
break}}}-1===i?i=1:i<r.length&&i++
const s=document.createElement("option")
s.text=o.possible[t],s.value=t,e.insertBefore(s,e.options[i])}static collapseExpandRecord(e){const t=h.getInlineRecordContainer(e),o=document.querySelector(d`[aria-controls="${e}_fields"]`)
t.classList.contains(p.collapsed)?(t.classList.remove(p.collapsed),t.classList.add(p.visible),o.setAttribute("aria-expanded","true")):(t.classList.remove(p.visible),t.classList.add(p.collapsed),o.setAttribute("aria-expanded","false"))}connectedCallback(){const e=this.getAttribute("identifier")||""
this.container=this.querySelector(d`#${e}`),null!==this.container&&(this.ajaxDispatcher=new t(this.container.dataset.objectGroup),this.registerEvents())}registerEvents(){this.registerCreateRecordButton(),this.registerCreateRecordByPresetSelector(),this.registerCreateRecordBySelector(),this.registerRecordToggle(),this.registerDeleteButton(),new s("message",this.handlePostMessage).bindTo(window)}registerCreateRecordButton(){new s("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
let o=this.container.dataset.objectGroup
void 0!==t.dataset.recordUid&&(o+=m.structureSeparator+t.dataset.recordUid),this.importRecord([o],t.dataset.recordUid??null)})).delegateTo(this.container,u.createNewRecordButtonSelector)}registerCreateRecordByPresetSelector(){new s("change",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=this.container.querySelector(u.createNewRecordPresetSelector),r=o?.value
if(""===r)return
let i=this.container.dataset.objectGroup
void 0!==t.dataset.recordUid&&(i+=m.structureSeparator+t.dataset.recordUid),o.value="",this.importRecord([i,"",r],t.dataset.recordUid??null)})).delegateTo(this.container,u.createNewRecordPresetSelector)}registerCreateRecordBySelector(){new s("change",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=t,r=o.options[o.selectedIndex].getAttribute("value")
""!==r&&this.importRecord([this.container.dataset.objectGroup,r])})).delegateTo(this.container,u.createNewRecordBySelectorSelector)}registerRecordToggle(){new s("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation(),this.loadRecordDetails(t.closest(u.toggleSelector).parentElement.dataset.objectId)})).delegateTo(this.container,`${u.toggleSelector} .form-irre-header-cell:not(${u.controlSectionSelector}`)}registerDeleteButton(){new s("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?",r=(TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete the record '%s'?").replace("%s",t.dataset.recordInfo)
n.confirm(o,r,l.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no",trigger:(e,t)=>t.hideModal()},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes",trigger:(e,o)=>{this.deleteRecord(t.closest("[data-object-id]").dataset.objectId),o.hideModal()}}])})).delegateTo(this.container,u.deleteRecordButtonSelector)}createRecord(e,t,afterUid=null,selectedValue=null){let o=this.container.dataset.objectGroup
null!==afterUid?(o+=m.structureSeparator+afterUid,h.getInlineRecordContainer(o).insertAdjacentHTML("afterend",t),this.memorizeAddRecord(e,afterUid,selectedValue)):(document.getElementById(this.container.getAttribute("id")+"_records").insertAdjacentHTML("beforeend",t),this.memorizeAddRecord(e,null,selectedValue))}async importRecord(e,t){return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("site_configuration_inline_create")),e).then((async e=>{this.createRecord(e.compilerInput.uid,e.data,void 0!==t?t:null,void 0!==e.compilerInput.childChildUid?e.compilerInput.childChildUid:null)}))}loadRecordDetails(e){const t=document.getElementById(e+"_fields"),o=h.getInlineRecordContainer(e),n=void 0!==this.requestQueue[e]
if(null!==t&&!o.classList.contains(p.notLoaded))h.collapseExpandRecord(e)
else{const a=this.getProgress(e,o.dataset.objectIdHash)
if(n)this.requestQueue[e].abort(),delete this.requestQueue[e],delete this.progressQueue[e],a.done()
else{const s=this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("site_configuration_inline_details"))
this.ajaxDispatcher.send(s,[e]).then((async n=>{delete this.requestQueue[e],delete this.progressQueue[e],o.classList.remove(p.notLoaded),t.innerHTML=n.data,h.collapseExpandRecord(e),a.done(),r.reinitialize(),i.initializeInputFields(),i.validate(this.container),this.removeUsed(h.getInlineRecordContainer(e))})),this.requestQueue[e]=s,a.start()}}}memorizeAddRecord(e,afterUid=null,selectedValue=null){const t=this.getFormFieldForElements()
if(null===t)return
let o=c.trimExplode(",",t.value)
if(afterUid){const n=[]
for(let a=0;a<o.length;a++)o[a].length&&n.push(o[a]),afterUid===o[a]&&n.push(e)
o=n}else o.push(e)
t.value=o.join(","),i.markFieldAsChanged(t),document.dispatchEvent(new Event("change")),this.setUnique(e,selectedValue),r.reinitialize(),i.initializeInputFields(),i.validate(this.container)}memorizeRemoveRecord(e){const t=this.getFormFieldForElements()
if(null===t)return[]
const o=c.trimExplode(",",t.value),r=o.indexOf(e)
return r>-1&&(o.splice(r,1),t.value=o.join(","),i.markFieldAsChanged(t),document.dispatchEvent(new Event("change"))),o}deleteRecord(e,forceDirectRemoval=!1){const t=h.getInlineRecordContainer(e),o=t.dataset.objectUid
if(t.classList.add("t3js-inline-record-deleted"),!t.classList.contains(p.new)&&!forceDirectRemoval){const r=this.container.querySelector(d`[name="cmd${t.dataset.fieldName}[delete]"]`)
r.removeAttribute("disabled"),t.parentElement.insertAdjacentElement("afterbegin",r)}new s("transitionend",(()=>{t.remove(),i.validate(this.container)})).bindTo(t),this.revertUnique(o),this.memorizeRemoveRecord(o),t.classList.add("form-irre-object--deleted")}getProgress(e,t){const r="#"+t+"_header"
let i
return void 0!==this.progressQueue[e]?i=this.progressQueue[e]:((i=o).configure({parent:r,showSpinner:!1}),this.progressQueue[e]=i),i}getFormFieldForElements(){const e=document.getElementsByName(this.container.dataset.formField)
return e.length>0?e[0]:null}isUniqueElementUsed(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup]
return-1!==h.getValuesFromHashMap(t.used).indexOf(e)}removeUsed(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],o=h.getValuesFromHashMap(t.used),r=e.querySelector('[name="data['+t.table+"]["+e.dataset.objectUid+"]["+t.field+']"]')
if(null!==r){const i=r.options[r.selectedIndex].value
for(const n of o)n!==i&&h.removeSelectOptionByValue(r,n)}}setUnique(e,t){const o=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],r=document.getElementById(this.container.dataset.objectGroup+"_selector")
if(-1!==o.max){const i=this.getFormFieldForElements(),n=this.container.dataset.objectGroup+m.structureSeparator+e
let a=h.getInlineRecordContainer(n).querySelector('[name="data['+o.table+"]["+e+"]["+o.field+']"]')
const s=h.getValuesFromHashMap(o.used)
if(null!==r){if(null!==a)for(const l of s)h.removeSelectOptionByValue(a,l)
for(const l of s)h.removeSelectOptionByValue(a,l)
void 0!==o.used.length&&(o.used={}),o.used[e]={table:o.elTable,uid:t}}if(null!==i&&h.selectOptionValueExists(r,t)){const d=c.trimExplode(",",i.value)
for(const u of d)null!==(a=document.querySelector('[name="data['+o.table+"]["+u+"]["+o.field+']"]'))&&u!==e&&h.removeSelectOptionByValue(a,t)}}h.selectOptionValueExists(r,t)&&(h.removeSelectOptionByValue(r,t),o.used[e]={table:o.elTable,uid:t})}revertUnique(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],o=this.container.dataset.objectGroup+m.structureSeparator+e,r=h.getInlineRecordContainer(o),i=r.querySelector('[name="data['+t.table+"]["+r.dataset.objectUid+"]["+t.field+']"]')
let n
if(null!==i)n=i.value
else{if(""===r.dataset.tableUniqueOriginalValue)return
n=r.dataset.tableUniqueOriginalValue.replace(t.table+"_","")}if("9223372036854775807"!==n){const a=document.getElementById(this.container.dataset.objectGroup+"_selector")
h.reAddSelectOption(a,n,t)}if(-1===t.max)return
const s=this.getFormFieldForElements()
if(null===s)return
const l=c.trimExplode(",",s.value)
let d
for(let u=0;u<l.length;u++)null!==(d=document.querySelector('[name="data['+t.table+"]["+l[u]+"]["+t.field+']"]'))&&h.reAddSelectOption(d,n,t)
delete t.used[e]}}window.customElements.define("typo3-formengine-container-sitelanguage",h)
