define(["exports","../lit-html","../directive"],(function(e,s,t){"use strict";
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
   */const i=t.directive(class extends t.Directive{constructor(e){var s;if(super(e),e.type!==t.PartType.ATTRIBUTE||"class"!==e.name||(null===(s=e.strings)||void 0===s?void 0:s.length)>2)throw Error("The `classMap` directive must be used in the `class` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).filter(s=>e[s]).join(" ")}update(e,[t]){if(void 0===this.previousClasses){this.previousClasses=new Set;for(const e in t)t[e]&&this.previousClasses.add(e);return this.render(t)}const i=e.element.classList;this.previousClasses.forEach(e=>{e in t||(i.remove(e),this.previousClasses.delete(e))});for(const e in t){const s=!!t[e];s!==this.previousClasses.has(e)&&(s?(i.add(e),this.previousClasses.add(e)):(i.remove(e),this.previousClasses.delete(e)))}return s.noChange}});e.classMap=i,Object.defineProperty(e,"__esModule",{value:!0})}));
