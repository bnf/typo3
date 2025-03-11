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
var t=function(t,o,e,r){var s,i=arguments.length,n=i<3?o:null===r?r=Object.getOwnPropertyDescriptor(o,e):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,o,e,r)
else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(n=(i<3?s(n):i>3?s(o,e,n):s(o,e))||n)
return i>3&&n&&Object.defineProperty(o,e,n),n}
import{customElement as o,property as e,query as r}from"lit/decorators.js"
import{css as s,html as i,LitElement as n}from"lit"
import l from"alwan"
import c from"@typo3/core/event/regular-event.js"
let a=class extends n{constructor(){super(...arguments),this.color="",this.opacity=!1,this.swatches=""}static{this.styles=s`:host{display:inline-block;position:relative}.color-picker-preview{background:var(--alwan-pattern);border-radius:3px!important;display:block;height:1.25rem;inset-inline-start:var(--typo3-input-sm-padding-x);pointer-events:none;position:absolute;top:50%;transform:translateY(-50%);width:1.25rem;z-index:10}.color-picker-preview-color{background-color:var(--color,transparent);border-radius:2px;inset:0;position:absolute}`}firstUpdated(){const t=this.getInputElement()
if(t){if(!t.value&&this.color?t.value=this.color:this.color=t.value,t.disabled||t.readOnly)return
const o=new l(t,{position:"bottom-start",format:"hex",opacity:this.opacity,swatches:this.swatches?this.swatches.split(";"):[],preset:!1,color:this.color})
o.on("color",(o=>{this.color=o.hex,t.value=this.color,t.dispatchEvent(new Event("blur"))})),["input","change"].forEach((e=>{new c(e,(t=>{const e=t.target
this.color=e.value,o.setColor(this.color)})).bindTo(t)}))}}render(){return i`<slot></slot><span style="--color:${this.color}" class="color-picker-preview"><span class="color-picker-preview-color"></span></span>`}getInputElement(){const t=this.slotEl.assignedNodes()
for(const o of t)if(o instanceof HTMLInputElement)return o
return console.warn("No input element found in the slot."),null}}
t([e({type:String})],a.prototype,"color",void 0),t([e({type:Boolean})],a.prototype,"opacity",void 0),t([e({type:String})],a.prototype,"swatches",void 0),t([r("slot")],a.prototype,"slotEl",void 0),a=t([o("typo3-backend-color-picker")],a)
export{a as Typo3BackendColorPicker}
export default new class{initialize(t,options={}){if(t.parentElement instanceof a)return
const o=document.createElement("typo3-backend-color-picker")
o.swatches=options.swatches?.join(";")??"",o.opacity=options.opacity??!1,t.parentNode.insertBefore(o,t),o.appendChild(t)}}
