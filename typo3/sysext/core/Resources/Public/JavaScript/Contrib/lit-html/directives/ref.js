define(["exports","../lit-html","../directive","../async-directive"],(function(t,e,i,s){"use strict";
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
   */class n{}const h=new WeakMap,o=i.directive(class extends s.AsyncDirective{render(t){return e.nothing}update(t,[i]){const s=i!==this.Et;return s&&void 0!==this.Et&&this.At(void 0),(s||this.Mt!==this.Pt)&&(this.Et=i,this.At(this.Pt=t.element)),e.nothing}At(t){"function"==typeof this.Et?(void 0!==h.get(this.Et)&&this.Et(void 0),h.set(this.Et,t),void 0!==t&&this.Et(t)):this.Et.value=t}get Mt(){var t;return"function"==typeof this.Et?h.get(this.Et):null===(t=this.Et)||void 0===t?void 0:t.value}disconnected(){this.Mt===this.Pt&&this.At(void 0)}reconnected(){this.At(this.Pt)}});t.createRef=()=>new n,t.ref=o,Object.defineProperty(t,"__esModule",{value:!0})}));
