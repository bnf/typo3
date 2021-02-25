define(["exports","../lit-html","../directive","../directive-helpers"],(function(e,t,r,i){"use strict";
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
   */const n=r.directive(class extends r.Directive{constructor(e){if(super(e),e.type!==r.PartType.PROPERTY&&e.type!==r.PartType.ATTRIBUTE&&e.type!==r.PartType.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!i.isSingleExpression(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[n]){if(n===t.noChange||n===t.nothing)return n;const o=e.element,s=e.name;if(e.type===r.PartType.PROPERTY){if(n===o[s])return t.noChange}else if(e.type===r.PartType.BOOLEAN_ATTRIBUTE){if(!!n===o.hasAttribute(s))return t.noChange}else if(e.type===r.PartType.ATTRIBUTE&&o.getAttribute(s)===n+"")return t.noChange;return i.setComittedValue(e),n}});e.live=n,Object.defineProperty(e,"__esModule",{value:!0})}));
