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
import e from"@typo3/backend/notification.js"
import t from"@typo3/core/document-service.js"
import c from"@typo3/core/event/regular-event.js"
import{selector as o}from"@typo3/core/literals.js"
export var MultiRecordSelectionSelectors
var i,n,l
!function(e){e.actionsSelector=".t3js-multi-record-selection-actions",e.checkboxSelector=".t3js-multi-record-selection-check",e.checkboxActionsSelector=".t3js-multi-record-selection-check-actions",e.checkboxActionsToggleSelector=".t3js-multi-record-selection-check-actions-toggle",e.elementSelector="[data-multi-record-selection-element]"}(MultiRecordSelectionSelectors||(MultiRecordSelectionSelectors={})),function(e){e.actionButton="button[data-multi-record-selection-action]",e.checkboxActionButton="button[data-multi-record-selection-check-action]"}(i||(i={})),function(e){e.checkAll="check-all",e.checkNone="check-none",e.toggle="toggle"}(n||(n={})),function(e){e.any="",e.checked=":checked",e.unchecked=":not(:checked)"}(l||(l={}))
class r{static{this.activeClass="active"}constructor(){this.lastChecked=null,t.ready().then((()=>{r.restoreTemporaryState(),this.registerActions(),this.registerActionsEventHandlers(),this.registerCheckboxActions(),this.registerCheckboxKeyboardActions(),this.registerCheckboxTableRowSelectionAction(),this.registerToggleCheckboxActions(),this.registerDispatchCheckboxStateChangedEvent(),this.registerCheckboxStateChangedEventHandler()}))}static getCheckboxes(state=l.any,identifier=""){return document.querySelectorAll(r.getCombinedSelector(MultiRecordSelectionSelectors.checkboxSelector+state,identifier))}static getCombinedSelector(e,t){return""!==t?[o`[data-multi-record-selection-identifier="${t}"]`,e].join(" "):e}static getIdentifier(e){return e.closest("[data-multi-record-selection-identifier]")?.dataset.multiRecordSelectionIdentifier||""}static changeCheckboxState(e,t){e.disabled||e.checked===t||e.dataset.manuallyChanged||(e.checked=t,e.dispatchEvent(new CustomEvent("change",{bubbles:!0})),e.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{detail:{identifier:r.getIdentifier(e)},bubbles:!0,cancelable:!1})))}static restoreTemporaryState(){const e=r.getCheckboxes(l.checked)
if(!e.length)return
let t=!1
const c=[]
e.forEach((e=>{e.closest(MultiRecordSelectionSelectors.elementSelector)?.classList.add(r.activeClass)
const o=r.getIdentifier(e)
""===o||c.includes(o)||(c.push(o),t=!0,r.toggleActionsState(o))})),t||r.toggleActionsState()}static toggleActionsState(identifier=""){const e=document.querySelectorAll(r.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector,identifier))
if(!e.length)return
if(!r.getCheckboxes(l.checked,identifier).length)return void e.forEach((e=>r.changeActionContainerVisibility(e,!1)))
e.forEach((e=>r.changeActionContainerVisibility(e)))
const t=document.querySelectorAll([r.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector,identifier),i.actionButton].join(" "))
t.length&&t.forEach((e=>{if(!e.dataset.multiRecordSelectionActionConfig)return
const t=JSON.parse(e.dataset.multiRecordSelectionActionConfig)
if(!t.idField)return
e.disabled=!0
const c=r.getCheckboxes(l.checked,identifier)
for(let o=0;o<c.length;o++)if(c[o].closest(MultiRecordSelectionSelectors.elementSelector)?.dataset[t.idField]){e.disabled=!1
break}}))}static changeActionContainerVisibility(e,visible=!0){const t=e.closest(".multi-record-selection-panel")?.children
if(visible){if(t)for(let c=0;c<t.length;c++)t[c].classList.add("hidden")
e.classList.remove("hidden")}else{if(t)for(c=0;c<t.length;c++)t[c].classList.remove("hidden")
e.classList.add("hidden")}}static unsetManuallyChangedAttribute(e){r.getCheckboxes(l.any,e).forEach((e=>{e.removeAttribute("data-manually-changed")}))}registerActions(){new c("click",((e,t)=>{t.dataset.multiRecordSelectionAction
const c=r.getIdentifier(t),o=JSON.parse(t.dataset.multiRecordSelectionActionConfig||"{}"),i=r.getCheckboxes(l.checked,c)
i.length&&t.dispatchEvent(new CustomEvent("multiRecordSelection:action:"+t.dataset.multiRecordSelectionAction,{detail:{identifier:c,checkboxes:i,configuration:o},bubbles:!0,cancelable:!1}))})).delegateTo(document,[MultiRecordSelectionSelectors.actionsSelector,i.actionButton].join(" "))}registerActionsEventHandlers(){new c("multiRecordSelection:actions:show",(e=>{const t=e.detail?.identifier||""
document.querySelectorAll(r.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector,t)).forEach((e=>r.changeActionContainerVisibility(e)))})).bindTo(document),new c("multiRecordSelection:actions:hide",(e=>{const t=e.detail?.identifier||""
document.querySelectorAll(r.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector,t)).forEach((e=>r.changeActionContainerVisibility(e,!1)))})).bindTo(document)}registerCheckboxActions(){new c("click",((t,c)=>{if(t.preventDefault(),!c.dataset.multiRecordSelectionCheckAction)return
const o=r.getIdentifier(c),i=r.getCheckboxes(l.any,o)
if(i.length){switch(r.unsetManuallyChangedAttribute(o),c.dataset.multiRecordSelectionCheckAction){case n.checkAll:i.forEach((e=>{r.changeCheckboxState(e,!0)}))
break
case n.checkNone:i.forEach((e=>{r.changeCheckboxState(e,!1)}))
break
case n.toggle:i.forEach((e=>{r.changeCheckboxState(e,!e.checked)}))
break
default:e.warning("Unknown checkbox action")}r.unsetManuallyChangedAttribute(o)}})).delegateTo(document,[MultiRecordSelectionSelectors.checkboxActionsSelector,i.checkboxActionButton].join(" "))}registerCheckboxKeyboardActions(){new c("click",((e,t)=>this.handleCheckboxKeyboardActions(e,t))).delegateTo(document,MultiRecordSelectionSelectors.checkboxSelector)}registerCheckboxTableRowSelectionAction(){new c("click",((e,t)=>{const c=e.target.tagName
if("TH"!==c&&"TD"!==c)return
const o=t.querySelector(MultiRecordSelectionSelectors.checkboxSelector)
null!==o&&(r.changeCheckboxState(o,!o.checked),this.handleCheckboxKeyboardActions(e,o,!1))})).delegateTo(document,MultiRecordSelectionSelectors.elementSelector),new c("mousedown",(e=>(e.shiftKey||e.altKey||e.ctrlKey)&&e.preventDefault())).delegateTo(document,MultiRecordSelectionSelectors.elementSelector)}registerDispatchCheckboxStateChangedEvent(){new c("change",((e,t)=>{t.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{detail:{identifier:r.getIdentifier(t)},bubbles:!0,cancelable:!1}))})).delegateTo(document,MultiRecordSelectionSelectors.checkboxSelector)}registerCheckboxStateChangedEventHandler(){new c("multiRecordSelection:checkbox:state:changed",(e=>{const t=e.target,c=e.detail?.identifier||""
t.checked?t.closest(MultiRecordSelectionSelectors.elementSelector).classList.add(r.activeClass):t.closest(MultiRecordSelectionSelectors.elementSelector).classList.remove(r.activeClass),r.toggleActionsState(c)})).bindTo(document)}registerToggleCheckboxActions(){new c("click",((e,t)=>{const c=r.getIdentifier(t),o=document.querySelector([r.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector,c),'button[data-multi-record-selection-check-action="'+n.checkAll+'"]'].join(" "))
null!==o&&(o.disabled=!r.getCheckboxes(l.unchecked,c).length)
const i=document.querySelector([r.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector,c),'button[data-multi-record-selection-check-action="'+n.checkNone+'"]'].join(" "))
null!==i&&(i.disabled=!r.getCheckboxes(l.checked,c).length)
const s=document.querySelector([r.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector,c),'button[data-multi-record-selection-check-action="'+n.toggle+'"]'].join(" "))
null!==s&&(s.disabled=!r.getCheckboxes(l.any,c).length)})).delegateTo(document,MultiRecordSelectionSelectors.checkboxActionsToggleSelector)}handleCheckboxKeyboardActions(e,t,cleanUpState=!0){const c=r.getIdentifier(t)
if(this.lastChecked&&document.body.contains(this.lastChecked)&&r.getIdentifier(this.lastChecked)===c&&(e.shiftKey||e.altKey||e.ctrlKey)){if(cleanUpState&&r.unsetManuallyChangedAttribute(c),e.shiftKey){const o=Array.from(r.getCheckboxes(l.any,c)),i=o.indexOf(t),n=o.indexOf(this.lastChecked)
o.slice(Math.min(i,n),Math.max(i,n)+1).forEach((e=>{e!==t&&r.changeCheckboxState(e,t.checked)}))}this.lastChecked=t,(e.altKey||e.ctrlKey)&&r.getCheckboxes(l.any,c).forEach((e=>{e!==t&&r.changeCheckboxState(e,!e.checked)})),r.unsetManuallyChangedAttribute(c)}else this.lastChecked=t}}export default new r
