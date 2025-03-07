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
var t,e,o,r=function(t,e,o,r){var n,l=arguments.length,s=l<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,r)
else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(l<3?n(s):l>3?n(e,o,s):n(e,o))||s)
return l>3&&s&&Object.defineProperty(e,o,s),s}
import{html as n,css as l,LitElement as s}from"lit"
import{customElement as a,property as i}from"lit/decorators.js"
import{SeverityEnum as c}from"@typo3/backend/enum/severity.js"
import{default as d}from"@typo3/backend/modal.js"
import{lll as u}from"@typo3/core/lit-helper.js"
import m from"@typo3/core/ajax/ajax-request.js"
import p from"@typo3/backend/notification.js"
!function(t){t.columnsSelector=".t3js-column-selector",t.columnsContainerSelector=".t3js-column-selector-container",t.columnsFilterSelector='input[name="columns-filter"]',t.columnsSelectorActionsSelector=".t3js-column-selector-actions"}(e||(e={})),function(t){t.toggle="select-toggle",t.all="select-all",t.none="select-none"}(o||(o={}))
let h=class extends s{static{t=this}static{this.styles=[l`:host{-webkit-appearance:button;-moz-appearance:button;appearance:button;cursor:pointer}`]}constructor(){super(),this.modalTitle="Show columns",this.buttonOk=u("button.ok")||"Update",this.buttonClose=u("button.close")||"Close",this.errorMessage="Could not update columns",this.addEventListener("click",(t=>{t.preventDefault(),this.showColumnSelectorModal()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.showColumnSelectorModal())}))}static toggleSelectorActions(e,o,r,n=!1){o.classList.add("disabled")
for(let r=0;r<e.length;r++)if(!e[r].disabled&&!e[r].checked&&(n||!t.isColumnHidden(e[r]))){o.classList.remove("disabled")
break}r.classList.add("disabled")
for(let o=0;o<e.length;o++)if(!e[o].disabled&&e[o].checked&&(n||!t.isColumnHidden(e[o]))){r.classList.remove("disabled")
break}}static isColumnHidden(t){return t.closest(e.columnsContainerSelector)?.classList.contains("hidden")}static filterColumns(t,o){o.forEach((o=>{const r=o.closest(e.columnsContainerSelector)
if(!o.disabled&&null!==r){const e=r.querySelector(".form-check-label")?.textContent
e&&e.length&&r.classList.toggle("hidden",""!==t.value&&!RegExp(t.value,"i").test(e.trim().replace(/\[\]/g,"").replace(/\s+/g," ")))}}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return n`<slot></slot>`}showColumnSelectorModal(){if(!this.modalUrl||!this.modalTarget)return
const t=d.advanced({content:this.modalUrl,title:this.modalTitle,severity:c.notice,size:d.sizes.medium,type:d.types.ajax,buttons:[{text:this.buttonClose,active:!0,btnClass:"btn-default",name:"cancel",trigger:(t,e)=>e.hideModal()},{text:this.buttonOk,btnClass:"btn-primary",name:"update",trigger:(t,e)=>this.processSelection(e)}],ajaxCallback:()=>this.handleModalContentLoaded(t)})}processSelection(t){const e=t.querySelector("form")
null!==e?new m(TYPO3.settings.ajaxUrls.show_columns).post(new FormData(e)).then((async t=>{const e=await t.resolve()
!0===e.success?(this.ownerDocument.location.href=this.modalTarget,this.ownerDocument.location.reload()):p.error(e.message||"No update was performed"),d.dismiss()})).catch((()=>{this.abortSelection()})):this.abortSelection()}handleModalContentLoaded(r){const n=r.querySelector("form")
if(null===n)return
n.addEventListener("submit",(t=>{t.preventDefault()}))
const l=r.querySelectorAll(e.columnsSelector),s=r.querySelector(e.columnsFilterSelector),a=r.querySelector(e.columnsSelectorActionsSelector),i=a.querySelector('button[data-action="'+o.all+'"]'),c=a.querySelector('button[data-action="'+o.none+'"]')
l.length&&null!==s&&null!==i&&null!==c&&(t.toggleSelectorActions(l,i,c,!0),l.forEach((e=>{e.addEventListener("change",(()=>{t.toggleSelectorActions(l,i,c)}))})),s.addEventListener("keydown",(t=>{const e=t.target
"Escape"===t.code&&(t.stopImmediatePropagation(),e.value="")})),s.addEventListener("keyup",(e=>{t.filterColumns(e.target,l),t.toggleSelectorActions(l,i,c)})),s.addEventListener("search",(e=>{t.filterColumns(e.target,l),t.toggleSelectorActions(l,i,c)})),a.querySelectorAll("button[data-action]").forEach((e=>{e.addEventListener("click",(e=>{e.preventDefault()
const r=e.currentTarget
if(r.dataset.action){switch(r.dataset.action){case o.toggle:l.forEach((e=>{e.disabled||t.isColumnHidden(e)||(e.checked=!e.checked)}))
break
case o.all:l.forEach((e=>{e.disabled||t.isColumnHidden(e)||(e.checked=!0)}))
break
case o.none:l.forEach((e=>{e.disabled||t.isColumnHidden(e)||(e.checked=!1)}))
break
default:p.warning("Unknown selector action")}t.toggleSelectorActions(l,i,c)}}))})))}abortSelection(){p.error(this.errorMessage),d.dismiss()}}
r([i({type:String,attribute:"data-url"})],h.prototype,"modalUrl",void 0),r([i({type:String,attribute:"data-target"})],h.prototype,"modalTarget",void 0),r([i({type:String,attribute:"data-title"})],h.prototype,"modalTitle",void 0),r([i({type:String,attribute:"data-button-ok"})],h.prototype,"buttonOk",void 0),r([i({type:String,attribute:"data-button-close"})],h.prototype,"buttonClose",void 0),r([i({type:String,attribute:"data-error-message"})],h.prototype,"errorMessage",void 0),h=t=r([a("typo3-backend-column-selector-button")],h)
export{h as ColumnSelectorButton}
