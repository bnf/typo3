define(["exports","./lit-html"],(function(exports,litHtml){"use strict";
/**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const l=new Map,r=t=>(o,...i)=>{var r;const s=i.length;let n,v;const $=[],a=[];let c,e=0,d=!1;for(;e<s;){for(c=o[e];e<s&&void 0!==(v=i[e],n=null===(r=v)||void 0===r?void 0:r.It);)c+=n+o[++e],d=!0;a.push(v),$.push(c),e++}if(e===s&&$.push(o[s]),d){const t=$.join("$$lit$$");void 0===(o=l.get(t))&&l.set(t,o=$),i=a}return t(o,...i)},s=r(litHtml.html),n=r(litHtml.svg);exports.html=s,exports.svg=n,exports.unsafeStatic=t=>({It:t}),exports.withStatic=r,Object.defineProperty(exports,"__esModule",{value:!0})}));
