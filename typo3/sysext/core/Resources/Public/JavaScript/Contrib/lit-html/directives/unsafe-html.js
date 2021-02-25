define(["exports","../lit-html","../directive"],(function(e,t,i){"use strict";
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
   */class r extends i.Directive{constructor(e){if(super(e),this.value=t.nothing,e.type!==i.PartType.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===t.nothing)return this.templateResult=void 0,this.value=e;if(e===t.noChange)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.value)return this.templateResult;this.value=e;const i=[e];return i.raw=i,this.templateResult={_$litType$:this.constructor.resultType,strings:i,values:[]}}}r.directiveName="unsafeHTML",r.resultType=1;const s=i.directive(r);e.UnsafeHTML=r,e.unsafeHTML=s,Object.defineProperty(e,"__esModule",{value:!0})}));
