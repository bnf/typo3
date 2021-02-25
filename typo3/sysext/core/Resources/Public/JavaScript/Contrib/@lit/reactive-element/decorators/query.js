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
   */e.query=function(e,o){return(r,n)=>{const i={get(){var t;return null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e)},enumerable:!0,configurable:!0};if(o){const t=void 0!==n?n:r.key,o="symbol"==typeof t?Symbol():"__"+t;i.get=function(){var t;return void 0===this[o]&&(this[o]=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e)),this[o]}}return void 0!==n?t.legacyPrototypeMethod(i,r,n):t.standardPrototypeMethod(i,r)}},Object.defineProperty(e,"__esModule",{value:!0})}));
