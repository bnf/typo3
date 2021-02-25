define(["exports","../lit-html","../directive"],(function(e,t,n){"use strict";
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
   */const r=n.directive(class extends n.Directive{constructor(e){if(super(e),e.type!==n.PartType.CHILD)throw Error("templateContent can only be used in child bindings")}render(e){return this.Vt===e?t.noChange:(this.Vt=e,document.importNode(e.content,!0))}});e.templateContent=r,Object.defineProperty(e,"__esModule",{value:!0})}));
