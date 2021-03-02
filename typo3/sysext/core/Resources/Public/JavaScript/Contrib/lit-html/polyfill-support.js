define((function(){"use strict";var i;i=function(){
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
var i,n,o=new Set,t=new Map;null!==(i=(n=window).litHtmlPlatformSupport)&&void 0!==i||(n.litHtmlPlatformSupport=function(i,n){if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var v=function(i){var n=t.get(i);return void 0===n&&t.set(i,n=[]),n},d=new Map,e=i.prototype.A;i.prototype.A=function(i){var n,o=e.call(this,i),t=null===(n=this.C)||void 0===n?void 0:n.scope;if(void 0!==t){window.ShadyCSS.nativeShadow||window.ShadyCSS.prepareTemplateDom(o,t);var d=v(t),u=o.content.querySelectorAll("style");d.push.apply(d,Array.from(u).map((function(i){var n;return null===(n=i.parentNode)||void 0===n||n.removeChild(i),i.textContent})))}return o};var u=document.createDocumentFragment(),r=document.createComment(""),l=n.prototype,a=l.M;l.M=function(i,n){var d,e,l;void 0===n&&(n=this);var s,f=this.D.parentNode,w=null===(d=this.options)||void 0===d?void 0:d.scope;if(f instanceof ShadowRoot&&void 0!==(s=w)&&!o.has(s)){var h=this.D,c=this.E;u.appendChild(r),this.D=r,this.E=null,a.call(this,i,n);var m=(null===(e=i)||void 0===e?void 0:e._$litType$)?this.L.G.B:document.createElement("template");if(function(i,n){var d=v(i);if(d.length){var e=document.createElement("style");e.textContent=d.join("\n"),n.content.appendChild(e)}o.add(i),t.delete(i),window.ShadyCSS.prepareTemplateStyles(n,i)}(w,m),u.removeChild(r),null===(l=window.ShadyCSS)||void 0===l?void 0:l.nativeShadow){var p=m.content.querySelector("style");null!==p&&u.appendChild(p.cloneNode(!0))}f.insertBefore(u,c),this.D=h,this.E=c}else a.call(this,i,n)},l.F=function(n,o){var t,v=null===(t=this.options)||void 0===t?void 0:t.scope,e=d.get(v);void 0===e&&d.set(v,e=new Map);var u=e.get(n);return void 0===u&&e.set(n,u=new i(o,this.options)),u}}})},"function"==typeof define&&define.amd?define(i):i()}));
