import{noChange as T}from"../lit-html.esm.js";import{directive as e$1,Directive as i$1}from"../directive.esm.js";
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e={},i=e$1(class extends i$1{constructor(){super(...arguments),this.ot=e}render(r,t){return t()}update(t,[s,e]){if(Array.isArray(s)){if(Array.isArray(this.ot)&&this.ot.length===s.length&&s.every((r,t)=>r===this.ot[t]))return T}else if(this.ot===s)return T;return this.ot=Array.isArray(s)?Array.from(s):s,this.render(s,e)}});export{i as guard};
