define((function(){"use strict";var e;e=function(){
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
var e,t,n=new Set,o=new Map;null!==(e=(t=window).litHtmlPlatformSupport)&&void 0!==e||(t.litHtmlPlatformSupport=function(e,t){if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var i=function(e){var t=o.get(e);return void 0===t&&o.set(e,t=[]),t},a=new Map,d=e.prototype.A;e.prototype.A=function(e){var t,n=d.call(this,e),o=null===(t=this.C)||void 0===t?void 0:t.scope;if(void 0!==o){window.ShadyCSS.nativeShadow||window.ShadyCSS.prepareTemplateDom(n,o);var a=i(o),l=n.content.querySelectorAll("style");a.push.apply(a,Array.from(l).map((function(e){var t;return null===(t=e.parentNode)||void 0===t||t.removeChild(e),e.textContent})))}return n};var l=document.createDocumentFragment(),r=document.createComment(""),p=t.prototype,v=p.M;p.M=function(e,t){var a,d,p;void 0===t&&(t=this);var h,s=this.D.parentNode,u=null===(a=this.options)||void 0===a?void 0:a.scope;if(s instanceof ShadowRoot&&void 0!==(h=u)&&!n.has(h)){var c=this.D,S=this.E;l.appendChild(r),this.D=r,this.E=null,v.call(this,e,t);var f=(null===(d=e)||void 0===d?void 0:d._$litType$)?this.L.G.B:document.createElement("template");if(function(e,t){var a=i(e);if(a.length){var d=document.createElement("style");d.textContent=a.join("\n"),t.content.appendChild(d)}n.add(e),o.delete(e),window.ShadyCSS.prepareTemplateStyles(t,e)}(u,f),l.removeChild(r),null===(p=window.ShadyCSS)||void 0===p?void 0:p.nativeShadow){var w=f.content.querySelector("style");null!==w&&l.appendChild(w.cloneNode(!0))}s.insertBefore(l,S),this.D=c,this.E=S}else v.call(this,e,t)},p.F=function(t,n){var o,i=null===(o=this.options)||void 0===o?void 0:o.scope,d=a.get(i);void 0===d&&a.set(i,d=new Map);var l=d.get(t);return void 0===l&&d.set(t,l=new e(n,this.options)),l}}})},"function"==typeof define&&define.amd?define(e):e()}));
