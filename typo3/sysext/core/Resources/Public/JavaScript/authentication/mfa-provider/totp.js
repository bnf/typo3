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
var t=function(t,e,o,r){var i,a=arguments.length,n=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,r)
else for(var s=t.length-1;s>=0;s--)(i=t[s])&&(n=(a<3?i(n):a>3?i(e,o,n):i(e,o))||n)
return a>3&&n&&Object.defineProperty(e,o,n),n}
import{html as e,css as o,LitElement as r}from"lit"
import{customElement as i,property as a}from"lit/decorators.js"
import n from"@typo3/backend/modal.js"
let s=class extends r{static{this.styles=[o`:host{-webkit-appearance:button;-moz-appearance:button;appearance:button;cursor:pointer}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.showTotpAuthUrlModal()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.showTotpAuthUrlModal())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return e`<slot></slot>`}showTotpAuthUrlModal(){n.advanced({title:this.modalTitle,content:e`<p>${this.modalDescription}</p><pre>${this.modalUrl}</pre>`,buttons:[{trigger:()=>n.dismiss(),text:this.buttonOk||"OK",active:!0,btnClass:"btn-default",name:"ok"}]})}}
t([a({type:String,attribute:"data-url"})],s.prototype,"modalUrl",void 0),t([a({type:String,attribute:"data-title"})],s.prototype,"modalTitle",void 0),t([a({type:String,attribute:"data-description"})],s.prototype,"modalDescription",void 0),t([a({type:String,attribute:"data-button-ok"})],s.prototype,"buttonOk",void 0),s=t([i("typo3-mfa-totp-url-info-button")],s)
export{s as MfaTotpUrlButton}
