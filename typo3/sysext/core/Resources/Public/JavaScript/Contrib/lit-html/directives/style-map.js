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
   */const i=directive.directive(class extends directive.Directive{constructor(t){var _t$strings;if(super(t),t.type!==directive.PartType.ATTRIBUTE||"style"!==t.name||(null===(_t$strings=t.strings)||void 0===_t$strings?void 0:_t$strings.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const s=t[r];return null===s?e:e+`${r=r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.previousStyleProperties){this.previousStyleProperties=new Set;for(const t in r)this.previousStyleProperties.add(t);return this.render(r)}this.previousStyleProperties.forEach(t=>{t in r||(this.previousStyleProperties.delete(t),-1===t.indexOf("-")?s[t]=null:s.removeProperty(t))});for(const t in r)this.previousStyleProperties.add(t),-1===t.indexOf("-")?s[t]=r[t]:s.setProperty(t,r[t]);return litHtml.noChange}});exports.styleMap=i,Object.defineProperty(exports,"__esModule",{value:!0})}));
