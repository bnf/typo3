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
var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__decorate=this&&this.__decorate||function(e,t,o,n){var r,i=arguments.length,a=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,n);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(i<3?r(a):i>3?r(t,o,a):r(t,o))||a);return i>3&&a&&Object.defineProperty(t,o,a),a},__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&__createBinding(t,e,o);return __setModuleDefault(t,e),t};define(["require","exports","lit","lit/decorators"],(function(e,t,o,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ModuleRouter=void 0;const r="TYPO3/CMS/Backend/Module/Iframe",i=(e,t)=>!0;let a=class extends o.LitElement{constructor(){super(),this.module="",this.endpoint="",this.addEventListener("typo3-module-load",e=>{const t=e.target.getAttribute("slot");console.log("[router] catched event:module-load from <"+t+">",e,e.detail.url);const o={slotName:t,detail:e.detail},n=this.stateTrackerUrl+"?state="+encodeURIComponent(JSON.stringify(o));console.log('[router] Pushing state "'+n+'" to iframe-state-tracker due to event:load'),this.getModuleElement(r).then(e=>e.setAttribute("endpoint",n))}),this.addEventListener("typo3-module-loaded",e=>{console.log("[router] catched typo3-module-loaded",e.detail),this.updateBrowserState(e.detail)}),this.addEventListener("typo3-iframe-load",e=>{const t=e.target.getAttribute("slot"),o=this.shadowRoot.querySelector("slot"),n=e.detail;let i=n.url,a=n.module||void 0,l=n.title||void 0;if(console.log("[router] catched event:iframe-load from <"+t+">",e,i),i.includes(this.stateTrackerUrl+"?state=")){const e=i.split("?state="),t=JSON.parse(decodeURIComponent(e[1]||"{}"));i=t.detail.url,a=t.detail.module||void 0,l=t.detail.title||void 0,o&&o.getAttribute("name")!==t.slotName&&(o.setAttribute("name",t.slotName),this.getModuleElement(t.slotName).then(e=>this.markActive(e,t.detail.url)),console.log("[router] history-navigation detected: updating slot to custom tag name",{slotName:t.slotName,endpoint:t.detail.url})),this.getModuleElement(t.slotName).then(e=>{e.getAttribute("endpoint")!==t.detail.url&&(this.markActive(e,t.detail.url),console.log("[router] history-navigation detected: updating endpoint for custom tag name",{slotName:t.slotName,endpoint:t.detail.url}))})}else o&&o.getAttribute("name")!==r&&(console.log("[router] history-navigation detected: updating slot name to "+r),i.includes(this.stateTrackerUrl)?console.log("[router] history-navigation detected: but we do not set slot name"):(o.setAttribute("name",r),this.getModuleElement(r).then(e=>this.markActive(e,null))));const d={url:i,module:a,title:l};this.updateBrowserState(d),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:d}))}),this.addEventListener("typo3-iframe-loaded",e=>{console.log("[router] catched typo3-iframe-loaded",e.detail),this.updateBrowserState(e.detail),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:e.detail}))})}render(){const e=this.getRecordFromName(this.module).elementModule||r;return o.html`<slot name="${e}"></slot>`}updated(){const e=this.getRecordFromName(this.module).elementModule||r;this.getModuleElement(e).then(e=>this.markActive(e,this.endpoint))}getModuleElement(t){const o=this.querySelector(`*[slot="${t}"]`);return null!==o?Promise.resolve(o):new Promise((o,n)=>{e([t],o,n)}).then(__importStar).then(e=>{const o=document.createElement(e.componentName);return o.setAttribute("slot",t),this.appendChild(o),o}).catch(e=>{throw console.error({msg:`Error importing ${t} as backend module`,err:e}),e})}markActive(e,t){t&&e.setAttribute("endpoint",t),e.setAttribute("active","");for(let t=e.previousElementSibling;null!==t;t=t.previousElementSibling)t.removeAttribute("active");for(let t=e.nextElementSibling;null!==t;t=t.nextElementSibling)t.removeAttribute("active")}updateBrowserState(e){const t=new URL(e.url||"",window.location.origin),o=new URLSearchParams(t.search);if(!o.has("token"))return;o.delete("token"),t.search=o.toString();const n=t.toString();window.history.replaceState(e,"",n);const r=e.title||null;r&&(document.title=r)}getRecordFromName(e){const t=document.getElementById(e);return t?{name:e,navigationComponentId:t.dataset.navigationcomponentid,navigationFrameScript:t.dataset.navigationframescript,navigationFrameScriptParam:t.dataset.navigationframescriptparameters,link:t.dataset.link,element:t.dataset.element,elementModule:t.dataset.elementModule}:{name:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:"",element:"",elementModule:""}}};a.styles=o.css`
    :host {
      width: 100%;
      min-height: 100%;
      flex: 1 0 auto;
      display: flex;
      flex-direction: row;
    }
    ::slotted(*) {
      min-height: 100%;
      width: 100%;
    }
  `,__decorate([n.property({type:String,hasChanged:i})],a.prototype,"module",void 0),__decorate([n.property({type:String,hasChanged:i})],a.prototype,"endpoint",void 0),__decorate([n.property({type:String,attribute:"state-tracker"})],a.prototype,"stateTrackerUrl",void 0),a=__decorate([n.customElement("typo3-backend-module-router")],a),t.ModuleRouter=a}));