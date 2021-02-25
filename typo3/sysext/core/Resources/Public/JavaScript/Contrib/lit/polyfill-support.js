define((function(){"use strict";var i;i=function(){var i;i=function(){var i,n,o;i=function(){
/**
                            * @license
                            * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                            * This code may only be used under the BSD style license found at
                            * http://polymer.github.io/LICENSE.txt
                            * The complete set of authors may be found at
                            * http://polymer.github.io/AUTHORS.txt
                            * The complete set of contributors may be found at
                            * http://polymer.github.io/CONTRIBUTORS.txt
                            * Code distributed by Google as part of the polymer project is also
                            * subject to an additional IP rights grant found at
                            * http://polymer.github.io/PATENTS.txt
                            */
var i,n,o="__scoped";null!==(i=(n=window).reactiveElementPlatformSupport)&&void 0!==i||(n.reactiveElementPlatformSupport=function(i){var n=i.ReactiveElement;if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var t=n.prototype;window.ShadyDOM&&window.ShadyDOM.inUse&&!0===window.ShadyDOM.noPatch&&window.ShadyDOM.patchElementProto(t);var d=t.createRenderRoot;t.createRenderRoot=function(){var i,n,t,e=this.localName;if(window.ShadyCSS.nativeShadow)return d.call(this);if(!this.constructor.hasOwnProperty(o)){this.constructor[o]=!0;var v=this.constructor.elementStyles.map((function(i){return i instanceof CSSStyleSheet?Array.from(i.cssRules).reduce((function(i,n){return i+n.cssText}),""):i.cssText}));null===(n=null===(i=window.ShadyCSS)||void 0===i?void 0:i.ScopingShim)||void 0===n||n.prepareAdoptedCssText(v,e),void 0===this.constructor.N&&window.ShadyCSS.prepareTemplateStyles(document.createElement("template"),e)}return null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions)};var e=t.connectedCallback;t.connectedCallback=function(){e.call(this),this.hasUpdated&&window.ShadyCSS.styleElement(this)};var v=t.H;t.H=function(i){var n=!this.hasUpdated;v.call(this,i),n&&window.ShadyCSS.styleElement(this)}}})},"function"==typeof define&&define.amd?define(i):i(),function(i){"function"==typeof define&&define.amd?define(i):i()}((function(){
/**
                            * @license
                            * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                            * This code may only be used under the BSD style license found at
                            * http://polymer.github.io/LICENSE.txt
                            * The complete set of authors may be found at
                            * http://polymer.github.io/AUTHORS.txt
                            * The complete set of contributors may be found at
                            * http://polymer.github.io/CONTRIBUTORS.txt
                            * Code distributed by Google as part of the polymer project is also
                            * subject to an additional IP rights grant found at
                            * http://polymer.github.io/PATENTS.txt
                            */
var i,n,o=new Set,t=new Map;null!==(i=(n=window).litHtmlPlatformSupport)&&void 0!==i||(n.litHtmlPlatformSupport=function(i,n){if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var d=function(i){var n=t.get(i);return void 0===n&&t.set(i,n=[]),n},e=new Map,v=i.prototype.A;i.prototype.A=function(i){var n,o=v.call(this,i),t=null===(n=this.C)||void 0===n?void 0:n.scope;if(void 0!==t){window.ShadyCSS.nativeShadow||window.ShadyCSS.prepareTemplateDom(o,t);var e=d(t),u=o.content.querySelectorAll("style");e.push.apply(e,Array.from(u).map((function(i){var n;return null===(n=i.parentNode)||void 0===n||n.removeChild(i),i.textContent})))}return o};var u=document.createDocumentFragment(),f=document.createComment(""),r=n.prototype,w=r.M;r.M=function(i,n){var e,v,r;void 0===n&&(n=this);var s,a=this.D.parentNode,l=null===(e=this.options)||void 0===e?void 0:e.scope;if(a instanceof ShadowRoot&&void 0!==(s=l)&&!o.has(s)){var h=this.D,c=this.E;u.appendChild(f),this.D=f,this.E=null,w.call(this,i,n);var p=(null===(v=i)||void 0===v?void 0:v._$litType$)?this.L.G.B:document.createElement("template");if(function(i,n){var e=d(i);if(e.length){var v=document.createElement("style");v.textContent=e.join("\n"),n.content.appendChild(v)}o.add(i),t.delete(i),window.ShadyCSS.prepareTemplateStyles(n,i)}(l,p),u.removeChild(f),null===(r=window.ShadyCSS)||void 0===r?void 0:r.nativeShadow){var y=p.content.querySelector("style");null!==y&&u.appendChild(y.cloneNode(!0))}a.insertBefore(u,c),this.D=h,this.E=c}else w.call(this,i,n)},r.F=function(n,o){var t,d=null===(t=this.options)||void 0===t?void 0:t.scope,v=e.get(d);void 0===v&&e.set(d,v=new Map);var u=v.get(n);return void 0===u&&v.set(n,u=new i(o,this.options)),u}}})})),null!==(n=(o=window).litElementPlatformSupport)&&void 0!==n||(o.litElementPlatformSupport=function(i){var n=i.LitElement;if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){n.N=!0;var o=n.prototype,t=o.createRenderRoot;o.createRenderRoot=function(){return this.I.scope=this.localName,t.call(this)}}})},"function"==typeof define&&define.amd?define(i):i()},"function"==typeof define&&define.amd?define(i):i()}));
