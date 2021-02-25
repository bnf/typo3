define((function(){"use strict";var t;t=function(){
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
var t,e,o="__scoped";null!==(t=(e=window).reactiveElementPlatformSupport)&&void 0!==t||(e.reactiveElementPlatformSupport=function(t){var e=t.ReactiveElement;if(void 0!==window.ShadyCSS&&(!window.ShadyCSS.nativeShadow||window.ShadyCSS.ApplyShim)){var n=e.prototype;window.ShadyDOM&&window.ShadyDOM.inUse&&!0===window.ShadyDOM.noPatch&&window.ShadyDOM.patchElementProto(n);var a=n.createRenderRoot;n.createRenderRoot=function(){var t,e,n,i=this.localName;if(window.ShadyCSS.nativeShadow)return a.call(this);if(!this.constructor.hasOwnProperty(o)){this.constructor[o]=!0;var d=this.constructor.elementStyles.map((function(t){return t instanceof CSSStyleSheet?Array.from(t.cssRules).reduce((function(t,e){return t+e.cssText}),""):t.cssText}));null===(e=null===(t=window.ShadyCSS)||void 0===t?void 0:t.ScopingShim)||void 0===e||e.prepareAdoptedCssText(d,i),void 0===this.constructor.N&&window.ShadyCSS.prepareTemplateStyles(document.createElement("template"),i)}return null!==(n=this.shadowRoot)&&void 0!==n?n:this.attachShadow(this.constructor.shadowRootOptions)};var i=n.connectedCallback;n.connectedCallback=function(){i.call(this),this.hasUpdated&&window.ShadyCSS.styleElement(this)};var d=n.H;n.H=function(t){var e=!this.hasUpdated;d.call(this,t),e&&window.ShadyCSS.styleElement(this)}}})},"function"==typeof define&&define.amd?define(t):t()}));
