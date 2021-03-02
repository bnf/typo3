define(["exports","../lit-html","../directive","../directive-helpers"],(function(exports,litHtml,directive,directiveHelpers){"use strict";
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
   */const d=directive.directive(class extends directive.Directive{constructor(t){super(t),this.templateCache=new WeakMap}render(t){return[t]}update(s,[e]){if(directiveHelpers.isTemplateResult(this.value)&&(!directiveHelpers.isTemplateResult(e)||this.value.strings!==e.strings)){const e=directiveHelpers.getComittedValue(s).pop();let o=this.templateCache.get(this.value.strings);if(void 0===o){const s=document.createDocumentFragment();o=litHtml.render(litHtml.nothing,s),this.templateCache.set(this.value.strings,o)}directiveHelpers.setComittedValue(o,[e]),directiveHelpers.insertPart(o,void 0,e),e.setConnected(!1)}if(!directiveHelpers.isTemplateResult(e)||directiveHelpers.isTemplateResult(this.value)&&this.value.strings===e.strings)this.value=void 0;else{const t=this.templateCache.get(e.strings);if(void 0!==t){const i=directiveHelpers.getComittedValue(t).pop();directiveHelpers.clearPart(s),directiveHelpers.insertPart(s,void 0,i),directiveHelpers.setComittedValue(s,[i]),i.setConnected(!0)}this.value=e}return this.render(e)}});exports.cache=d,Object.defineProperty(exports,"__esModule",{value:!0})}));
