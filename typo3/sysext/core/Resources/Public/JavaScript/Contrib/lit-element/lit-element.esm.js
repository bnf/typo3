import { ReactiveElement as a$1 } from '../@lit/reactive-element/reactive-element.esm.js';
export { ReactiveElement, defaultConverter, notEqual } from '../@lit/reactive-element/reactive-element.esm.js';
import { render as V, noChange as w } from '../lit-html/lit-html.esm.js';
export { _Σ, html, noChange, nothing, render, svg } from '../lit-html/lit-html.esm.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var i,l,o,s,n,a;const c=a$1;(null!==(i=(a=globalThis).litElementVersions)&&void 0!==i?i:a.litElementVersions=[]).push("3.0.0-rc.2");class h extends a$1{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0;}createRenderRoot(){var t,e;const r=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=r.firstChild),r}update(t){const r=this.render();super.update(t),this.Φt=V(r,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1);}render(){return w}}h.finalized=!0,h._$litElement$=!0,null===(o=(l=globalThis).litElementHydrateSupport)||void 0===o||o.call(l,{LitElement:h}),null===(n=(s=globalThis).litElementPlatformSupport)||void 0===n||n.call(s,{LitElement:h});const u={K:(t,e,r)=>{t.K(e,r);},L:t=>t.L};

export { h as LitElement, c as UpdatingElement, u as _Φ };
