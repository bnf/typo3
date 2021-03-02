define(["exports","./lit-html"],(function(exports,litHtml){"use strict";
/**
   * @license
   * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const s=new Map,l=t=>(o,...i)=>{const l=i.length;let r,n;const $=[],c=[];let e,a=0,f=!1;for(;a<l;){for(e=o[a];a<l&&void 0!==(n=i[a],r=null===(_n=n)||void 0===_n?void 0:_n.It);){var _n;e+=r+o[++a],f=!0}c.push(n),$.push(e),a++}if(a===l&&$.push(o[l]),f){const t=$.join("$$lit$$");void 0===(o=s.get(t))&&s.set(t,o=$),i=c}return t(o,...i)},r=l(litHtml.html),n=l(litHtml.svg);exports.html=r,exports.svg=n,exports.unsafeStatic=t=>({It:t}),exports.withStatic=l,Object.defineProperty(exports,"__esModule",{value:!0})}));
