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
var __decorate=this&&this.__decorate||function(e,t,o,a){var n,r=arguments.length,l=r<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,a);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(l=(r<3?n(l):r>3?n(t,o,l):n(t,o))||l);return r>3&&l&&Object.defineProperty(t,o,l),l};define(["require","exports","lit-element","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/BroadcastMessage","TYPO3/CMS/Backend/BroadcastService"],(function(e,t,o,a,n,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IframeModuleElement=void 0;class l{constructor(e){this._href="",this.propertyChangedCallback=e}get href(){return this._href}set href(e){this._href=e,this.propertyChangedCallback("href")}}let i=class extends o.LitElement{constructor(){super(),this.module="",this.src="",this.params="",this.moduleData=null,this.location=new l(e=>this.requestUpdate())}static get styles(){return o.css`
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
    `}render(){let e="";top.nextLoadModuleUrl&&(e=top.nextLoadModuleUrl,top.nextLoadModuleUrl="");const t=this.location&&this.location.href,n=this.moduleData||this.getRecordFromName(this.module);console.log("iframe moduledata",n,this.module);const r=e||t||this.src||n.link||"";return console.log("rendering iframe",{href:t,src:r}),r?o.html`
      <iframe
        name="list_frame"
        id="typo3-contentIframe"
        title="${a.lll("iframe.listFrame")}"
        scrolling="no"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        src="${r}"
        @load="${this._load}"
        @unload="${this._unload}"
      ></iframe>
    `:o.html``}_load(e){console.log("loaded iframe event",e);const t=new CustomEvent("typo3-module-loaded",{detail:{message:"Something important happened"}});this.dispatchEvent(t);const o=this.shadowRoot.querySelector("iframe"),a=o.contentWindow.location.href,l=o.contentDocument.body.querySelector(".module[data-module-name]"),i=l&&l.getAttribute("data-module-name")||null,s=new n.BroadcastMessage("navigation","contentchange",{url:a,module:i});console.log("sending out an url change "+a),r.post(s,!0)}_unload(e){console.log("iframe unload",e);const t=this.shadowRoot.querySelector("iframe").contentWindow.location.href;new n.BroadcastMessage("navigation","contentchange",{url:t,module:null})}getRecordFromName(e){const t=document.getElementById(e);return t?{name:e,navigationComponentId:t.dataset.navigationcomponentid,navigationFrameScript:t.dataset.navigationframescript,navigationFrameScriptParam:t.dataset.navigationframescriptparameters,link:t.dataset.link,element:t.dataset.element,elementModule:t.dataset.elementModule}:{name:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:"",element:"",elementModule:""}}};__decorate([o.property({type:String})],i.prototype,"module",void 0),__decorate([o.property({type:String})],i.prototype,"src",void 0),__decorate([o.property({type:String})],i.prototype,"params",void 0),__decorate([o.property({type:Object})],i.prototype,"moduleData",void 0),i=__decorate([o.customElement("typo3-iframe-module")],i),t.IframeModuleElement=i}));