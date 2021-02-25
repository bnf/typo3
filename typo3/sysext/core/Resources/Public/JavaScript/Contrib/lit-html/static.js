define(["exports","./lit-html"],(function(t,e){"use strict";
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
   */const i=new Map,o=t=>(e,...o)=>{const s=o.length;let n,l;const u=[],c=[];let r,h=0,v=!1;for(;h<s;){for(r=e[h];h<s&&void 0!==(l=o[h],n=null===(d=l)||void 0===d?void 0:d.It);){var d;r+=n+e[++h],v=!0}c.push(l),u.push(r),h++}if(h===s&&u.push(e[s]),v){const t=u.join("$$lit$$");void 0===(e=i.get(t))&&i.set(t,e=u),o=c}return t(e,...o)},s=o(e.html),n=o(e.svg);t.html=s,t.svg=n,t.unsafeStatic=t=>({It:t}),t.withStatic=o,Object.defineProperty(t,"__esModule",{value:!0})}));
