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
const e=["__proto__","prototype","constructor"],t=["assign","invoke","instance"];export function loadModule(e){if(!e.name)throw new Error("JavaScript module name is required");if(!(2&~e.flags)){if(16&e.flags){const t=new CustomEvent("typo3:import-javascript-module",{detail:{specifier:e.name,importPromise:null}});return top.document.dispatchEvent(t),t.detail.importPromise||Promise.reject(new Error("Top-level import failed"))}return import(e.name)}throw new Error("Unknown JavaScript module type")}export function resolveSubjectRef(e,t){const o=t.exportName;return"string"==typeof o?e[o]:e.default}export function executeJavaScriptModuleInstruction(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return loadModule(e);const r=e.items.filter((e=>t.includes(e.type))).map((t=>"assign"===t.type?r=>{o(resolveSubjectRef(r,e),t.assignments)}:"invoke"===t.type?o=>{const r=resolveSubjectRef(o,e);return"method"in t&&t.method?r[t.method](...t.args):r(...t.args)}:"instance"===t.type?o=>{const r=[null].concat(t.args);return new(resolveSubjectRef(o,e).bind(...r))}:()=>{}));return loadModule(e).then((e=>r.map((t=>t.call(null,e)))))}function o(t,r){Object.keys(r).forEach((n=>{if(-1!==e.indexOf(n))throw new Error("Property "+n+" is not allowed");var i;!((i=r[n])instanceof Object)||i instanceof Array||void 0===t[n]?Object.assign(t,{[n]:r[n]}):o(t[n],r[n])}))}export class JavaScriptItemProcessor{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach((e=>this.invoke(e.type,e.payload)))}invoke(e,t){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,t)}globalAssignment(e){o(window,e)}javaScriptModuleInstruction(e){executeJavaScriptModuleInstruction(e)}}