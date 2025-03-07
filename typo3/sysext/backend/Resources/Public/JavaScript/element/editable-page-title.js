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
var t=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o)
else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a)
return r>3&&a&&Object.defineProperty(e,i,a),a}
import{html as e,css as i,LitElement as o,nothing as n}from"lit"
import{customElement as r,property as a,state as s}from"lit/decorators.js"
import"@typo3/backend/element/icon-element.js"
import l from"@typo3/backend/ajax-data-handler.js"
let d=class extends o{constructor(){super(...arguments),this.pageTitle="",this.pageId=0,this.localizedPageId=0,this.editable=!1,this._isEditing=!1,this._isSubmitting=!1,this.labels={input:TYPO3?.lang?.["editablePageTitle.input.field.label"]||"Field",edit:TYPO3?.lang?.["editablePageTitle.button.edit.label"]||"Edit",save:TYPO3?.lang?.["editablePageTitle.button.save.label"]||"Save",cancel:TYPO3?.lang?.["editablePageTitle.button.cancel.label"]||"Cancel"}}static{this.styles=i`:host{display:block;--input-border-color:#bebebe;--input-hover-border-color:#bebebe;--input-focus-border-color:#bebebe;--button-border-radius:--button-color:inherit;--button-bg:transparent;--button-border-color:transparent;--button-hover-color:inherit;--button-hover-bg:#cacaca;--button-hover-border-color:#bebebe;--button-focus-color:inherit;--button-focus-bg:#cacaca;--button-focus-border-color:#bebebe}h1{display:block;overflow:hidden;padding:1px 0;text-overflow:ellipsis;white-space:nowrap}h1,input{font-family:inherit;font-size:inherit;font-weight:inherit;line-height:inherit;margin:0}input{background:transparent;border:0;border-bottom:1px dashed var(--input-border-color);border-top:1px solid transparent;outline:none;outline-offset:0;padding:0;width:100%}input:hover{--input-border-color:var(--input-hover-border-color)}input:focus{--input-border-color:var(--input-focus-border-color)}input:focus-visible{outline:.25rem solid color-mix(in srgb,var(--input-border-color),transparent 25%)}.wrapper{margin:-1px 0;position:relative}div.wrapper{-webkit-padding-end:1.5em;padding-inline-end:1.5em}form.wrapper{-webkit-padding-end:2.5em;padding-inline-end:2.5em}button{align-items:center;background:var(--button-bg);border:0;border:1px solid var(--button-border-color);border-radius:2px;color:var(--button-color);cursor:pointer;display:inline-flex;font-size:inherit;height:100%;justify-content:center;line-height:inherit;opacity:.3;outline:none;outline-offset:0;overflow:hidden;padding:0;position:absolute;top:0;transition:all .2s ease-in-out;width:1em}button:hover{opacity:1;--button-color:var(--button-hover-color);--button-bg:var(--button-hover-bg);--button-border-color:var(--button-hover-border-color)}button:focus{opacity:1;--button-color:var(--button-focus-color);--button-bg:var(--button-focus-bg);--button-border-color:var(--button-focus-border-color)}button:focus-visible{outline:.25rem solid color-mix(in srgb,var(--button-border-color),transparent 25%)}button[data-action=edit]{inset-inline-end:0}button[data-action=save]{inset-inline-end:calc(1em + 2px)}button[data-action=close]{inset-inline-end:0}.screen-reader{height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;clip:rect(0,0,0,0);border:0;white-space:nowrap}`}async startEditing(){this.isEditable()&&(this._isEditing=!0,await this.updateComplete,this.shadowRoot.querySelector("input")?.focus())}render(){if(""===this.pageTitle)return n
if(!this.isEditable())return e`<div class="wrapper"><h1>${this.pageTitle}</h1></div>`
let t
return t=this._isEditing?this.composeEditForm():e`<div class="wrapper"><h1 @dblclick="${()=>{this.startEditing()}}">${this.pageTitle}</h1>${this.composeEditButton()}</div>`,t}isEditable(){return this.editable&&this.pageId>0}endEditing(){this.isEditable()&&(this._isEditing=!1)}updatePageTitle(t){t.preventDefault()
const e=new FormData(t.target),i=Object.fromEntries(e).newPageTitle.toString()
if(this.pageTitle===i)return void this.endEditing()
this._isSubmitting=!0
let o=this.pageId
this.localizedPageId>0&&(o=this.localizedPageId)
const n={data:{pages:{[o]:{title:i}}}}
l.process(n).then((()=>{this.pageTitle=i,top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))})).finally((()=>{this.endEditing(),this._isSubmitting=!1}))}composeEditButton(){return e`<button data-action="edit" type="button" title="${this.labels.edit}" @click="${()=>{this.startEditing()}}"><typo3-backend-icon identifier="actions-open" size="small"></typo3-backend-icon><span class="screen-reader">${this.labels.edit}</span></button>`}composeEditForm(){return e`<form class="wrapper" @submit="${this.updatePageTitle}"><label class="screen-reader" for="input">${this.labels.input}</label> <input autocomplete="off" id="input" name="newPageTitle" required value="${this.pageTitle}" ?disabled="${this._isSubmitting}" @keydown="${t=>{"Escape"===t.key&&this.endEditing()}}"> <button data-action="save" type="submit" title="${this.labels.save}" ?disabled="${this._isSubmitting}"><typo3-backend-icon identifier="actions-check" size="small"></typo3-backend-icon><span class="screen-reader">${this.labels.save}</span></button> <button data-action="close" type="button" title="${this.labels.cancel}" ?disabled="${this._isSubmitting}" @click="${()=>{this.endEditing()}}"><typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon><span class="screen-reader">${this.labels.cancel}</span></button></form>`}}
t([a({type:String})],d.prototype,"pageTitle",void 0),t([a({type:Number})],d.prototype,"pageId",void 0),t([a({type:Number})],d.prototype,"localizedPageId",void 0),t([a({type:Boolean})],d.prototype,"editable",void 0),t([s()],d.prototype,"_isEditing",void 0),t([s()],d.prototype,"_isSubmitting",void 0),d=t([r("typo3-backend-editable-page-title")],d)
export{d as EditablePageTitle}
