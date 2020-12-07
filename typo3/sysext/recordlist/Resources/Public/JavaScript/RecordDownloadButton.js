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
define(["lit","lit/decorators","TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Backend/Severity","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Core/lit-helper"],(function(t,e,o,r,n,l){"use strict";var s,i=this&&this.__decorate||function(t,e,o,r){var n,l=arguments.length,s=l<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,r);else for(var i=t.length-1;i>=0;i--)(n=t[i])&&(s=(l<3?n(s):l>3?n(e,o,s):n(e,o))||s);return l>3&&s&&Object.defineProperty(e,o,s),s};!function(t){t.formatSelector=".t3js-record-download-format-selector",t.formatOptions=".t3js-record-download-format-option"}(s||(s={}));let a=class extends t.LitElement{constructor(){super(),this.addEventListener("click",t=>{t.preventDefault(),this.showDownloadConfigurationModal()})}render(){return t.html`<slot></slot>`}showDownloadConfigurationModal(){this.url&&n.advanced({content:this.url,title:this.title||"Download records",severity:o.SeverityEnum.notice,size:n.sizes.small,type:n.types.ajax,buttons:[{text:this.close||l.lll("button.close")||"Close",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>n.dismiss()},{text:this.ok||l.lll("button.ok")||"Download",btnClass:"btn-"+r.getCssClass(o.SeverityEnum.info),name:"download",trigger:()=>{const t=n.currentModal[0].querySelector("form");t&&t.submit(),n.dismiss()}}],ajaxCallback:()=>{const t=n.currentModal[0].querySelector(s.formatSelector),e=n.currentModal[0].querySelectorAll(s.formatOptions);null!==t&&e.length&&t.addEventListener("change",t=>{const o=t.target.value;e.forEach(t=>{t.dataset.formatname!==o?t.classList.add("hide"):t.classList.remove("hide")})})}})}};i([e.property({type:String})],a.prototype,"url",void 0),i([e.property({type:String})],a.prototype,"title",void 0),i([e.property({type:String})],a.prototype,"ok",void 0),i([e.property({type:String})],a.prototype,"close",void 0),a=i([e.customElement("typo3-recordlist-record-download-button")],a)}));