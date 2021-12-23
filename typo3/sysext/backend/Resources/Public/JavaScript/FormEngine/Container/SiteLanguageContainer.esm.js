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
import{MessageUtility}from"TYPO3/CMS/Backend/Utility/MessageUtility.esm.js";import{AjaxDispatcher}from"TYPO3/CMS/Backend/FormEngine/InlineRelation/AjaxDispatcher.esm.js";import NProgress from"nprogress.esm.js";import FormEngine from"TYPO3/CMS/Backend/FormEngine.esm.js";import FormEngineValidation from"TYPO3/CMS/Backend/FormEngineValidation.esm.js";import Modal from"TYPO3/CMS/Backend/Modal.esm.js";import Notification from"TYPO3/CMS/Backend/Notification.esm.js";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent.esm.js";import Severity from"TYPO3/CMS/Backend/Severity.esm.js";import Utility from"TYPO3/CMS/Backend/Utility.esm.js";var Selectors,States,Separators;!function(e){e.toggleSelector='[data-bs-toggle="formengine-inline"]',e.controlSectionSelector=".t3js-formengine-irre-control",e.createNewRecordButtonSelector=".t3js-create-new-button",e.createNewRecordBySelectorSelector=".t3js-create-new-selector",e.deleteRecordButtonSelector=".t3js-editform-delete-inline-record"}(Selectors||(Selectors={})),function(e){e.new="inlineIsNewRecord",e.visible="panel-visible",e.collapsed="panel-collapsed",e.notLoaded="t3js-not-loaded"}(States||(States={})),function(e){e.structureSeparator="-"}(Separators||(Separators={}));class SiteLanguageContainer extends HTMLElement{constructor(){super(...arguments),this.container=null,this.ajaxDispatcher=null,this.requestQueue={},this.progessQueue={},this.handlePostMessage=e=>{if(!MessageUtility.verifyOrigin(e.origin))throw"Denied message sent by "+e.origin;if("typo3:foreignRelation:insert"===e.data.actionName){if(void 0===e.data.objectGroup)throw"No object group defined for message";if(e.data.objectGroup!==this.container.dataset.objectGroup)return;if(this.isUniqueElementUsed(parseInt(e.data.uid,10)))return void Notification.error("There is already a relation to the selected element");this.importRecord([e.data.objectGroup,e.data.uid]).then(()=>{if(e.source){const t={actionName:"typo3:foreignRelation:inserted",objectGroup:e.data.objectId,table:e.data.table,uid:e.data.uid};MessageUtility.send(t,e.source)}})}}}static getInlineRecordContainer(e){return document.querySelector('[data-object-id="'+e+'"]')}static getValuesFromHashMap(e){return Object.keys(e).map(t=>e[t])}static selectOptionValueExists(e,t){return null!==e.querySelector('option[value="'+t+'"]')}static removeSelectOptionByValue(e,t){const n=e.querySelector('option[value="'+t+'"]');null!==n&&n.remove()}static reAddSelectOption(e,t,n){if(SiteLanguageContainer.selectOptionValueExists(e,t))return;const i=e.querySelectorAll("option");let o=-1;for(let e of Object.keys(n.possible)){if(e===t)break;for(let t=0;t<i.length;++t){if(i[t].value===e){o=t;break}}}-1===o?o=0:o<i.length&&o++;const a=document.createElement("option");a.text=n.possible[t],a.value=t,e.insertBefore(a,e.options[o])}static collapseExpandRecord(e){const t=SiteLanguageContainer.getInlineRecordContainer(e),n=document.querySelector('[aria-controls="'+e+'_fields"]');t.classList.contains(States.collapsed)?(t.classList.remove(States.collapsed),t.classList.add(States.visible),n.setAttribute("aria-expanded","true")):(t.classList.remove(States.visible),t.classList.add(States.collapsed),n.setAttribute("aria-expanded","false"))}connectedCallback(){const e=this.getAttribute("identifier")||"";this.container=this.querySelector("#"+e),null!==this.container&&(this.ajaxDispatcher=new AjaxDispatcher(this.container.dataset.objectGroup),this.registerEvents())}registerEvents(){this.registerCreateRecordButton(),this.registerCreateRecordBySelector(),this.registerRecordToggle(),this.registerDeleteButton(),new RegularEvent("message",this.handlePostMessage).bindTo(window)}registerCreateRecordButton(){const e=this;new RegularEvent("click",(function(t){var n,i;t.preventDefault(),t.stopImmediatePropagation();let o=e.container.dataset.objectGroup;void 0!==this.dataset.recordUid&&(o+=Separators.structureSeparator+this.dataset.recordUid),e.importRecord([o,null===(n=e.container.querySelector(Selectors.createNewRecordBySelectorSelector))||void 0===n?void 0:n.value],null!==(i=this.dataset.recordUid)&&void 0!==i?i:null)})).delegateTo(this.container,Selectors.createNewRecordButtonSelector)}registerCreateRecordBySelector(){const e=this;new RegularEvent("change",(function(t){t.preventDefault(),t.stopImmediatePropagation();const n=this.options[this.selectedIndex].getAttribute("value");e.importRecord([e.container.dataset.objectGroup,n])})).delegateTo(this.container,Selectors.createNewRecordBySelectorSelector)}registerRecordToggle(){const e=this;new RegularEvent("click",(function(t){t.preventDefault(),t.stopImmediatePropagation(),e.loadRecordDetails(this.closest(Selectors.toggleSelector).parentElement.dataset.objectId)})).delegateTo(this.container,`${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`)}registerDeleteButton(){const e=this;new RegularEvent("click",(function(t){t.preventDefault(),t.stopImmediatePropagation();const n=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?",i=TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete this record?";Modal.confirm(n,i,Severity.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no",trigger:()=>{Modal.currentModal.trigger("modal-dismiss")}},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes",trigger:()=>{e.deleteRecord(this.closest("[data-object-id]").dataset.objectId),Modal.currentModal.trigger("modal-dismiss")}}])})).delegateTo(this.container,Selectors.deleteRecordButtonSelector)}createRecord(e,t,n=null,i=null){let o=this.container.dataset.objectGroup;null!==n?(o+=Separators.structureSeparator+n,SiteLanguageContainer.getInlineRecordContainer(o).insertAdjacentHTML("afterend",t),this.memorizeAddRecord(e,n,i)):(document.getElementById(this.container.getAttribute("id")+"_records").insertAdjacentHTML("beforeend",t),this.memorizeAddRecord(e,null,i))}async importRecord(e,t){return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("site_configuration_inline_create")),e).then(async e=>{this.createRecord(e.compilerInput.uid,e.data,void 0!==t?t:null,void 0!==e.compilerInput.childChildUid?e.compilerInput.childChildUid:null)})}loadRecordDetails(e){const t=document.getElementById(e+"_fields"),n=SiteLanguageContainer.getInlineRecordContainer(e),i=void 0!==this.requestQueue[e];if(null!==t&&!n.classList.contains(States.notLoaded))SiteLanguageContainer.collapseExpandRecord(e);else{const o=this.getProgress(e,n.dataset.objectIdHash);if(i)this.requestQueue[e].abort(),delete this.requestQueue[e],delete this.progessQueue[e],o.done();else{const i=this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint("site_configuration_inline_details"));this.ajaxDispatcher.send(i,[e]).then(async i=>{delete this.requestQueue[e],delete this.progessQueue[e],n.classList.remove(States.notLoaded),t.innerHTML=i.data,SiteLanguageContainer.collapseExpandRecord(e),o.done(),FormEngine.reinitialize(),FormEngineValidation.initializeInputFields(),FormEngineValidation.validate(this.container),this.removeUsed(SiteLanguageContainer.getInlineRecordContainer(e))}),this.requestQueue[e]=i,o.start()}}}memorizeAddRecord(e,t=null,n=null){const i=this.getFormFieldForElements();if(null===i)return;let o=Utility.trimExplode(",",i.value);if(t){const n=[];for(let i=0;i<o.length;i++)o[i].length&&n.push(o[i]),t===o[i]&&n.push(e);o=n}else o.push(e);i.value=o.join(","),i.classList.add("has-change"),document.dispatchEvent(new Event("change")),this.setUnique(e,n),FormEngine.reinitialize(),FormEngineValidation.initializeInputFields(),FormEngineValidation.validate(this.container)}memorizeRemoveRecord(e){const t=this.getFormFieldForElements();if(null===t)return[];let n=Utility.trimExplode(",",t.value);const i=n.indexOf(e);return i>-1&&(delete n[i],t.value=n.join(","),t.classList.add("has-change"),document.dispatchEvent(new Event("change"))),n}deleteRecord(e,t=!1){const n=SiteLanguageContainer.getInlineRecordContainer(e),i=n.dataset.objectUid;if(n.classList.add("t3js-inline-record-deleted"),!n.classList.contains(States.new)&&!t){const e=this.container.querySelector('[name="cmd'+n.dataset.fieldName+'[delete]"]');e.removeAttribute("disabled"),n.parentElement.insertAdjacentElement("afterbegin",e)}new RegularEvent("transitionend",()=>{n.parentElement.removeChild(n),FormEngineValidation.validate(this.container)}).bindTo(n),this.revertUnique(i),this.memorizeRemoveRecord(i),n.classList.add("form-irre-object--deleted")}getProgress(e,t){const n="#"+t+"_header";let i;return void 0!==this.progessQueue[e]?i=this.progessQueue[e]:(i=NProgress,i.configure({parent:n,showSpinner:!1}),this.progessQueue[e]=i),i}getFormFieldForElements(){const e=document.getElementsByName(this.container.dataset.formField);return e.length>0?e[0]:null}isUniqueElementUsed(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];return-1!==SiteLanguageContainer.getValuesFromHashMap(t.used).indexOf(e)}removeUsed(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],n=SiteLanguageContainer.getValuesFromHashMap(t.used);let i=e.querySelector('[name="data['+t.table+"]["+e.dataset.objectUid+"]["+t.field+']"]');if(null!==i){const e=i.options[i.selectedIndex].value;for(let t of n)t!==e&&SiteLanguageContainer.removeSelectOptionByValue(i,t)}}setUnique(e,t){const n=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],i=document.getElementById(this.container.dataset.objectGroup+"_selector");if(-1!==n.max){const o=this.getFormFieldForElements(),a=this.container.dataset.objectGroup+Separators.structureSeparator+e;let r=SiteLanguageContainer.getInlineRecordContainer(a).querySelector('[name="data['+n.table+"]["+e+"]["+n.field+']"]');const s=SiteLanguageContainer.getValuesFromHashMap(n.used);if(null!==i){if(null!==r)for(let e of s)SiteLanguageContainer.removeSelectOptionByValue(r,e);for(let e of s)SiteLanguageContainer.removeSelectOptionByValue(r,e);void 0!==n.used.length&&(n.used={}),n.used[e]={table:n.elTable,uid:t}}if(null!==o&&SiteLanguageContainer.selectOptionValueExists(i,t)){const i=Utility.trimExplode(",",o.value);for(let o of i)r=document.querySelector('[name="data['+n.table+"]["+o+"]["+n.field+']"]'),null!==r&&o!==e&&SiteLanguageContainer.removeSelectOptionByValue(r,t)}}SiteLanguageContainer.selectOptionValueExists(i,t)&&(SiteLanguageContainer.removeSelectOptionByValue(i,t),n.used[e]={table:n.elTable,uid:t})}revertUnique(e){const t=TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup],n=this.container.dataset.objectGroup+Separators.structureSeparator+e,i=SiteLanguageContainer.getInlineRecordContainer(n);let o,a=i.querySelector('[name="data['+t.table+"]["+i.dataset.objectUid+"]["+t.field+']"]');if(null!==a)o=a.value;else{if(""===i.dataset.tableUniqueOriginalValue)return;o=i.dataset.tableUniqueOriginalValue.replace(t.table+"_","")}if(!isNaN(parseInt(o,10))&&0x8000000000000000!==parseInt(o,10)){const e=document.getElementById(this.container.dataset.objectGroup+"_selector");SiteLanguageContainer.reAddSelectOption(e,o,t)}if(-1===t.max)return;const r=this.getFormFieldForElements();if(null===r)return;const s=Utility.trimExplode(",",r.value);let l;for(let e=0;e<s.length;e++)l=document.querySelector('[name="data['+t.table+"]["+s[e]+"]["+t.field+']"]'),null!==l&&SiteLanguageContainer.reAddSelectOption(l,o,t);delete t.used[e]}}window.customElements.define("typo3-formengine-container-sitelanguage",SiteLanguageContainer);