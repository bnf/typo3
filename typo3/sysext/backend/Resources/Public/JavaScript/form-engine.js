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
import e from"@typo3/core/document-service.js"
import t from"jquery"
import n from"@typo3/backend/form-engine-validation.js"
import{default as a}from"@typo3/backend/modal.js"
import*as o from"@typo3/backend/utility/message-utility.js"
import i from"@typo3/backend/severity.js"
import*as r from"@typo3/backend/backend-exception.js"
import l from"@typo3/backend/event/interaction-request-map.js"
import c from"@typo3/backend/utility.js"
import{selector as s}from"@typo3/core/literals.js"
import"@typo3/backend/form-engine/element/extra/char-counter.js"
import d,{ModifierKeys as u}from"@typo3/backend/hotkeys.js"
import m from"@typo3/core/event/regular-event.js"
export default(function(){function f(e,t){t?g.interactionRequestMap.resolveFor(e):g.interactionRequestMap.rejectFor(e)}const p=new Map
p.set("typo3-backend-form-update-value",(e=>{const t=document.querySelector(s`[name="${e.elementName}"]`),n=document.querySelector(s`[data-formengine-input-name="${e.elementName}"]`)
g.Validation.updateInputField(e.elementName),null!==t&&(g.Validation.markFieldAsChanged(t),g.Validation.validateField(t)),null!==n&&n!==t&&g.Validation.validateField(n)})),p.set("typo3-backend-form-reload",(e=>{const t=()=>{g.Validation.suspend(),g.saveDocument(),g.Validation.resume()}
if(!e.confirmation)return void t()
const n=a.advanced({title:TYPO3.lang["FormEngine.refreshRequiredTitle"],content:TYPO3.lang["FormEngine.refreshRequiredContent"],severity:i.warning,staticBackdrop:!0,buttons:[{text:TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{n.hideModal()}},{text:TYPO3.lang["button.ok"]||"OK",btnClass:"btn-"+i.getCssClass(i.warning),name:"ok",trigger:()=>{g.closeModalsRecursive(),t()}}]})})),p.set("typo3-backend-form-update-bitmask",((e,t)=>{const n=t.target,a=g.formElement[e.elementName],o=n.checked!==e.invert,i=Math.pow(2,e.position),r=Math.pow(2,e.total)-i-1
a.value=o?a.value|i:a.value&r,a.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))}))
const g={consumeTypes:["typo3.setUrl","typo3.beforeSetUrl","typo3.refresh"],Validation:n,interactionRequestMap:l,formName:TYPO3.settings.FormEngine.formName,formElement:void 0,openedPopupWindow:null,browserUrl:"",doSaveFieldName:""}
return Object.defineProperty(g,"formElement",{get:()=>document.forms.namedItem(g.formName),enumerable:!0,configurable:!1}),g.openPopupWindow=function(e,t,n){const o={mode:e,bparams:t}
return n&&("db"===e?o.expandPage=n:o.expandFolder=n),a.advanced({type:a.types.iframe,content:g.browserUrl+"&"+new URLSearchParams(o).toString(),size:a.sizes.large})},g.setSelectOptionFromExternalSource=function(e,n,a,o,i=[],r=void 0){let l,c,d=!1,u=!1
c=g.getFieldElement(e),l=c.get(0)
const m=c.get(0)
if(null===m||"--div--"===n||m instanceof HTMLOptGroupElement)return
const f=g.getFieldElement(e,"_list",!0)
if(f.length>0&&(c=f,l=c.get(0),d=c.prop("multiple")&&"1"!=c.prop("size"),u=!0),d||u){const u=g.getFieldElement(e,"_avail"),f=u.get(0)
if(!d){for(const e of l.querySelectorAll("option")){const n=u.find(s`option[value="${t(e).attr("value")}"]`)
n.length&&(n.removeClass("hidden").prop("disabled",!1),g.enableOptGroup(n.get(0)))}c.empty()}if(i.length>0){let e=!1;(i.includes(n)||1==c.find("option").length&&i.includes(c.find("option").prop("value")))&&(c.empty(),e=!0),e&&void 0!==r&&r.closest("select").querySelectorAll("[disabled]").forEach((function(e){e.classList.remove("hidden"),e.disabled=!1,g.enableOptGroup(e)}))}let p=!0
const h=g.getFieldElement(e,"_mul",!0)
if(0==h.length||0==h.val()){for(const e of l.querySelectorAll("option"))if(e.value==n){p=!1
break}if(p&&void 0!==r){r.classList.add("hidden"),r.disabled=!0
const e=r.parentElement
e instanceof HTMLOptGroupElement&&0===e.querySelectorAll("option:not([disabled]):not([hidden]):not(.hidden)").length&&(e.disabled=!0,e.classList.add("hidden"))}}if(p){const e=t("<option></option>")
e.attr({value:n,title:o}).text(a),e.appendTo(c),g.updateHiddenFieldValueFromSelect(l,m),g.Validation.markFieldAsChanged(m),g.Validation.validateField(l),g.Validation.validateField(f)}}else{const e=/_(\d+)$/,t=n.toString().match(e)
null!=t&&(n=t[1]),c.val(n),g.Validation.validateField(l)}},g.updateHiddenFieldValueFromSelect=function(e,t){const n=Array.from(e.options).map((e=>e.value))
t.value=n.join(","),t.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},g.getFieldElement=function(e,n,a){if(n){let o
switch(n){case"_list":o=t(s`:input[data-formengine-input-name="${e}"]:not([type=hidden])`,g.formElement)
break
case"_avail":o=t(s`:input[data-relatedfieldname="${e}"]`,g.formElement)
break
case"_mul":o=t(s`:input[type=hidden][data-formengine-input-name="${e}"]`,g.formElement)
break
default:o=null}if(o&&o.length>0||!0===a)return o}return t(g.formElement.elements.namedItem(e))},g.initializeEvents=function(){top.TYPO3&&void 0!==top.TYPO3.Backend&&(top.TYPO3.Backend.consumerScope.attach(g),window.addEventListener("pagehide",(()=>top.TYPO3.Backend.consumerScope.detach(g)),{once:!0})),new m("click",(e=>{e.preventDefault(),g.preventExitIfNotSaved(g.preventExitIfNotSavedCallback)})).delegateTo(document,".t3js-editform-close"),new m("click",(e=>{e.preventDefault(),g.previewAction(e,g.previewActionCallback)})).delegateTo(document,".t3js-editform-view"),new m("click",(e=>{e.preventDefault(),g.newAction(e,g.newActionCallback)})).delegateTo(document,".t3js-editform-new"),new m("click",(e=>{e.preventDefault(),g.duplicateAction(e,g.duplicateActionCallback)})).delegateTo(document,".t3js-editform-duplicate"),new m("click",(e=>{e.preventDefault(),g.deleteAction(e,g.deleteActionCallback)})).delegateTo(document,".t3js-editform-delete-record"),new m("change",((e,t)=>{t.closest(".t3js-formengine-field-item").classList.toggle("disabled")})).delegateTo(document,'.t3-form-field-eval-null-checkbox input[type="checkbox"]'),new m("change",((e,t)=>{g.toggleCheckboxField(t),g.Validation.markFieldAsChanged(t)})).delegateTo(document,'.t3js-form-field-eval-null-placeholder-checkbox input[type="checkbox"]'),new m("click",((e,t)=>{e.preventDefault(),e.stopPropagation()
const n=t.dataset.mode,a=t.dataset.params,o=t.dataset.entryPoint
g.openPopupWindow(n,a,o)})).delegateTo(document,".t3js-element-browser"),new m("click",((e,t)=>{const n=JSON.parse(t.dataset.formengineFieldChangeItems)
g.processOnFieldChange(n,e)})).delegateTo(document,'[data-formengine-field-change-event="click"]'),new m("change",((e,t)=>{const n=JSON.parse(t.dataset.formengineFieldChangeItems)
g.processOnFieldChange(n,e)})).delegateTo(document,'[data-formengine-field-change-event="change"]'),g.formElement.addEventListener("submit",(function(e){const t=e.target
if("0"===t.closeDoc?.value&&null!==e.submitter&&("A"===e.submitter.tagName||e.submitter.hasAttribute("form"))&&!e.defaultPrevented){const e=t.querySelector(s`input[name="${g.doSaveFieldName}"]`)
null!==e&&(e.value="1")}})),window.addEventListener("message",g.handlePostMessage)},g.consume=function(e){if(!e)throw new r.BackendException("No interaction request given",1496589980)
let t
const n=new Promise(((e,n)=>{t={resolve:e,reject:n}}))
if(e.concernsTypes(g.consumeTypes)){const n=e.outerMostRequest
g.interactionRequestMap.attachFor(n,t),n.isProcessed()?f(n,n.getProcessedData().response):g.hasChange()||g.isNew()?g.preventExitIfNotSaved((function(e){n.setProcessedData({response:e}),f(n,e)})):g.interactionRequestMap.resolveFor(n)}return n},g.handlePostMessage=function(e){if(!o.MessageUtility.verifyOrigin(e.origin))throw"Denied message sent by "+e.origin
if("typo3:elementBrowser:elementAdded"===e.data.actionName){if(void 0===e.data.fieldName)throw"fieldName not defined in message"
if(void 0===e.data.value)throw"value not defined in message"
const t=e.data.label||e.data.value,n=e.data.title||t,a=c.trimExplode(",",e.data?.exclusiveValues??"")
g.setSelectOptionFromExternalSource(e.data.fieldName,e.data.value,t,n,a)}},g.initializeRemainingCharacterViews=function(){document.querySelectorAll('[maxlength]:not([data-input-type="datetimepicker"]):not(.t3js-color-picker)').forEach((e=>{const t=e.closest(".t3js-formengine-field-item")
if(null!==t&&null===t.querySelector("typo3-backend-formengine-char-counter")){const n=document.createElement("typo3-backend-formengine-char-counter")
n.setAttribute("target",`[data-formengine-input-name="${s`${e.dataset.formengineInputName}`}"]`),t.append(n)}}))},g.initializeMinimumCharactersLeftViews=function(){const e=(e,t)=>{const n=t.currentTarget.closest(".t3js-formengine-field-item"),a=n.querySelector(".t3js-charcounter-min"),o=TYPO3.lang["FormEngine.minCharactersLeft"].replace("{0}",e)
if(a)a.querySelector("span").innerHTML=o
else{const e=document.createElement("div")
e.classList.add("t3js-charcounter-min")
const t=document.createElement("span")
t.classList.add("badge","badge-danger"),t.innerHTML=o,e.append(t)
let a=n.querySelector(".t3js-charcounter-wrapper")
a||(a=document.createElement("div"),a.classList.add("t3js-charcounter-wrapper"),n.append(a)),a.prepend(e)}},t=e=>{const t=e.currentTarget.closest(".t3js-formengine-field-item").querySelector(".t3js-charcounter-min")
t&&t.remove()}
document.querySelectorAll('[minlength]:not([data-input-type="datetimepicker"]):not(.t3js-charcounter-min-initialized)').forEach((n=>{n.addEventListener("focus",(t=>{const a=g.getMinCharacterLeftCount(n)
a>0&&e(a,t)})),n.addEventListener("blur",t),n.addEventListener("keyup",(a=>{const o=g.getMinCharacterLeftCount(n)
o>0?e(o,a):t(a)}))}))},g.getMinCharacterLeftCount=function(e){const t=e.value,n=e.minLength,a=t.length
if(0===a)return 0
return n-a-(t.match(/\n/g)||[]).length},g.initializeNullNoPlaceholderCheckboxes=function(){document.querySelectorAll(".t3-form-field-eval-null-checkbox").forEach((e=>{const t=e.querySelector('input[type="checkbox"]'),n=e.closest(".t3js-formengine-field-item")
t.checked||n.classList.add("disabled")}))},g.initializeNullWithPlaceholderCheckboxes=function(){document.querySelectorAll(".t3js-form-field-eval-null-placeholder-checkbox").forEach((e=>{g.toggleCheckboxField(e.querySelector('input[type="checkbox"]'),!1)}))},g.toggleCheckboxField=function(e,t=!0){const n=e.closest(".t3js-formengine-field-item"),a=n.querySelector(".t3js-formengine-placeholder-placeholder"),o=n.querySelector(".t3js-formengine-placeholder-formfield")
e.checked?(a.hidden=!0,o.hidden=!1,t&&o.querySelector("input,select,textarea")?.focus()):(a.hidden=!1,o.hidden=!0)},g.reinitialize=function(){const e=document.querySelectorAll(".t3js-clearable")
e.length>0&&import("@typo3/backend/input/clearable.js").then((function(){e.forEach((e=>e.clearable()))})),g.initializeNullNoPlaceholderCheckboxes(),g.initializeNullWithPlaceholderCheckboxes(),g.initializeLocalizationStateSelector(),g.initializeMinimumCharactersLeftViews(),g.initializeRemainingCharacterViews()},g.initializeLocalizationStateSelector=function(){document.querySelectorAll(".t3js-l10n-state-container").forEach((e=>{const t=e.closest(".t3js-formengine-field-item")?.querySelector("[data-formengine-input-name]")
if(null==t)return
const n=e.querySelector('input[type="radio"]:checked')?.value
void 0===n&&console.warn("The localization state of the field "+t.dataset.formengineInputName+" cannot be determined. This smells like a DataHandler bug."),"parent"!==n&&"source"!==n||(t.disabled=!0)}))},g.hasChange=function(){const e=t(s`form[name="${g.formName}"] .has-change`).length>0,n=t('[name^="data["].has-change').length>0
return e||n},g.isNew=function(){return null!==document.querySelector('form[name="'+g.formName+'"] .typo3-TCEforms.is-new')},g.preventExitIfNotSavedCallback=()=>{g.closeDocument()},g.preventFollowLinkIfNotSaved=function(e){return g.preventExitIfNotSaved((function(){window.location.href=e})),!1},g.preventExitIfNotSaved=function(e){if(e=e||g.preventExitIfNotSavedCallback,g.hasChange()||g.isNew()){const n=TYPO3.lang["label.confirm.close_without_save.title"]||"Unsaved changes",o=TYPO3.lang["label.confirm.close_without_save.content"]||"You currently have unsaved changes which will be discarded if you close without saving.",r=[{text:TYPO3.lang["buttons.confirm.close_without_save.no"]||"Keep editing",btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.close_without_save.yes"]||"Discard changes",btnClass:"btn-default",name:"yes"}]
0===t(".has-error").length&&r.push({text:TYPO3.lang["buttons.confirm.save_and_close"]||"Save and close",btnClass:"btn-primary",name:"save",active:!0})
const l=a.confirm(n,o,i.warning,r)
l.addEventListener("button.clicked",(function(t){"no"===t.target.name?l.hideModal():"yes"===t.target.name?(l.hideModal(),e.call(null,!0)):"save"===t.target.name&&(l.hideModal(),g.saveAndCloseDocument())}))}else e.call(null,!0)},g.preventSaveIfHasErrors=function(){if(t(".has-error").length>0){const e=TYPO3.lang["label.alert.save_with_error.title"]||"You have errors in your form!",t=TYPO3.lang["label.alert.save_with_error.content"]||"Please check the form, there is at least one error in your form.",n=a.confirm(e,t,i.error,[{text:TYPO3.lang["buttons.alert.save_with_error.ok"]||"OK",btnClass:"btn-danger",name:"ok"}])
return n.addEventListener("button.clicked",(function(e){"ok"===e.target.name&&n.hideModal()})),!1}return!0},g.processOnFieldChange=function(e,t){e.forEach((e=>{const n=p.get(e.name)
n instanceof Function&&n.call(null,e.data||null,t)}))},g.registerOnFieldChangeHandler=function(e,t){p.has(e)&&console.warn("Handler for onFieldChange name `"+e+"` has been overridden."),p.set(e,t)},g.closeModalsRecursive=function(){void 0!==a.currentModal&&null!==a.currentModal&&(a.currentModal.addEventListener("typo3-modal-hidden",(function(){g.closeModalsRecursive()})),a.currentModal.hideModal())},g.previewAction=function(e,n){n=n||g.previewActionCallback
const a=e.currentTarget.href,o="isNew"in e.target.dataset,i=t("<input />").attr("type","hidden").attr("name","_savedokview").attr("value","1")
g.hasChange()||g.isNew()?g.showPreviewModal(a,o,i,n):(t(s`form[name="${g.formName}"]`).append(i),window.open("","newTYPO3frontendWindow"),g.formElement.submit())},g.previewActionCallback=function(e,n,o){switch(a.dismiss(),e){case"discard":const e=window.open(n,"newTYPO3frontendWindow")
e.focus(),c.urlsPointToSameServerSideResource(e.location.href,n)&&e.location.reload()
break
case"save":t(s`form[name="${g.formName}"]`).append(t(o)),window.open("","newTYPO3frontendWindow"),g.saveDocument()}},g.showPreviewModal=function(e,t,n,o){const r=TYPO3.lang["label.confirm.view_record_changed.title"]||"Do you want to save before viewing?",l={text:TYPO3.lang["buttons.confirm.view_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},c={text:TYPO3.lang["buttons.confirm.view_record_changed.no-save"]||"View without changes",btnClass:"btn-default",name:"discard"},s={text:TYPO3.lang["buttons.confirm.view_record_changed.save"]||"Save changes and view",btnClass:"btn-primary",name:"save",active:!0}
let d=[],u=""
t?(d=[l,s],u=TYPO3.lang["label.confirm.view_record_changed.content.is-new-page"]||"You need to save your changes before viewing the page. Do you want to save and view them now?"):(d=[l,c,s],u=TYPO3.lang["label.confirm.view_record_changed.content"]||"You currently have unsaved changes. You can either discard these changes or save and view them.")
const m=a.confirm(r,u,i.info,d)
m.addEventListener("button.clicked",(function(t){o(t.target.name,e,n,m)}))},g.newAction=function(e,n){n=n||g.newActionCallback
const a=t("<input />").attr("type","hidden").attr("name","_savedoknew").attr("value","1"),o="isNew"in e.target.dataset
g.hasChange()||g.isNew()?g.showNewModal(o,a,n):(t(s`form[name="${g.formName}"]`).append(a),g.formElement.submit())},g.newActionCallback=function(e,n){const o=t(s`form[name="${g.formName}"]`)
switch(a.dismiss(),e){case"no":o.append(n),g.formElement.submit()
break
case"yes":o.append(n),g.saveDocument()}},g.showNewModal=function(e,t,n){const o=TYPO3.lang["label.confirm.new_record_changed.title"]||"Do you want to save before adding?",r=TYPO3.lang["label.confirm.new_record_changed.content"]||"You need to save your changes before creating a new record. Do you want to save and create now?"
let l=[]
const c={text:TYPO3.lang["buttons.confirm.new_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},s={text:TYPO3.lang["buttons.confirm.new_record_changed.no"]||"No, just add",btnClass:"btn-default",name:"no"},d={text:TYPO3.lang["buttons.confirm.new_record_changed.yes"]||"Yes, save and create now",btnClass:"btn-primary",name:"yes",active:!0}
l=e?[c,d]:[c,s,d]
a.confirm(o,r,i.info,l).addEventListener("button.clicked",(function(e){n(e.target.name,t)}))},g.duplicateAction=function(e,n){n=n||g.duplicateActionCallback
const a=t("<input />").attr("type","hidden").attr("name","_duplicatedoc").attr("value","1"),o="isNew"in e.target.dataset
g.hasChange()||g.isNew()?g.showDuplicateModal(o,a,n):(t(s`form[name="${g.formName}"]`).append(a),g.formElement.submit())},g.duplicateActionCallback=function(e,n){const o=t(s`form[name="${g.formName}"]`)
switch(a.dismiss(),e){case"no":o.append(n),g.formElement.submit()
break
case"yes":o.append(n),g.saveDocument()}},g.showDuplicateModal=function(e,t,n){const o=TYPO3.lang["label.confirm.duplicate_record_changed.title"]||"Do you want to save before duplicating this record?",r=TYPO3.lang["label.confirm.duplicate_record_changed.content"]||"You currently have unsaved changes. Do you want to save your changes before duplicating this record?"
let l=[]
const c={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},s={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.no"]||"No, just duplicate the original",btnClass:"btn-default",name:"no"},d={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.yes"]||"Yes, save and duplicate this record",btnClass:"btn-primary",name:"yes",active:!0}
l=e?[c,d]:[c,s,d]
a.confirm(o,r,i.info,l).addEventListener("button.clicked",(function(e){n(e.target.name,t)}))},g.deleteAction=function(e,n){n=n||g.deleteActionCallback
const a=t(e.target)
g.showDeleteModal(a,n)},g.deleteActionCallback=function(e,t){a.dismiss(),"yes"===e&&g.invokeRecordDeletion(t)},g.showDeleteModal=function(e,t){const n=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?"
let o=(TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete the record '%s'?").replace("%s",e.data("record-info"))
e.data("reference-count-message")&&(o+="\n"+e.data("reference-count-message")),e.data("translation-count-message")&&(o+="\n"+e.data("translation-count-message"))
a.confirm(n,o,i.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes",active:!0}]).addEventListener("button.clicked",(function(n){t(n.target.name,e)}))},g.enableOptGroup=function(e){const t=e.parentElement
t instanceof HTMLOptGroupElement&&t.querySelectorAll("option:not([hidden]):not([disabled]):not(.hidden)").length&&(t.hidden=!1,t.disabled=!1,t.classList.remove("hidden"))},g.closeDocument=function(){g.formElement.closeDoc.value=1,g.formElement.submit()},g.saveDocument=function(){const e=document.activeElement;(e instanceof HTMLInputElement||e instanceof HTMLSelectElement||e instanceof HTMLTextAreaElement)&&e.blur()
const t=g.formElement.querySelector(s`input[name="${g.doSaveFieldName}"]`)
null!==t&&(t.value="1"),g.formElement.requestSubmit()},g.saveAndCloseDocument=function(){const e=document.createElement("input")
e.type="hidden",e.name="_saveandclosedok",e.value="1",document.querySelector(s`form[name="${g.formName}"]`).append(e),g.saveDocument()},g.initialize=function(n,a){g.browserUrl=n,g.doSaveFieldName=a||"doSave",e.ready().then((()=>{g.initializeEvents(),g.Validation.initialize(g.formElement),g.reinitialize(),t("#t3js-ui-block").remove(),d.setScope("backend/form-engine"),d.register([d.normalizedCtrlModifierKey,"s"],(e=>{e.preventDefault(),g.saveDocument()}),{scope:"backend/form-engine",allowOnEditables:!0,bindElement:g.formElement._savedok}),d.register([d.normalizedCtrlModifierKey,u.SHIFT,"s"],(e=>{e.preventDefault(),g.saveAndCloseDocument()}),{scope:"backend/form-engine",allowOnEditables:!0})}))},g.invokeRecordDeletion=function(e){window.location.href=e.attr("href")},TYPO3.FormEngine=g,g}())
