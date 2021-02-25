define(["exports","./base"],(function(e,t){"use strict";
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
   */const o=Element.prototype,n=o.msMatchesSelector||o.webkitMatchesSelector;e.queryAssignedNodes=function(e="",o=!1,r=""){return(s,l)=>{const d={get(){var t,s;const l="slot"+(e?`[name=${e}]`:":not([name])");let d=null===(t=this.renderRoot)||void 0===t||null===(s=t.querySelector(l))||void 0===s?void 0:s.assignedNodes({flatten:o});return d&&r&&(d=d.filter(e=>e.nodeType===Node.ELEMENT_NODE&&(e.matches?e.matches(r):n.call(e,r)))),d},enumerable:!0,configurable:!0};return void 0!==l?t.legacyPrototypeMethod(d,s,l):t.standardPrototypeMethod(d,s)}},Object.defineProperty(e,"__esModule",{value:!0})}));
