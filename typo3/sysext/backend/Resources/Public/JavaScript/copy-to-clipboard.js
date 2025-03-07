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
var t=function(t,o,e,r){var c,i=arguments.length,p=i<3?o:null===r?r=Object.getOwnPropertyDescriptor(o,e):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(t,o,e,r)
else for(var n=t.length-1;n>=0;n--)(c=t[n])&&(p=(i<3?c(p):i>3?c(o,e,p):c(o,e))||p)
return i>3&&p&&Object.defineProperty(o,e,p),p}
import{html as o,css as e,LitElement as r}from"lit"
import{customElement as c,property as i}from"lit/decorators.js"
import p from"@typo3/backend/notification.js"
import{lll as n}from"@typo3/core/lit-helper.js"
export function copyToClipboard(t){if(!t.length)return console.warn("No text for copy to clipboard given."),void p.error(n("copyToClipboard.error"))
if(navigator.clipboard)navigator.clipboard.writeText(t).then((()=>{p.success(n("copyToClipboard.success"),"",1)})).catch((()=>{p.error(n("copyToClipboard.error"))}))
else{const o=document.createElement("textarea")
o.value=t,document.body.appendChild(o),o.focus(),o.select()
try{document.execCommand("copy")?p.success(n("copyToClipboard.success"),"",1):p.error(n("copyToClipboard.error"))}catch{p.error(n("copyToClipboard.error"))}document.body.removeChild(o)}}let a=class extends r{static{this.styles=[e`:host{-webkit-appearance:button;-moz-appearance:button;appearance:button;cursor:pointer}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.copyToClipboard()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.copyToClipboard())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return o`<slot></slot>`}copyToClipboard(){if("string"!=typeof this.text)return console.warn("No text for copy to clipboard given."),void p.error(n("copyToClipboard.error"))
copyToClipboard(this.text)}}
t([i({type:String})],a.prototype,"text",void 0),a=t([c("typo3-copy-to-clipboard")],a)
export{a as CopyToClipboard}
