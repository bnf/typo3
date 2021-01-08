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
var __decorate=this&&this.__decorate||function(e,t,o,n){var l,r=arguments.length,d=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,o,n);else for(var c=e.length-1;c>=0;c--)(l=e[c])&&(d=(r<3?l(d):r>3?l(t,o,d):l(t,o))||d);return r>3&&d&&Object.defineProperty(t,o,d),d};define(["require","exports","lit-element","TYPO3/CMS/Core/lit-helper"],(function(e,t,o,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IframeModuleElement=void 0;let l=class extends o.LitElement{constructor(){super(...arguments),this.src=""}static get styles(){return o.css`
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
    `}render(){const e=this.src;return console.log("rendering iframe",{src:e}),e?o.html`
      <iframe
        src="${e}"
        title="${n.lll("iframe.listFrame")}"
        scrolling="no"
        @load="${this._load}"
      ></iframe>
    `:o.html``}connectedCallback(){super.connectedCallback();const e=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:this.src,decorate:!1}});this.dispatchEvent(e)}_load(e){const t=e.target;this.shadowRoot.querySelector("iframe");const o=t.contentWindow.location.href,n=t.contentDocument.body.querySelector(".module[data-module-name]"),l=n&&n.getAttribute("data-module-name")||null;console.log("loaded iframe event",e,{url:o,module:l},t===e.target);const r=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:o,module:l}});console.log("sending out an url change "+o),this.dispatchEvent(r),t.contentWindow.addEventListener("unload",e=>{console.log("real iframe unload",e),Promise.resolve().then(()=>{if(null===t.contentWindow)return void console.log("real iframe window not found. we probably got removed.");const e=t.contentWindow.location.href,o=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,decorate:!0}});this.dispatchEvent(o)})},{once:!0})}};__decorate([o.property({type:String})],l.prototype,"src",void 0),l=__decorate([o.customElement("typo3-iframe-module")],l),t.IframeModuleElement=l}));