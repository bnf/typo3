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
var __createBinding=this&&this.__createBinding||(Object.create?function(e,t,o,r){void 0===r&&(r=o),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,r){void 0===r&&(r=o),e[r]=t[o]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),__decorate=this&&this.__decorate||function(e,t,o,r){var a,i=arguments.length,n=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(a=e[l])&&(n=(i<3?a(n):i>3?a(t,o,n):a(t,o))||n);return i>3&&n&&Object.defineProperty(t,o,n),n},__importStar=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.prototype.hasOwnProperty.call(e,o)&&__createBinding(t,e,o);return __setModuleDefault(t,e),t};define(["require","exports","lit-element"],(function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ModuleRouter=void 0;let r=class extends o.LitElement{constructor(){super(),this.module="",this.src="",this.decorate=!1,this.element=null,this.popstateHandler=e=>{this._handlePopstate(e)},this.addEventListener("typo3-module-load",e=>{const t=e.target.tagName.toLowerCase();if(console.log('catched load from "'+t+'" in module-router',e),"typo3-iframe-module"!==t){const o={tagName:t,detail:e.detail},r=this.getAttribute("state-tracker")+"?state="+encodeURIComponent(JSON.stringify(o));console.log('setting "'+r+'" on iframe-module in load');const a=this.querySelector("typo3-iframe-module");return a&&a.getAttribute("src")!==r&&a.setAttribute("src",r),void e.stopImmediatePropagation()}if("typo3-iframe-module"===t){const t=e.detail.url,o=this.shadowRoot.querySelector("slot");if(t.includes(this.getAttribute("state-tracker"))){const r=t.split("?state="),a=JSON.parse(decodeURIComponent(r[1]||""));if(o&&o.getAttribute("name")!==a.tagName){o.setAttribute("name",a.tagName);const e=this.querySelector(a.tagName);e&&e.setAttribute("src",a.detail.url)}e.detail.module=a.detail.module,e.detail.url=a.detail.url}else o&&"typo3-iframe-module"!==o.getAttribute("name")&&o.setAttribute("name","typo3-iframe-module")}e.detail.decorate=!0,this.decorate&&(e.detail.decorate=!0,this.decorate=!1)}),this.addEventListener("typo3-module-loaded",e=>{console.log("sending load event from module-router",e),this.dispatchEvent(new Event("load"))})}static get styles(){return o.css`
      :host {
        display: block;
        min-height: 100%;
      }
    `}attributeChangedCallback(e,t,o){console.log("attribute change: ",e,o,t),super.attributeChangedCallback(e,t,o),"module"!==e&&"src"!==e||this.requestUpdate()}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this.popstateHandler)}disconnectedCallback(){window.addEventListener("popstate",this.popstateHandler),super.disconnectedCallback()}render(){const t=this.getRecordFromName(this.module),r=t.element||"typo3-iframe-module";let a=this.querySelector(r);if(null===a){const o=t.elementModule||"TYPO3/CMS/Backend/Module/Iframe";new Promise((t,r)=>{e([o],t,r)}).then(__importStar).catch(e=>console.error("Error importing "+o+" for <"+r+">")),a=document.createElement(r),a.setAttribute("slot",r),this.appendChild(a)}a.setAttribute("src",this.src),a.setAttribute("active","");for(let e=a.previousElementSibling;null!==e;e=e.previousElementSibling)e.removeAttribute("active");for(let e=a.nextElementSibling;null!==e;e=e.nextElementSibling)e.removeAttribute("active");return o.html`<slot name="${r}"></slot>`}_handlePopstate(e){console.log("location: "+document.location+", state: "+JSON.stringify(e.state)),null!==e.state&&(e.state.module?(this.setAttribute("module",e.state.module),this.decorate=!0):this.removeAttribute("module"),e.state.url?(this.setAttribute("src",e.state.url),this.decorate=!0):this.removeAttribute("src"))}getRecordFromName(e){const t=document.getElementById(e);return t?{name:e,navigationComponentId:t.dataset.navigationcomponentid,navigationFrameScript:t.dataset.navigationframescript,navigationFrameScriptParam:t.dataset.navigationframescriptparameters,link:t.dataset.link,element:t.dataset.element,elementModule:t.dataset.elementModule}:{name:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:"",element:"",elementModule:""}}};__decorate([o.property({type:String,reflect:!0})],r.prototype,"module",void 0),__decorate([o.property({type:String,reflect:!0})],r.prototype,"src",void 0),r=__decorate([o.customElement("typo3-backend-module-router")],r),t.ModuleRouter=r}));