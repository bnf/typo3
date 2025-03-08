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
var e=function(e,t,o,r){var n,i=arguments.length,a=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r)
else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(a=(i<3?n(a):i>3?n(t,o,a):n(t,o))||a)
return i>3&&a&&Object.defineProperty(t,o,a),a}
import{html as t,LitElement as o,nothing as r}from"lit"
import{customElement as n,property as i,query as a}from"lit/decorators.js"
import{lll as l}from"@typo3/core/lit-helper.js"
export const componentName="typo3-iframe-module"
let d=class extends o{constructor(){super(...arguments),this.endpoint=""}attributeChangedCallback(e,t,o){super.attributeChangedCallback(e,t,o),"endpoint"===e&&o===t&&this.iframe.setAttribute("src",o)}connectedCallback(){super.connectedCallback(),this.endpoint&&this.dispatch("typo3-iframe-load",{url:this.endpoint,title:null})}createRenderRoot(){return this}render(){return this.endpoint?t`<iframe src="${this.endpoint}" name="list_frame" id="typo3-contentIframe" class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe" title="${l("iframe.listFrame")}" scrolling="no" @load="${this._loaded}"></iframe>`:r}registerPagehideHandler(e){try{e.contentWindow.addEventListener("pagehide",(t=>this._pagehide(t,e)),{once:!0})}catch(e){throw console.error("Failed to access contentWindow of module iframe – using a foreign origin?"),e}}retrieveModuleStateFromIFrame(e){try{return{url:e.contentWindow.location.href,title:e.contentDocument.title,module:e.contentDocument.body.querySelector(".module[data-module-name]")?.getAttribute("data-module-name")}}catch{return console.error("Failed to access contentWindow of module iframe – using a foreign origin?"),{url:this.endpoint,title:null}}}_loaded({target:e}){const t=e
this.registerPagehideHandler(t)
const o=this.retrieveModuleStateFromIFrame(t)
this.dispatch("typo3-iframe-loaded",o)}_pagehide(e,t){new Promise((e=>window.setTimeout(e,0))).then((()=>{null!==t.contentWindow&&this.dispatch("typo3-iframe-load",{url:t.contentWindow.location.href,title:null})}))}dispatch(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}
e([i({type:String})],d.prototype,"endpoint",void 0),e([a("iframe",!0)],d.prototype,"iframe",void 0),d=e([n("typo3-iframe-module")],d)
export{d as IframeModuleElement}
