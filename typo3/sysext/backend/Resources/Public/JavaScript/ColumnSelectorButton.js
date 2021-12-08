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
var ColumnSelectorButton_1,Selectors,SelectorActions,__decorate=this&&this.__decorate||function(e,t,o,l){var r,n=arguments.length,c=n<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,o):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,l);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(c=(n<3?r(c):n>3?r(t,o,c):r(t,o))||c);return n>3&&c&&Object.defineProperty(t,o,c),c};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import{SeverityEnum}from"TYPO3/CMS/Backend/Enum/Severity.js";import Severity from"TYPO3/CMS/Backend/Severity.js";import Modal from"TYPO3/CMS/Backend/Modal.js";import{lll}from"TYPO3/CMS/Core/lit-helper.js";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.js";import Notification from"TYPO3/CMS/Backend/Notification.js";!function(e){e.columnsSelector=".t3js-column-selector",e.columnsContainerSelector=".t3js-column-selector-container",e.columnsFilterSelector='input[name="columns-filter"]',e.columnsSelectorActionsSelector=".t3js-column-selector-actions"}(Selectors||(Selectors={})),function(e){e.toggle="select-toggle",e.all="select-all",e.none="select-none"}(SelectorActions||(SelectorActions={}));let ColumnSelectorButton=ColumnSelectorButton_1=class extends LitElement{constructor(){super(),this.title="Show columns",this.ok=lll("button.ok")||"Update",this.close=lll("button.close")||"Close",this.error="Could not update columns",this.addEventListener("click",e=>{e.preventDefault(),this.showColumnSelectorModal()})}static toggleSelectorActions(e,t,o,l=!1){t.classList.add("disabled");for(let o=0;o<e.length;o++)if(!e[o].disabled&&!e[o].checked&&(l||!ColumnSelectorButton_1.isColumnHidden(e[o]))){t.classList.remove("disabled");break}o.classList.add("disabled");for(let t=0;t<e.length;t++)if(!e[t].disabled&&e[t].checked&&(l||!ColumnSelectorButton_1.isColumnHidden(e[t]))){o.classList.remove("disabled");break}}static isColumnHidden(e){var t;return null===(t=e.closest(Selectors.columnsContainerSelector))||void 0===t?void 0:t.classList.contains("hidden")}static filterColumns(e,t){t.forEach(t=>{var o;const l=t.closest(Selectors.columnsContainerSelector);if(!t.disabled&&null!==l){const t=null===(o=l.querySelector(".form-check-label-text"))||void 0===o?void 0:o.textContent;t&&t.length&&l.classList.toggle("hidden",""!==e.value&&!RegExp(e.value,"i").test(t.trim().replace(/\[\]/g,"").replace(/\s+/g," ")))}})}render(){return html`<slot></slot>`}showColumnSelectorModal(){this.url&&this.target&&Modal.advanced({content:this.url,title:this.title,severity:SeverityEnum.notice,size:Modal.sizes.medium,type:Modal.types.ajax,buttons:[{text:this.close,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>Modal.dismiss()},{text:this.ok,btnClass:"btn-"+Severity.getCssClass(SeverityEnum.info),name:"update",trigger:()=>this.proccessSelection(Modal.currentModal[0])}],ajaxCallback:()=>this.handleModalContentLoaded(Modal.currentModal[0])})}proccessSelection(e){const t=e.querySelector("form");null!==t?new AjaxRequest(TYPO3.settings.ajaxUrls.show_columns).post("",{body:new FormData(t)}).then(async e=>{const t=await e.resolve();!0===t.success?(this.ownerDocument.location.href=this.target,this.ownerDocument.location.reload()):Notification.error(t.message||"No update was performed"),Modal.dismiss()}).catch(()=>{this.abortSelection()}):this.abortSelection()}handleModalContentLoaded(e){const t=e.querySelector("form");if(null===t)return;t.addEventListener("submit",e=>{e.preventDefault()});const o=e.querySelectorAll(Selectors.columnsSelector),l=e.querySelector(Selectors.columnsFilterSelector),r=e.querySelector(Selectors.columnsSelectorActionsSelector),n=r.querySelector('button[data-action="'+SelectorActions.all+'"]'),c=r.querySelector('button[data-action="'+SelectorActions.none+'"]');o.length&&null!==l&&null!==n&&null!==c&&(ColumnSelectorButton_1.toggleSelectorActions(o,n,c,!0),o.forEach(e=>{e.addEventListener("change",()=>{ColumnSelectorButton_1.toggleSelectorActions(o,n,c)})}),l.addEventListener("keydown",e=>{const t=e.target;"Escape"===e.code&&(e.stopImmediatePropagation(),t.value="")}),l.addEventListener("keyup",e=>{ColumnSelectorButton_1.filterColumns(e.target,o),ColumnSelectorButton_1.toggleSelectorActions(o,n,c)}),l.addEventListener("search",e=>{ColumnSelectorButton_1.filterColumns(e.target,o),ColumnSelectorButton_1.toggleSelectorActions(o,n,c)}),r.querySelectorAll("button[data-action]").forEach(e=>{e.addEventListener("click",e=>{e.preventDefault();const t=e.currentTarget;if(t.dataset.action){switch(t.dataset.action){case SelectorActions.toggle:o.forEach(e=>{e.disabled||ColumnSelectorButton_1.isColumnHidden(e)||(e.checked=!e.checked)});break;case SelectorActions.all:o.forEach(e=>{e.disabled||ColumnSelectorButton_1.isColumnHidden(e)||(e.checked=!0)});break;case SelectorActions.none:o.forEach(e=>{e.disabled||ColumnSelectorButton_1.isColumnHidden(e)||(e.checked=!1)});break;default:Notification.warning("Unknown selector action")}ColumnSelectorButton_1.toggleSelectorActions(o,n,c)}})}))}abortSelection(){Notification.error(this.error),Modal.dismiss()}};__decorate([property({type:String})],ColumnSelectorButton.prototype,"url",void 0),__decorate([property({type:String})],ColumnSelectorButton.prototype,"target",void 0),__decorate([property({type:String})],ColumnSelectorButton.prototype,"title",void 0),__decorate([property({type:String})],ColumnSelectorButton.prototype,"ok",void 0),__decorate([property({type:String})],ColumnSelectorButton.prototype,"close",void 0),__decorate([property({type:String})],ColumnSelectorButton.prototype,"error",void 0),ColumnSelectorButton=ColumnSelectorButton_1=__decorate([customElement("typo3-backend-column-selector-button")],ColumnSelectorButton);