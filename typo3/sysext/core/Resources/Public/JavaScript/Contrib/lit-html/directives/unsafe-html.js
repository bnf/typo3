define(["exports","../lit-html","../directive"],(function(exports,litHtml,directive){"use strict";
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
   */class n extends directive.Directive{constructor(i){if(super(i),this.value=litHtml.nothing,i.type!==directive.PartType.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(r){if(r===litHtml.nothing)return this.templateResult=void 0,this.value=r;if(r===litHtml.noChange)return r;if("string"!=typeof r)throw Error(this.constructor.directiveName+"() called with a non-string value");if(r===this.value)return this.templateResult;this.value=r;const s=[r];return s.raw=s,this.templateResult={_$litType$:this.constructor.resultType,strings:s,values:[]}}}n.directiveName="unsafeHTML",n.resultType=1;const o=directive.directive(n);exports.UnsafeHTML=n,exports.unsafeHTML=o,Object.defineProperty(exports,"__esModule",{value:!0})}));
