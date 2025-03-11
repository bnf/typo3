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
var t=function(t,e,r,a){var o,l=arguments.length,s=l<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,r):a
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,a)
else for(var n=t.length-1;n>=0;n--)(o=t[n])&&(s=(l<3?o(s):l>3?o(e,r,s):o(e,r))||s)
return l>3&&s&&Object.defineProperty(e,r,s),s}
import{LitElement as e}from"lit"
import{defaultConverter as r}from"@lit/reactive-element"
import{property as a}from"lit/decorators.js"
export const internals=Symbol("internals")
const o=Symbol("privateInternals")
export const getFormValue=Symbol("getFormValue")
export const getFormState=Symbol("getFormState")
export class BaseElement extends e{constructor(){super(...arguments),this.readonly=!1,this.debug=!1}static{this.formAssociated=!0}createRenderRoot(){return this}get[internals](){return this[o]||(this[o]=this.attachInternals()),this[o]}get form(){return this[internals].form}get labels(){return this[internals].labels}get name(){return this.getAttribute("name")??""}set name(t){this.setAttribute("name",t)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",t)}attributeChangedCallback(t,e,r){if("name"!==t&&"disabled"!==t)super.attributeChangedCallback(t,e,r)
else{const a="disabled"===t?null!==e:e
this.requestUpdate(t,a)}}requestUpdate(t,e,r){super.requestUpdate(t,e,r),"value"===t&&(this.dispatchEvent(new CustomEvent("typo3:setting:changed",{detail:{value:this.value}})),this[internals].setFormValue(this[getFormValue](),this[getFormState]()))}formDisabledCallback(t){this.disabled=t}formResetCallback(){const t=this.value,e=this.getAttribute("value")
this.attributeChangedCallback("value",this.valueToString(t),null),this.attributeChangedCallback("value",null,e)}formStateRestoreCallback(t){if("string"!=typeof t)throw new Error(`formStateRestoreCallback() needs to be implemented for <${this.localName}> for state type "${typeof t}"`)
this.attributeChangedCallback("value",this.valueToString(this.value),null),this.attributeChangedCallback("value",null,t)}[getFormState](){return this[getFormValue]()}[getFormValue](){return this.valueToString(this.value)}valueToString(t){const e=this.constructor.getPropertyOptions("value")
return("object"==typeof e.converter&&"function"==typeof e.converter?.toAttribute?e.converter.toAttribute:r.toAttribute)(t,e.type)}}t([a({type:String})],BaseElement.prototype,"key",void 0),t([a({type:String})],BaseElement.prototype,"formid",void 0),t([a({type:Boolean})],BaseElement.prototype,"readonly",void 0),t([a({type:Object})],BaseElement.prototype,"enum",void 0),t([a({type:Boolean})],BaseElement.prototype,"debug",void 0),t([a({noAccessor:!0})],BaseElement.prototype,"name",null),t([a({type:Boolean,noAccessor:!0})],BaseElement.prototype,"disabled",null)
