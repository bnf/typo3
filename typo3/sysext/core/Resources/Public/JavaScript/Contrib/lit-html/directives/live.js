define(["exports","../lit-html","../directive","../directive-helpers"],(function(exports,litHtml,directive,directiveHelpers){"use strict";
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
   */const l=directive.directive(class extends directive.Directive{constructor(r){if(super(r),r.type!==directive.PartType.PROPERTY&&r.type!==directive.PartType.ATTRIBUTE&&r.type!==directive.PartType.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!directiveHelpers.isSingleExpression(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t]){if(t===litHtml.noChange||t===litHtml.nothing)return t;const o=i.element,l=i.name;if(i.type===directive.PartType.PROPERTY){if(t===o[l])return litHtml.noChange}else if(i.type===directive.PartType.BOOLEAN_ATTRIBUTE){if(!!t===o.hasAttribute(l))return litHtml.noChange}else if(i.type===directive.PartType.ATTRIBUTE&&o.getAttribute(l)===t+"")return litHtml.noChange;return directiveHelpers.setComittedValue(i),t}});exports.live=l,Object.defineProperty(exports,"__esModule",{value:!0})}));
