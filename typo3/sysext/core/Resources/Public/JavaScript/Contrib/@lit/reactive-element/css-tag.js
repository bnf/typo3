define(["exports"],(function(e){"use strict";
/**
  @license
  Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at
  http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
  http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
  found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
  part of the polymer project is also subject to an additional IP rights grant
  found at http://polymer.github.io/PATENTS.txt
  */const t=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol();class n{constructor(e,t){if(t!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e}get styleSheet(){return t&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const o=e=>new n(e+"",s),S=new Map,r=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return o(t)})(e):e;e.CSSResult=n,e.adoptStyles=(e,s)=>{t?e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):s.forEach(t=>{const s=document.createElement("style");s.textContent=t.cssText,e.appendChild(s)})},e.css=(e,...t)=>{const o=t.reduce((t,s,o)=>t+(e=>{if(e instanceof n)return e.cssText;if("number"==typeof e)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(s)+e[o+1],e[0]);let r=S.get(o);return void 0===r&&S.set(o,r=new n(o,s)),r},e.getCompatibleStyle=r,e.supportsAdoptingStyleSheets=t,e.unsafeCSS=o,Object.defineProperty(e,"__esModule",{value:!0})}));
