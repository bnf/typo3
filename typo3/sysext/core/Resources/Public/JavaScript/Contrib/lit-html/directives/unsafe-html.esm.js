import { nothing as A, noChange as w } from '../lit-html.esm.js';
import { Directive as s, PartType as t, directive as i } from '../directive.esm.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class n extends s{constructor(i){if(super(i),this.vt=A,i.type!==t.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===A)return this.Vt=void 0,this.vt=r;if(r===w)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.vt)return this.Vt;this.vt=r;const s=[r];return s.raw=s,this.Vt={_$litType$:this.constructor.resultType,strings:s,values:[]}}}n.directiveName="unsafeHTML",n.resultType=1;const o=i(n);

export { n as UnsafeHTMLDirective, o as unsafeHTML };
