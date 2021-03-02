define(["exports","../directive","../directive-helpers"],(function(exports,directive,directiveHelpers){"use strict";
/**
   * @license
   * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */class o extends directive.Directive{render(){}update(e){const r=e.parentNode;if("function"==typeof r.renderLight)return r.renderLight()}}o.Ct=!0;const i=directive.directive(o);exports.isRenderLightDirective=e=>{var _directiveHelpers$get;return null===(_directiveHelpers$get=directiveHelpers.getDirectiveClass(e))||void 0===_directiveHelpers$get?void 0:_directiveHelpers$get.Ct},exports.renderLight=i,Object.defineProperty(exports,"__esModule",{value:!0})}));
