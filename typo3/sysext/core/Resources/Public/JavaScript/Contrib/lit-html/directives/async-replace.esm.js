import{noChange as T}from"../lit-html.esm.js";import{directive as e}from"../directive.esm.js";import{AsyncDirective as d}from"../async-directive.esm.js";import{PseudoWeakRef as s,Pauser as i,forAwaitOf as t}from"./private-async-helpers.esm.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class o extends d{constructor(){super(...arguments),this._$CG=new s(this),this._$CK=new i}render(i,s){return T}update(i,[s,r]){if(this.isConnected||this.disconnected(),s===this._$CJ)return;this._$CJ=s;let e=0;const{_$CG:o,_$CK:h}=this;return t(s,async t=>{for(;h.get();)await h.get();const i=o.deref();if(void 0!==i){if(i._$CJ!==s)return!1;void 0!==r&&(t=r(t,e)),i.commitValue(t,e),e++}return!0}),T}commitValue(t,i){this.setValue(t)}disconnected(){this._$CG.disconnect(),this._$CK.pause()}reconnected(){this._$CG.reconnect(this),this._$CK.resume()}}const h=e(o);export{o as AsyncReplaceDirective,h as asyncReplace};
