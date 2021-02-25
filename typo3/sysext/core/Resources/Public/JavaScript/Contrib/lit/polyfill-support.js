define((function(){"use strict";var t;t=function(){var t;t=function(){var t,e,n;t=function(){
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
var t,e,n="__scoped";null!==(t=(e=window).reactiveElementPlatformSupport)&&void 0!==t||(e.reactiveElementPlatformSupport=function(t){var e=t.ReactiveElement;if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var o=e.prototype;window.ShadyDOM&&window.ShadyDOM.inUse&&!0===window.ShadyDOM.noPatch&&window.ShadyDOM.patchElementProto(o);var i=o.createRenderRoot;o.createRenderRoot=function(){var t,e,o,a=this.localName;if(window.ShadyCSS.nativeShadow)return i.call(this);if(!this.constructor.hasOwnProperty(n)){this.constructor[n]=!0;var d=this.constructor.elementStyles.map((function(t){return t instanceof CSSStyleSheet?Array.from(t.cssRules).reduce((function(t,e){return t+e.cssText}),""):t.cssText}));null===(e=null===(t=window.ShadyCSS)||void 0===t?void 0:t.ScopingShim)||void 0===e||e.prepareAdoptedCssText(d,a),void 0===this.constructor.N&&window.ShadyCSS.prepareTemplateStyles(document.createElement("template"),a)}return null!==(o=this.shadowRoot)&&void 0!==o?o:this.attachShadow(this.constructor.shadowRootOptions)};var a=o.connectedCallback;o.connectedCallback=function(){a.call(this),this.hasUpdated&&window.ShadyCSS.styleElement(this)};var d=o.H;o.H=function(t){var e=!this.hasUpdated;d.call(this,t),e&&window.ShadyCSS.styleElement(this)}}})},"function"==typeof define&&define.amd?define(t):t(),function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){
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
var t,e,n=new Set,o=new Map;null!==(t=(e=window).litHtmlPlatformSupport)&&void 0!==t||(e.litHtmlPlatformSupport=function(t,e){if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var i=function(t){var e=o.get(t);return void 0===e&&o.set(t,e=[]),e},a=new Map,d=t.prototype.A;t.prototype.A=function(t){var e,n=d.call(this,t),o=null===(e=this.C)||void 0===e?void 0:e.scope;if(void 0!==o){window.ShadyCSS.nativeShadow||window.ShadyCSS.prepareTemplateDom(n,o);var a=i(o),r=n.content.querySelectorAll("style");a.push.apply(a,Array.from(r).map((function(t){var e;return null===(e=t.parentNode)||void 0===e||e.removeChild(t),t.textContent})))}return n};var r=document.createDocumentFragment(),l=document.createComment(""),c=e.prototype,S=c.M;c.M=function(t,e){var a,d,c;void 0===e&&(e=this);var h,s=this.D.parentNode,p=null===(a=this.options)||void 0===a?void 0:a.scope;if(s instanceof ShadowRoot&&void 0!==(h=p)&&!n.has(h)){var u=this.D,v=this.E;r.appendChild(l),this.D=l,this.E=null,S.call(this,t,e);var w=(null===(d=t)||void 0===d?void 0:d._$litType$)?this.L.G.B:document.createElement("template");if(function(t,e){var a=i(t);if(a.length){var d=document.createElement("style");d.textContent=a.join("\n"),e.content.appendChild(d)}n.add(t),o.delete(t),window.ShadyCSS.prepareTemplateStyles(e,t)}(p,w),r.removeChild(l),null===(c=window.ShadyCSS)||void 0===c?void 0:c.nativeShadow){var f=w.content.querySelector("style");null!==f&&r.appendChild(f.cloneNode(!0))}s.insertBefore(r,v),this.D=u,this.E=v}else S.call(this,t,e)},c.F=function(e,n){var o,i=null===(o=this.options)||void 0===o?void 0:o.scope,d=a.get(i);void 0===d&&a.set(i,d=new Map);var r=d.get(e);return void 0===r&&d.set(e,r=new t(n,this.options)),r}}})})),null!==(e=(n=window).litElementPlatformSupport)&&void 0!==e||(n.litElementPlatformSupport=function(t){var e=t.LitElement;if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){e.N=!0;var n=e.prototype,o=n.createRenderRoot;n.createRenderRoot=function(){return this.I.scope=this.localName,o.call(this)}}})},"function"==typeof define&&define.amd?define(t):t()},"function"==typeof define&&define.amd?define(t):t()}));
