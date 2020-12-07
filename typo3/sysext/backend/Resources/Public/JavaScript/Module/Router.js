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
define(["require","lit","lit/decorators","../Module"],(function(t,e,o,i){"use strict";var r=this&&this.__decorate||function(t,e,o,i){var r,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(s=(n<3?r(s):n>3?r(e,o,s):r(e,o))||s);return n>3&&s&&Object.defineProperty(e,o,s),s};const n="TYPO3/CMS/Backend/Module/Iframe",s=(t,e)=>!0;let l=class extends e.LitElement{constructor(){super(),this.module="",this.endpoint="",this.addEventListener("typo3-module-load",({target:t,detail:e})=>{const o=t.getAttribute("slot");this.pushState({slotName:o,detail:e})}),this.addEventListener("typo3-module-loaded",({detail:t})=>{this.updateBrowserState(t)}),this.addEventListener("typo3-iframe-load",({detail:t})=>{let e={slotName:n,detail:t};if(e.detail.url.includes(this.stateTrackerUrl+"?state=")){const t=e.detail.url.split("?state=");e=JSON.parse(decodeURIComponent(t[1]||"{}"))}this.slotElement.getAttribute("name")!==e.slotName&&this.slotElement.setAttribute("name",e.slotName),this.markActive(e.slotName,this.slotElement.getAttribute("name")===n?null:e.detail.url,!1),this.updateBrowserState(e.detail),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:e.detail}))}),this.addEventListener("typo3-iframe-loaded",({detail:t})=>{this.updateBrowserState(t),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:t}))})}render(){const t=i.getRecordFromName(this.module).component||n;return e.html`<slot name="${t}"></slot>`}updated(){const t=i.getRecordFromName(this.module).component||n;this.markActive(t,this.endpoint)}async markActive(t,e,o=!0){const i=await this.getModuleElement(t);e&&(o||i.getAttribute("endpoint")!==e)&&i.setAttribute("endpoint",e),i.hasAttribute("active")||i.setAttribute("active","");for(let t=i.previousElementSibling;null!==t;t=t.previousElementSibling)t.removeAttribute("active");for(let t=i.nextElementSibling;null!==t;t=t.nextElementSibling)t.removeAttribute("active")}async getModuleElement(e){let o=this.querySelector(`*[slot="${e}"]`);if(null!==o)return o;try{const i=await new Promise((function(o,i){t([e],(function(t){o("object"!=typeof t||"default"in t?{default:t}:Object.defineProperty(t,"default",{value:t,enumerable:!1}))}),i)}));o=document.createElement(i.componentName)}catch(t){throw console.error({msg:`Error importing ${e} as backend module`,err:t}),t}return o.setAttribute("slot",e),this.appendChild(o),o}async pushState(t){const e=this.stateTrackerUrl+"?state="+encodeURIComponent(JSON.stringify(t));(await this.getModuleElement(n)).setAttribute("endpoint",e)}updateBrowserState(t){const e=new URL(t.url||"",window.location.origin),o=new URLSearchParams(e.search),i="title"in t?t.title:"";if(null!==i){const t=[this.sitename];""!==i&&t.unshift(i),this.sitenameFirst&&t.reverse(),document.title=t.join(" · ")}if(!o.has("token"))return;o.delete("token"),e.search=o.toString();const r=e.toString();window.history.replaceState(t,"",r)}};return l.styles=e.css`
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
  `,r([o.property({type:String,hasChanged:s})],l.prototype,"module",void 0),r([o.property({type:String,hasChanged:s})],l.prototype,"endpoint",void 0),r([o.property({type:String,attribute:"state-tracker"})],l.prototype,"stateTrackerUrl",void 0),r([o.property({type:String,attribute:"sitename"})],l.prototype,"sitename",void 0),r([o.property({type:Boolean,attribute:"sitename-first"})],l.prototype,"sitenameFirst",void 0),r([o.query("slot",!0)],l.prototype,"slotElement",void 0),l=r([o.customElement("typo3-backend-module-router")],l),{ModuleRouter:l}}));