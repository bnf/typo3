define(["exports","../lit-html","../directive"],(function(exports,litHtml,directive){"use strict";
/**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const e={},i=directive.directive(class extends directive.Directive{constructor(){super(...arguments),this.previousValue=e}render(r,t){return t()}update(t,[s,e]){if(Array.isArray(s)){if(Array.isArray(this.previousValue)&&this.previousValue.length===s.length&&s.every((r,t)=>r===this.previousValue[t]))return litHtml.noChange}else if(this.previousValue===s)return litHtml.noChange;return this.previousValue=Array.isArray(s)?Array.from(s):s,this.render(s,e)}});exports.guard=i,Object.defineProperty(exports,"__esModule",{value:!0})}));
