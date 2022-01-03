import{directive,Directive}from"lit-html/directive.js";import{noChange}from"lit-html/lit-html.js";
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e={},i=directive(class extends Directive{constructor(){super(...arguments),this.ot=e}render(r,t){return t()}update(t,[s,e]){if(Array.isArray(s)){if(Array.isArray(this.ot)&&this.ot.length===s.length&&s.every((r,t)=>r===this.ot[t]))return noChange}else if(this.ot===s)return noChange;return this.ot=Array.isArray(s)?Array.from(s):s,this.render(s,e)}});export{i as guard};
