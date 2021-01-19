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
var __decorate=this&&this.__decorate||function(e,t,o,l){var n,r=arguments.length,c=r<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,o):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,l);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(c=(r<3?n(c):r>3?n(t,o,c):n(t,o))||c);return r>3&&c&&Object.defineProperty(t,o,c),c};define(["require","exports","lit-element","TYPO3/CMS/Core/lit-helper"],(function(e,t,o,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IframeModuleElement=void 0;let n=class extends o.LitElement{constructor(){super(...arguments),this.src=""}static get styles(){return o.css`
      :host {
        display: block;
        height: 100%;
      }
      iframe {
        display: block;
        border: none;
        height: 100%;
        width: 1px;
        min-width: 100%;
        transform: translate3d(0,0,0);
      }
    `}createRenderRoot(){return this}render(){const e=this.src;return console.log("rendering iframe",{src:e}),e?o.html`
      <iframe
        class="scaffold-content-module-iframe"
        src="${e}"
        name="list_frame"
        title="${l.lll("iframe.listFrame")}"
        scrolling="no"
        @load="${this._load}"
      ></iframe>
    `:o.html``}connectedCallback(){super.connectedCallback();const e=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:this.src,decorate:!1}});this.dispatchEvent(e)}_load(e){const t=e.target;let o=null,l=null;try{o=t.contentWindow.location.href;const e=t.contentDocument.body.querySelector(".module[data-module-name]");l=e&&e.getAttribute("data-module-name")||null,t.contentWindow.addEventListener("unload",e=>{console.log("real iframe unload",e),Promise.resolve().then(()=>{if(null===t.contentWindow)return void console.log("real iframe window not found. we probably got removed.");const e=t.contentWindow.location.href,o=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,decorate:!0}});this.dispatchEvent(o)})},{once:!0})}catch(e){console.log("iframe catch",e)}console.log("loaded iframe event",e,{url:o,module:l},t===e.target);const n=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:o,module:l}});console.log("sending out an url change "+o),this.dispatchEvent(n)}};__decorate([o.property({type:String})],n.prototype,"src",void 0),n=__decorate([o.customElement("typo3-iframe-module")],n),t.IframeModuleElement=n}));