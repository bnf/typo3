/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
const e=["__proto__","prototype","constructor"],t=["assign","invoke","instance"];function n(e){if(!e.name)throw new Error("JavaScript module name is required");if(!(2&~e.flags)){if(16&e.flags){const t=new CustomEvent("typo3:import-javascript-module",{detail:{specifier:e.name,importPromise:null}});return top.document.dispatchEvent(t),t.detail.importPromise||Promise.reject(new Error("Top-level import failed"))}return import(e.name)}throw new Error("Unknown JavaScript module type")}function r(e,t){const n=t.exportName;return"string"==typeof n?e[n]:e.default}function o(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return n(e);const o=e.items.filter((e=>t.includes(e.type))).map((t=>"assign"===t.type?n=>{i(r(n,e),t.assignments)}:"invoke"===t.type?n=>{const o=r(n,e);return"method"in t&&t.method?o[t.method](...t.args):o(...t.args)}:"instance"===t.type?n=>{const o=[null].concat(t.args);return new(r(n,e).bind(...o))}:()=>{}));return n(e).then((e=>o.map((t=>t.call(null,e)))))}function i(t,n){Object.keys(n).forEach((r=>{if(-1!==e.indexOf(r))throw new Error("Property "+r+" is not allowed");var o;!((o=n[r])instanceof Object)||o instanceof Array||void 0===t[r]?Object.assign(t,{[r]:n[r]}):i(t[r],n[r])}))}class s{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach((e=>this.invoke(e.type,e.payload)))}invoke(e,t){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,t)}globalAssignment(e){i(window,e)}javaScriptModuleInstruction(e){o(e)}}export{s as JavaScriptItemProcessor,o as executeJavaScriptModuleInstruction,n as loadModule,r as resolveSubjectRef};