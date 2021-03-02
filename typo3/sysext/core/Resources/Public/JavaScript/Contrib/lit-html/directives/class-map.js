define(["exports","../lit-html","../directive"],(function(exports,litHtml,directive){"use strict";
/**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const i=directive.directive(class extends directive.Directive{constructor(t){var _t$strings;if(super(t),t.type!==directive.PartType.ATTRIBUTE||"class"!==t.name||(null===(_t$strings=t.strings)||void 0===_t$strings?void 0:_t$strings.length)>2)throw Error("The `classMap` directive must be used in the `class` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).filter(s=>t[s]).join(" ")}update(s,[r]){if(void 0===this.previousClasses){this.previousClasses=new Set;for(const t in r)r[t]&&this.previousClasses.add(t);return this.render(r)}const e=s.element.classList;this.previousClasses.forEach(t=>{t in r||(e.remove(t),this.previousClasses.delete(t))});for(const t in r){const s=!!r[t];s!==this.previousClasses.has(t)&&(s?(e.add(t),this.previousClasses.add(t)):(e.remove(t),this.previousClasses.delete(t)))}return litHtml.noChange}});exports.classMap=i,Object.defineProperty(exports,"__esModule",{value:!0})}));
