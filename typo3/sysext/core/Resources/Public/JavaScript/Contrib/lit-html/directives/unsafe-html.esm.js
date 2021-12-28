import{Directive,PartType,directive}from"lit-html/directive.esm.js";import{nothing,noChange}from"lit-html/lit-html.esm.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class e extends Directive{constructor(i){if(super(i),this.it=nothing,i.type!==PartType.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===nothing||null==r)return this.vt=void 0,this.it=r;if(r===noChange)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.it)return this.vt;this.it=r;const s=[r];return s.raw=s,this.vt={_$litType$:this.constructor.resultType,strings:s,values:[]}}}e.directiveName="unsafeHTML",e.resultType=1;const o=directive(e);export{e as UnsafeHTMLDirective,o as unsafeHTML};
