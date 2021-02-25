define(["exports","../lit-html","../directive"],(function(e,r,i){"use strict";
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
   */const t={},s=i.directive(class extends i.Directive{constructor(){super(...arguments),this.previousValue=t}render(e,r){return r()}update(e,[i,t]){if(Array.isArray(i)){if(Array.isArray(this.previousValue)&&this.previousValue.length===i.length&&i.every((e,r)=>e===this.previousValue[r]))return r.noChange}else if(this.previousValue===i)return r.noChange;return this.previousValue=Array.isArray(i)?Array.from(i):i,this.render(i,t)}});e.guard=s,Object.defineProperty(e,"__esModule",{value:!0})}));
