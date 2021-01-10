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
var __decorate=this&&this.__decorate||function(e,t,o,n){var r,a=arguments.length,l=a<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,n);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(l=(a<3?r(l):a>3?r(t,o,l):r(t,o))||l);return a>3&&l&&Object.defineProperty(t,o,l),l};define(["require","exports","lit-element","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/BroadcastMessage","TYPO3/CMS/Backend/BroadcastService"],(function(e,t,o,n,r,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IframeModuleElement=void 0;let l=class extends o.LitElement{constructor(){super(...arguments),this.src=""}static get styles(){return o.css`
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
        @unload="${this._unload}"
      ></iframe>
    `:o.html``}_load(e){console.log("loaded iframe event",e);const t=new CustomEvent("typo3-module-loaded",{detail:{message:"Something important happened"}});this.dispatchEvent(t);const o=this.shadowRoot.querySelector("iframe"),n=o.contentWindow.location.href,l=o.contentDocument.body.querySelector(".module[data-module-name]"),s=l&&l.getAttribute("data-module-name")||null,c=new r.BroadcastMessage("navigation","contentchange",{url:n,module:s});console.log("sending out an url change "+n),a.post(c,!0)}_unload(e){console.log("iframe unload",e);const t=this.shadowRoot.querySelector("iframe").contentWindow.location.href;new r.BroadcastMessage("navigation","contentchange",{url:t,module:null})}};__decorate([o.property({type:String})],l.prototype,"src",void 0),l=__decorate([o.customElement("typo3-iframe-module")],l),t.IframeModuleElement=l}));