import{directive}from"lit-html/directive.esm.js";import{noChange}from"lit-html/lit-html.esm.js";import{AsyncDirective}from"lit-html/async-directive.esm.js";import{PseudoWeakRef,Pauser,forAwaitOf}from"lit-html/directives/private-async-helpers.esm.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class o extends AsyncDirective{constructor(){super(...arguments),this._$CG=new PseudoWeakRef(this),this._$CK=new Pauser}render(i,s){return noChange}update(i,[s,r]){if(this.isConnected||this.disconnected(),s===this._$CJ)return;this._$CJ=s;let e=0;const{_$CG:o,_$CK:h}=this;return forAwaitOf(s,async t=>{for(;h.get();)await h.get();const i=o.deref();if(void 0!==i){if(i._$CJ!==s)return!1;void 0!==r&&(t=r(t,e)),i.commitValue(t,e),e++}return!0}),noChange}commitValue(t,i){this.setValue(t)}disconnected(){this._$CG.disconnect(),this._$CK.pause()}reconnected(){this._$CG.reconnect(this),this._$CK.resume()}}const h=directive(o);export{o as AsyncReplaceDirective,h as asyncReplace};
