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
define(["lit","lit/decorators","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/lit-helper"],(function(e,t,o,r){"use strict";var c=this&&this.__decorate||function(e,t,o,r){var c,l=arguments.length,i=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(c=e[n])&&(i=(l<3?c(i):l>3?c(t,o,i):c(t,o))||i);return l>3&&i&&Object.defineProperty(t,o,i),i};let l=class extends e.LitElement{constructor(){super(),this.addEventListener("click",e=>{e.preventDefault(),this.copyToClipboard()})}render(){return e.html`<slot></slot>`}copyToClipboard(){if("string"!=typeof this.text||!this.text.length)return console.warn("No text for copy to clipboard given."),void o.error(r.lll("copyToClipboard.error"));if(navigator.clipboard)navigator.clipboard.writeText(this.text).then(()=>{o.success(r.lll("copyToClipboard.success"),"",1)}).catch(()=>{o.error(r.lll("copyToClipboard.error"))});else{const e=document.createElement("textarea");e.value=this.text,document.body.appendChild(e),e.focus(),e.select();try{document.execCommand("copy")?o.success(r.lll("copyToClipboard.success"),"",1):o.error(r.lll("copyToClipboard.error"))}catch(e){o.error(r.lll("copyToClipboard.error"))}document.body.removeChild(e)}}};c([t.property({type:String})],l.prototype,"text",void 0),l=c([t.customElement("typo3-copy-to-clipboard")],l)}));