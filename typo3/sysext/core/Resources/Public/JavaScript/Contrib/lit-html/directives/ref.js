define(["exports","../lit-html","../directive","../async-directive"],(function(exports,litHtml,directive,asyncDirective){"use strict";
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
   */class h{}const o=new WeakMap,n=directive.directive(class extends asyncDirective.AsyncDirective{render(i){return litHtml.nothing}update(i,[s]){const e=s!==this.Et;return e&&void 0!==this.Et&&this.At(void 0),(e||this.Mt!==this.Pt)&&(this.Et=s,this.At(this.Pt=i.element)),litHtml.nothing}At(t){"function"==typeof this.Et?(void 0!==o.get(this.Et)&&this.Et(void 0),o.set(this.Et,t),void 0!==t&&this.Et(t)):this.Et.value=t}get Mt(){var _this$Et;return"function"==typeof this.Et?o.get(this.Et):null===(_this$Et=this.Et)||void 0===_this$Et?void 0:_this$Et.value}disconnected(){this.Mt===this.Pt&&this.At(void 0)}reconnected(){this.At(this.Pt)}});exports.createRef=()=>new h,exports.ref=n,Object.defineProperty(exports,"__esModule",{value:!0})}));
