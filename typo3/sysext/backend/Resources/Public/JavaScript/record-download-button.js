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
var t,e=function(t,e,o,r){var n,s=arguments.length,a=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r)
else for(var i=t.length-1;i>=0;i--)(n=t[i])&&(a=(s<3?n(a):s>3?n(e,o,a):n(e,o))||a)
return s>3&&a&&Object.defineProperty(e,o,a),a}
import{html as o,css as r,LitElement as n}from"lit"
import{customElement as s,property as a}from"lit/decorators.js"
import{SeverityEnum as i}from"@typo3/backend/enum/severity.js"
import l from"@typo3/backend/severity.js"
import c from"@typo3/backend/modal.js"
import{lll as d}from"@typo3/core/lit-helper.js"
!function(t){t.formatSelector=".t3js-record-download-format-selector",t.formatOptions=".t3js-record-download-format-option"}(t||(t={}))
let p=class extends n{static{this.styles=[r`:host{-webkit-appearance:button;-moz-appearance:button;appearance:button;cursor:pointer}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.showDownloadConfigurationModal()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.showDownloadConfigurationModal())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return o`<slot></slot>`}showDownloadConfigurationModal(){if(!this.url)return
const e=c.advanced({content:this.url,title:this.subject||"Download records",severity:i.notice,size:c.sizes.small,type:c.types.ajax,buttons:[{text:this.close||d("button.close")||"Close",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>e.hideModal()},{text:this.ok||d("button.ok")||"Download",btnClass:"btn-"+l.getCssClass(i.info),name:"download",trigger:()=>{const t=e.querySelector("form")
t?.submit(),e.hideModal()}}],ajaxCallback:()=>{const o=e.querySelector(t.formatSelector),r=e.querySelectorAll(t.formatOptions)
null!==o&&r.length&&o.addEventListener("change",(t=>{const e=t.target.value
r.forEach((t=>{t.dataset.formatname!==e?t.classList.add("hide"):t.classList.remove("hide")}))}))}})}}
e([a({type:String})],p.prototype,"url",void 0),e([a({type:String})],p.prototype,"subject",void 0),e([a({type:String})],p.prototype,"ok",void 0),e([a({type:String})],p.prototype,"close",void 0),p=e([s("typo3-recordlist-record-download-button")],p)
export{p as RecordDownloadButton}
