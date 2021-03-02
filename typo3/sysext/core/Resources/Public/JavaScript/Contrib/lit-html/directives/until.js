define(["exports","../lit-html","../directive","../directive-helpers","../async-directive"],(function(exports,litHtml,directive,directiveHelpers,asyncDirective){"use strict";
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
   */const o=t=>!directiveHelpers.isPrimitive(t)&&"function"==typeof t.then,i=directive.directive(class extends asyncDirective.AsyncDirective{constructor(){super(...arguments),this.kt=new WeakMap}render(...e){var _e$find;return null!==(_e$find=e.find(t=>!o(t)))&&void 0!==_e$find?_e$find:litHtml.noChange}update(e,r){let s=this.kt.get(e);void 0===s&&(s={lastRenderedIndex:2147483647,values:[]},this.kt.set(e,s));const i=s.values;let n=i.length;s.values=r;for(let t=0;t<r.length&&!(t>s.lastRenderedIndex);t++){const e=r[t];if(!o(e))return s.lastRenderedIndex=t,e;t<n&&e===i[t]||(s.lastRenderedIndex=2147483647,n=0,Promise.resolve(e).then(t=>{const r=s.values.indexOf(e);r>-1&&r<s.lastRenderedIndex&&(s.lastRenderedIndex=r,this.setValue(t))}))}return litHtml.noChange}});exports.until=i,Object.defineProperty(exports,"__esModule",{value:!0})}));
