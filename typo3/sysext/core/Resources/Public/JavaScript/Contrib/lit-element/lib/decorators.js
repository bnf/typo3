define(["exports"],(function(e){"use strict";
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
     */const t=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?Object.assign(Object.assign({},t),{finisher(n){n.createProperty(t.key,e)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(n){n.createProperty(t.key,e)}};function n(e){return(n,r)=>void 0!==r?((e,t,n)=>{t.constructor.createProperty(n,e)})(e,n,r):t(e,n)}const r=(e,t,n)=>{Object.defineProperty(t,n,e)},o=(e,t)=>({kind:"method",placement:"prototype",key:t.key,descriptor:e});const i=Element.prototype,s=i.msMatchesSelector||i.webkitMatchesSelector;e.customElement=e=>t=>"function"==typeof t?((e,t)=>(window.customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:n,elements:r}=t;return{kind:n,elements:r,finisher(t){window.customElements.define(e,t)}}})(e,t),e.eventOptions=function(e){return(t,n)=>void 0!==n?((e,t,n)=>{Object.assign(t[n],e)})(e,t,n):((e,t)=>Object.assign(Object.assign({},t),{finisher(n){Object.assign(n.prototype[t.key],e)}}))(e,t)},e.internalProperty=function(e){return n({attribute:!1,hasChanged:null==e?void 0:e.hasChanged})},e.property=n,e.query=function(e,t){return(n,i)=>{const s={get(){return this.renderRoot.querySelector(e)},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof i?Symbol():"__"+i;s.get=function(){return void 0===this[t]&&(this[t]=this.renderRoot.querySelector(e)),this[t]}}return void 0!==i?r(s,n,i):o(s,n)}},e.queryAll=function(e){return(t,n)=>{const i={get(){return this.renderRoot.querySelectorAll(e)},enumerable:!0,configurable:!0};return void 0!==n?r(i,t,n):o(i,t)}},e.queryAssignedNodes=function(e="",t=!1,n=""){return(i,c)=>{const u={get(){const r="slot"+(e?`[name=${e}]`:":not([name])"),o=this.renderRoot.querySelector(r);let i=o&&o.assignedNodes({flatten:t});return i&&n&&(i=i.filter(e=>e.nodeType===Node.ELEMENT_NODE&&e.matches?e.matches(n):s.call(e,n))),i},enumerable:!0,configurable:!0};return void 0!==c?r(u,i,c):o(u,i)}},e.queryAsync=function(e){return(t,n)=>{const i={async get(){return await this.updateComplete,this.renderRoot.querySelector(e)},enumerable:!0,configurable:!0};return void 0!==n?r(i,t,n):o(i,t)}},Object.defineProperty(e,"__esModule",{value:!0})}));
