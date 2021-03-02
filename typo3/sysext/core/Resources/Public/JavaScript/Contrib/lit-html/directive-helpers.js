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
   */const{ft:t}=litHtml._Σ,f=()=>document.createComment(""),v={};exports.TemplateResultType={HTML:1,SVG:2},exports.clearPart=o=>{o.V()},exports.getComittedValue=o=>o.L,exports.getDirectiveClass=o=>null==o?void 0:o._$litDirective$,exports.insertPart=(o,n,i)=>{const e=o.D.parentNode,c=void 0===n?o.E:n.D;if(void 0===i){const n=e.insertBefore(f(),c),s=e.insertBefore(f(),c);i=new t(n,s,o,o.options)}else{var _i$U,_i;const t=i.E.nextSibling,n=i.Q!==o;if(n&&(null!==(_i$U=(_i=i).U)&&void 0!==_i$U&&_i$U.call(_i,o),i.Q=o),t!==c||n){let o=i.D;for(;o!==t;){const t=o.nextSibling;e.insertBefore(o,c),o=t}}}return i},exports.isDirectiveResult=o=>void 0!==(null==o?void 0:o._$litDirective$),exports.isPrimitive=o=>null===o||"object"!=typeof o&&"function"!=typeof o,exports.isSingleExpression=o=>void 0===o.strings,exports.isTemplateResult=(o,t)=>void 0===t?void 0!==(null==o?void 0:o._$litType$):(null==o?void 0:o._$litType$)===t,exports.removePart=o=>{var _o$T;null===(_o$T=o.T)||void 0===_o$T||_o$T.call(o,!1,!0);let t=o.D;const n=o.E.nextSibling;for(;t!==n;){const o=t.nextSibling;t.remove(),t=o}},exports.setChildPartValue=(o,t,n=o)=>(o.M(t,n),o),exports.setComittedValue=(o,t=v)=>o.L=t,Object.defineProperty(exports,"__esModule",{value:!0})}));
