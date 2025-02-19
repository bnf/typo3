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
const e=2,t=16,o=["__proto__","prototype","constructor"],r=["assign","invoke","instance"];export function loadModule(o){if(!o.name)throw new Error("JavaScript module name is required");if((o.flags&e)===e){if(o.flags&t){const e=new CustomEvent("typo3:import-javascript-module",{detail:{specifier:o.name,importPromise:null}});return top.document.dispatchEvent(e),e.detail.importPromise||Promise.reject(new Error("Top-level import failed"))}return import(o.name)}throw new Error("Unknown JavaScript module type")}export function resolveSubjectRef(e,t){const o=t.exportName;return"string"==typeof o?e[o]:e.default}export function executeJavaScriptModuleInstruction(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return loadModule(e);const t=e.items.filter((e=>r.includes(e.type))).map((t=>"assign"===t.type?o=>{n(resolveSubjectRef(o,e),t.assignments)}:"invoke"===t.type?o=>{const r=resolveSubjectRef(o,e);return"method"in t&&t.method?r[t.method](...t.args):r(...t.args)}:"instance"===t.type?o=>{const r=[null].concat(t.args);return new(resolveSubjectRef(o,e).bind(...r))}:()=>{}));return loadModule(e).then((e=>t.map((t=>t.call(null,e)))))}function n(e,t){Object.keys(t).forEach((r=>{if(-1!==o.indexOf(r))throw new Error("Property "+r+" is not allowed");var i;!((i=t[r])instanceof Object)||i instanceof Array||void 0===e[r]?Object.assign(e,{[r]:t[r]}):n(e[r],t[r])}))}export class JavaScriptItemProcessor{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach((e=>this.invoke(e.type,e.payload)))}invoke(e,t){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,t)}globalAssignment(e){n(window,e)}javaScriptModuleInstruction(e){executeJavaScriptModuleInstruction(e)}}