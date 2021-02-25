define(["exports","../lit-html","../directive","../directive-helpers","../async-directive"],(function(e,t,n,s,d){"use strict";
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
   */const r=e=>!s.isPrimitive(e)&&"function"==typeof e.then,i=n.directive(class extends d.AsyncDirective{constructor(){super(...arguments),this.kt=new WeakMap}render(...e){var n;return null!==(n=e.find(e=>!r(e)))&&void 0!==n?n:t.noChange}update(e,n){let s=this.kt.get(e);void 0===s&&(s={lastRenderedIndex:2147483647,values:[]},this.kt.set(e,s));const d=s.values;let i=d.length;s.values=n;for(let e=0;e<n.length&&!(e>s.lastRenderedIndex);e++){const t=n[e];if(!r(t))return s.lastRenderedIndex=e,t;e<i&&t===d[e]||(s.lastRenderedIndex=2147483647,i=0,Promise.resolve(t).then(e=>{const n=s.values.indexOf(t);n>-1&&n<s.lastRenderedIndex&&(s.lastRenderedIndex=n,this.setValue(e))}))}return t.noChange}});e.until=i,Object.defineProperty(e,"__esModule",{value:!0})}));
