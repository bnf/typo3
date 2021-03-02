define(["exports","../lit-html","../directive"],(function(exports,litHtml,directive){"use strict";
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
   */const o=directive.directive(class extends directive.Directive{constructor(t){if(super(t),t.type!==directive.PartType.CHILD)throw Error("templateContent can only be used in child bindings")}render(r){return this.Vt===r?litHtml.noChange:(this.Vt=r,document.importNode(r.content,!0))}});exports.templateContent=o,Object.defineProperty(exports,"__esModule",{value:!0})}));
