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
define(["lit","lit/decorators","TYPO3/CMS/Backend/Modal"],(function(t,e,o){"use strict";var r,i=this&&this.__decorate||function(t,e,o,r){var i,l=arguments.length,n=l<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,r);else for(var p=t.length-1;p>=0;p--)(i=t[p])&&(n=(l<3?i(n):l>3?i(e,o,n):i(e,o))||n);return l>3&&n&&Object.defineProperty(e,o,n),n};!function(t){t.modalBody=".t3js-modal-body"}(r||(r={}));let l=class extends t.LitElement{constructor(){super(),this.addEventListener("click",t=>{t.preventDefault(),this.showTotpAuthUrlModal()})}render(){return t.html`<slot></slot>`}showTotpAuthUrlModal(){o.advanced({title:this.title,buttons:[{trigger:()=>o.dismiss(),text:this.ok||"OK",active:!0,btnClass:"btn-default",name:"ok"}],callback:e=>{t.render(t.html`
            <p>${this.description}</p>
            <pre>${this.url}</pre>
          `,e[0].querySelector(r.modalBody))}})}};i([e.property({type:String})],l.prototype,"url",void 0),i([e.property({type:String})],l.prototype,"title",void 0),i([e.property({type:String})],l.prototype,"description",void 0),i([e.property({type:String})],l.prototype,"ok",void 0),l=i([e.customElement("typo3-mfa-totp-url-info-button")],l)}));