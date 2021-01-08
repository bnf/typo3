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
define(["require","exports"],(function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.IframeShim=void 0,e.IframeShim=function(t){return class extends t{constructor(...t){super(...t),this.classList.add("t3js-scaffold-content-module-iframe"),this.setAttribute("id","typo3-contentIframe"),this.setAttribute("name","list_frame"),this._iframeShimUrl=document.createElement("a"),window.list_frame=this.contentWindow=Object.create(Object.prototype,{location:{value:Object.create(Object.prototype,{href:{get:()=>this.getAttribute("src"),set:t=>{this.setAttribute("src",t),this.removeAttribute("module")}},reload:{value:()=>{this.requestUpdate()}},replace:{value:t=>{this.setAttribute("src",t),this.decorate=!0}},hash:{get:()=>this._iframeShimUrl.hash},host:{get:()=>this._iframeShimUrl.host},hostname:{get:()=>this._iframeShimUrl.hostname},origin:{get:()=>this._iframeShimUrl.origin},password:{get:()=>this._iframeShimUrl.password},pathname:{get:()=>this._iframeShimUrl.pathname},port:{get:()=>this._iframeShimUrl.port},protocol:{get:()=>this._iframeShimUrl.protocol},search:{get:()=>this._iframeShimUrl.search},username:{get:()=>this._iframeShimUrl.username},toString:{value:()=>this.getAttribute("src")}})},document:{value:Object.create(Object.prototype,{location:{get:()=>this.contentWindow.location}})},parent:{get:()=>window},postMessage:{value:(t,e,r)=>{const i=this.querySelector("typo3-iframe-module");let o=null;i&&(o=i.shadowRoot.querySelector("iframe")),o?o.contentWindow.postMessage(t,e,r):console.log("could not route postmessage",t,this)}},focus:{value:()=>{const t=this.querySelector("typo3-iframe-module");let e=null;t&&(e=t.shadowRoot.querySelector("iframe")),e&&e.contentWindow.focus()}}})}attributeChangedCallback(t,e,r){super.attributeChangedCallback(t,e,r),"src"===t&&(this._iframeShimUrl.href=r)}}}}));