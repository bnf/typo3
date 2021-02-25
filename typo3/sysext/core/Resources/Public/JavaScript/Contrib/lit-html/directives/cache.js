define(["exports","../lit-html","../directive","../directive-helpers"],(function(e,t,s,i){"use strict";
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
   */const r=s.directive(class extends s.Directive{constructor(e){super(e),this.templateCache=new WeakMap}render(e){return[e]}update(e,[s]){if(i.isTemplateResult(this.value)&&(!i.isTemplateResult(s)||this.value.strings!==s.strings)){const s=i.getComittedValue(e).pop();let r=this.templateCache.get(this.value.strings);if(void 0===r){const e=document.createDocumentFragment();r=t.render(t.nothing,e),this.templateCache.set(this.value.strings,r)}i.setComittedValue(r,[s]),i.insertPart(r,void 0,s),s.setConnected(!1)}if(!i.isTemplateResult(s)||i.isTemplateResult(this.value)&&this.value.strings===s.strings)this.value=void 0;else{const t=this.templateCache.get(s.strings);if(void 0!==t){const s=i.getComittedValue(t).pop();i.clearPart(e),i.insertPart(e,void 0,s),i.setComittedValue(e,[s]),s.setConnected(!0)}this.value=s}return this.render(s)}});e.cache=r,Object.defineProperty(e,"__esModule",{value:!0})}));
