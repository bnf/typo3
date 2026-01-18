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
import o from"@typo3/core/document-service.js";import s from"@typo3/core/event/regular-event.js";import{selector as a}from"@typo3/core/literals.js";import{MultiRecordSelectionSelectors as m}from"@typo3/backend/multi-record-selection.js";var l;(function(n){n.none="none",n.select="select",n.modify="modify"})(l||(l={}));class d extends HTMLElement{selectStateField=null;modifyStateField=null;async connectedCallback(){await o.ready(),this.selectStateField=this.querySelector(a`input[name=${this.getAttribute("selectStateFieldName")||""}]`),this.modifyStateField=this.querySelector(a`input[name=${this.getAttribute("modifyStateFieldName")||""}]`),!(this.selectStateField===null||this.modifyStateField===null)&&this.registerEventHandler()}registerEventHandler(){new s("change",e=>{this.handleSingleItemChange(e.target)}).delegateTo(this.querySelector("table"),".t3js-table-permissions-item"),new s("multiRecordSelection:checkbox:state:changed",e=>{const t=e.target.name;if(this.querySelectorAll(a`input[name="${t}"]:checked`).length===0){const i=this.querySelector(a`input[name="${t}"]`);i.value=l.none,this.handleSingleItemChange(i),this.querySelector(a`input[name="${t}"][value="${l.none}"]`).checked=!0}}).delegateTo(this.querySelector("table"),m.checkboxSelector)}handleSingleItemChange(e){switch(e.value){case l.select:this.addItem(e.dataset.table,this.selectStateField),this.removeItem(e.dataset.table,this.modifyStateField);break;case l.modify:this.addItem(e.dataset.table,this.selectStateField),this.addItem(e.dataset.table,this.modifyStateField);break;case l.none:default:this.removeItem(e.dataset.table,this.selectStateField),this.removeItem(e.dataset.table,this.modifyStateField);break}}removeItem(e,t){t.value=(t.value.length?t.value.split(","):[]).filter(i=>i!==e).join(",")}addItem(e,t){const i=t.value.length?t.value.split(","):[];i.includes(e)||(i.push(e),t.value=i.join(","))}}window.customElements.define("typo3-formengine-element-tablepermission",d);
