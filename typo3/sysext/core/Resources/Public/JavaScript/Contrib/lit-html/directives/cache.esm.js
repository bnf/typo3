import{render as A,nothing as x}from"../lit-html.esm.js";import{isTemplateResult as v,getCommittedValue as a,setCommittedValue as s,insertPart as u,clearPart as p}from"../directive-helpers.esm.js";import{directive as e,Directive as i}from"../directive.esm.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const d=e(class extends i{constructor(t){super(t),this.tt=new WeakMap}render(t){return[t]}update(s$1,[e]){if(v(this.it)&&(!v(e)||this.it.strings!==e.strings)){const e=a(s$1).pop();let o=this.tt.get(this.it.strings);if(void 0===o){const s=document.createDocumentFragment();o=A(x,s),o.setConnected(!1),this.tt.set(this.it.strings,o)}s(o,[e]),u(o,void 0,e)}if(v(e)){if(!v(this.it)||this.it.strings!==e.strings){const t=this.tt.get(e.strings);if(void 0!==t){const i=a(t).pop();p(s$1),u(s$1,void 0,i),s(s$1,[i])}}this.it=e}else this.it=void 0;return this.render(e)}});export{d as cache};
