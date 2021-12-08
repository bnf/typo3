import{isTemplateResult,getCommittedValue,setCommittedValue,insertPart,clearPart}from"lit-html/directive-helpers.js";import{directive,Directive}from"lit-html/directive.js";import{render,nothing}from"lit-html/lit-html.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const d=directive(class extends Directive{constructor(t){super(t),this.tt=new WeakMap}render(t){return[t]}update(s,[e]){if(isTemplateResult(this.it)&&(!isTemplateResult(e)||this.it.strings!==e.strings)){const e=getCommittedValue(s).pop();let o=this.tt.get(this.it.strings);if(void 0===o){const s=document.createDocumentFragment();o=render(nothing,s),o.setConnected(!1),this.tt.set(this.it.strings,o)}setCommittedValue(o,[e]),insertPart(o,void 0,e)}if(isTemplateResult(e)){if(!isTemplateResult(this.it)||this.it.strings!==e.strings){const t=this.tt.get(e.strings);if(void 0!==t){const i=getCommittedValue(t).pop();clearPart(s),insertPart(s,void 0,i),setCommittedValue(s,[i])}}this.it=e}else this.it=void 0;return this.render(e)}});export{d as cache};
