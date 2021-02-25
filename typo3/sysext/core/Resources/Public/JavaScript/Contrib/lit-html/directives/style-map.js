define(["exports","../lit-html","../directive"],(function(e,t,r){"use strict";
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
   */const i=r.directive(class extends r.Directive{constructor(e){var t;if(super(e),e.type!==r.PartType.ATTRIBUTE||"style"!==e.name||(null===(t=e.strings)||void 0===t?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{const i=e[r];return null===i?t:t+`${r=r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[r]){const{style:i}=e.element;if(void 0===this.previousStyleProperties){this.previousStyleProperties=new Set;for(const e in r)this.previousStyleProperties.add(e);return this.render(r)}this.previousStyleProperties.forEach(e=>{e in r||(this.previousStyleProperties.delete(e),-1===e.indexOf("-")?i[e]=null:i.removeProperty(e))});for(const e in r)this.previousStyleProperties.add(e),-1===e.indexOf("-")?i[e]=r[e]:i.setProperty(e,r[e]);return t.noChange}});e.styleMap=i,Object.defineProperty(e,"__esModule",{value:!0})}));
