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
import{LitElement as t,css as e,html as o}from"lit";import{property as r,customElement as c}from"lit/decorators.js";import i from"@typo3/backend/notification.js";import{lll as n}from"@typo3/core/lit-helper.js";var p=function(t,e,o,r){var c,i=arguments.length,n=i<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,r);else for(var p=t.length-1;p>=0;p--)(c=t[p])&&(n=(i<3?c(n):i>3?c(e,o,n):c(e,o))||n);return i>3&&n&&Object.defineProperty(e,o,n),n};function s(t){if(!t.length)return console.warn("No text for copy to clipboard given."),void i.error(n("copyToClipboard.error"));if(navigator.clipboard)navigator.clipboard.writeText(t).then((()=>{i.success(n("copyToClipboard.success"),"",1)})).catch((()=>{i.error(n("copyToClipboard.error"))}));else{const e=document.createElement("textarea");e.value=t,document.body.appendChild(e),e.focus(),e.select();try{document.execCommand("copy")?i.success(n("copyToClipboard.success"),"",1):i.error(n("copyToClipboard.error"))}catch{i.error(n("copyToClipboard.error"))}document.body.removeChild(e)}}let a=class extends t{static{this.styles=[e`:host{cursor:pointer;appearance:button}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.copyToClipboard()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.copyToClipboard())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return o`<slot></slot>`}copyToClipboard(){if("string"!=typeof this.text)return console.warn("No text for copy to clipboard given."),void i.error(n("copyToClipboard.error"));s(this.text)}};p([r({type:String})],a.prototype,"text",void 0),a=p([c("typo3-copy-to-clipboard")],a);export{a as CopyToClipboard,s as copyToClipboard};