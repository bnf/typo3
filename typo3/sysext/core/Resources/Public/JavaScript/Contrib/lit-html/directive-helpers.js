define(["exports","./lit-html"],(function(e,t){"use strict";
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
   */const{ft:i}=t._Σ,l=()=>document.createComment(""),o={};e.TemplateResultType={HTML:1,SVG:2},e.clearPart=e=>{e.V()},e.getComittedValue=e=>e.L,e.getDirectiveClass=e=>null==e?void 0:e._$litDirective$,e.insertPart=(e,t,o)=>{const n=e.D.parentNode,r=void 0===t?e.E:t.D;if(void 0===o){const t=n.insertBefore(l(),r),s=n.insertBefore(l(),r);o=new i(t,s,e,e.options)}else{var s,v;const t=o.E.nextSibling,i=o.Q!==e;if(i&&(null!==(s=(v=o).U)&&void 0!==s&&s.call(v,e),o.Q=e),t!==r||i){let e=o.D;for(;e!==t;){const t=e.nextSibling;n.insertBefore(e,r),e=t}}}return o},e.isDirectiveResult=e=>void 0!==(null==e?void 0:e._$litDirective$),e.isPrimitive=e=>null===e||"object"!=typeof e&&"function"!=typeof e,e.isSingleExpression=e=>void 0===e.strings,e.isTemplateResult=(e,t)=>void 0===t?void 0!==(null==e?void 0:e._$litType$):(null==e?void 0:e._$litType$)===t,e.removePart=e=>{var t;null===(t=e.T)||void 0===t||t.call(e,!1,!0);let i=e.D;const l=e.E.nextSibling;for(;i!==l;){const e=i.nextSibling;i.remove(),i=e}},e.setChildPartValue=(e,t,i=e)=>(e.M(t,i),e),e.setComittedValue=(e,t=o)=>e.L=t,Object.defineProperty(e,"__esModule",{value:!0})}));
