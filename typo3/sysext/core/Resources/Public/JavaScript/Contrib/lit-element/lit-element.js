define(["exports","@lit/reactive-element","lit-html"],(function(e,t,n){"use strict";
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
   */var r,l,o,i,c,d;const s=t.ReactiveElement;(null!==(r=(d=window).litElementVersions)&&void 0!==r?r:d.litElementVersions=[]).push("3.0.0-pre.3");class a extends t.ReactiveElement{constructor(){super(...arguments),this.I={host:this},this.Φo=void 0}createRenderRoot(){var e,t;const n=super.createRenderRoot();return null!==(e=(t=this.I).renderBefore)&&void 0!==e||(t.renderBefore=n.firstChild),n}update(e){const t=this.render();super.update(e),this.Φo=n.render(t,this.renderRoot,this.I)}connectedCallback(){var e;super.connectedCallback(),null===(e=this.Φo)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this.Φo)||void 0===e||e.setConnected(!1)}render(){return n.noChange}}a.finalized=!0,null!==(l=(o=window).litElementHydrateSupport)&&void 0!==l&&l.call(o,{LitElement:a}),null===(i=(c=window).litElementPlatformSupport)||void 0===i||i.call(c,{LitElement:a});Object.keys(t).forEach((function(n){"default"!==n&&Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[n]}})})),Object.keys(n).forEach((function(t){"default"!==t&&Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}})})),e.LitElement=a,e.UpdatingElement=s,e._Φ={O:(e,t,n)=>{e.O(t,n)},P:e=>e.P},Object.defineProperty(e,"__esModule",{value:!0})}));
