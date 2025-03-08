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
import e from"@typo3/core/event/regular-event.js"
import{selector as t}from"@typo3/core/literals.js"
import{MultiRecordSelectionSelectors as l}from"@typo3/backend/multi-record-selection.js"
var i
!function(e){e.none="none",e.select="select",e.modify="modify"}(i||(i={}))
class a extends HTMLElement{constructor(){super(...arguments),this.selectStateField=null,this.modifyStateField=null}connectedCallback(){this.selectStateField=this.querySelector(t`input[name=${this.getAttribute("selectStateFieldName")||""}]`),this.modifyStateField=this.querySelector(t`input[name=${this.getAttribute("modifyStateFieldName")||""}]`),null!==this.selectStateField&&null!==this.modifyStateField&&this.registerEventHandler()}registerEventHandler(){new e("change",(e=>{this.handleSingleItemChange(e.target)})).delegateTo(this.querySelector("table"),".t3js-table-permissions-item"),new e("multiRecordSelection:checkbox:state:changed",(e=>{const l=e.target.name
if(0===this.querySelectorAll(t`input[name="${l}"]:checked`).length){const e=this.querySelector(t`input[name="${l}"]`)
e.value=i.none,this.handleSingleItemChange(e),this.querySelector(t`input[name="${l}"][value="${i.none}"]`).checked=!0}})).delegateTo(this.querySelector("table"),l.checkboxSelector)}handleSingleItemChange(e){switch(e.value){case i.select:this.addItem(e.dataset.table,this.selectStateField),this.removeItem(e.dataset.table,this.modifyStateField)
break
case i.modify:this.addItem(e.dataset.table,this.selectStateField),this.addItem(e.dataset.table,this.modifyStateField)
break
case i.none:default:this.removeItem(e.dataset.table,this.selectStateField),this.removeItem(e.dataset.table,this.modifyStateField)}}removeItem(e,t){t.value=(t.value.length?t.value.split(","):[]).filter((t=>t!==e)).join(",")}addItem(e,t){const l=t.value.length?t.value.split(","):[]
l.includes(e)||(l.push(e),t.value=l.join(","))}}window.customElements.define("typo3-formengine-element-tablepermission",a)
