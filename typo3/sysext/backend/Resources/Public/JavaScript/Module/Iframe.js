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
var __decorate=this&&this.__decorate||function(e,t,o,n){var l,r=arguments.length,a=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(l=e[i])&&(a=(r<3?l(a):r>3?l(t,o,a):l(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};define(["require","exports","lit","lit/decorators","TYPO3/CMS/Core/lit-helper"],(function(e,t,o,n,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IframeModuleElement=t.componentName=void 0,t.componentName="typo3-iframe-module";let r=class extends o.LitElement{constructor(){super(...arguments),this.endpoint=""}createRenderRoot(){return this}render(){return this.endpoint?o.html`
      <iframe
        src="${this.endpoint}"
        name="list_frame"
        id="typo3-contentIframe"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        title="${l.lll("iframe.listFrame")}"
        scrolling="no"
        @load="${this._load}"
      ></iframe>
    `:o.html``}connectedCallback(){if(super.connectedCallback(),this.endpoint){const e=new CustomEvent("typo3-iframe-load",{bubbles:!0,composed:!0,detail:{url:this.endpoint}});this.dispatchEvent(e)}}attributeChangedCallback(e,t,o){if(super.attributeChangedCallback(e,t,o),"endpoint"===e&&o===t)try{this.iframe.setAttribute("src",o)}catch(e){console.log("Failed to reload module iframe",e)}}_load(e){const t=e.target;let o=null,n=null,l=null;try{o=t.contentWindow.location.href;const e=t.contentDocument.body.querySelector(".module[data-module-name]");n=e&&e.getAttribute("data-module-name")||null,l=t.contentDocument.title,t.contentWindow.addEventListener("unload",e=>{console.log("[module-iframe] caught iframe unload event",e),new Promise(e=>window.setTimeout(e,0)).then(()=>{if(null===t.contentWindow)return void console.log("real iframe window not found. we probably got removed.");const e=t.contentWindow.location.href,o=new CustomEvent("typo3-iframe-load",{bubbles:!0,composed:!0,detail:{url:e}});this.dispatchEvent(o)})},{once:!0})}catch(e){console.log("Failed to register module iframe unload event",e)}console.log("[module-iframe] dipatched iframe-loaded event",e,{url:o,module:n},t===e.target);const r=new CustomEvent("typo3-iframe-loaded",{bubbles:!0,composed:!0,detail:{url:o,title:l,module:n}});this.dispatchEvent(r)}};__decorate([n.property({type:String})],r.prototype,"endpoint",void 0),__decorate([n.query("iframe",!0)],r.prototype,"iframe",void 0),r=__decorate([n.customElement(t.componentName)],r),t.IframeModuleElement=r}));