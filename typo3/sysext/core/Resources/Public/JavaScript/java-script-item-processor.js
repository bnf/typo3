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
const p=2,v=16,l=["__proto__","prototype","constructor"],f=["assign","invoke","instance"];function o(n){if(!n.name)throw new Error("JavaScript module name is required");if((n.flags&2)===2)if(n.flags&16){const t=new CustomEvent("typo3:import-javascript-module",{detail:{specifier:n.name,importPromise:null}});return top.document.dispatchEvent(t),t.detail.importPromise||Promise.reject(new Error("Top-level import failed"))}else return import(n.name);throw new Error("Unknown JavaScript module type")}function s(n,t){const e=t.exportName;return typeof e=="string"?n[e]:n.default}function a(n){if(!n.name)throw new Error("JavaScript module name is required");if(!n.items)return o(n);const t=n.items.filter(e=>f.includes(e.type)).map(e=>e.type==="assign"?r=>{const i=s(r,n);c(i,e.assignments)}:e.type==="invoke"?r=>{const i=s(r,n);return"method"in e&&e.method?i[e.method](...e.args):i(...e.args)}:e.type==="instance"?r=>{const i=[null].concat(e.args),u=s(r,n);return new(u.bind(...i))}:()=>{});return o(n).then(e=>t.map(r=>r.call(null,e)))}function d(n){return n instanceof Object&&!(n instanceof Array)}function c(n,t){Object.keys(t).forEach(e=>{if(l.indexOf(e)!==-1)throw new Error("Property "+e+" is not allowed");!d(t[e])||typeof n[e]>"u"?Object.assign(n,{[e]:t[e]}):c(n[e],t[e])})}class m{invokableNames=["globalAssignment","javaScriptModuleInstruction"];processItems(t){t.forEach(e=>this.invoke(e.type,e.payload))}invoke(t,e){if(!this.invokableNames.includes(t)||typeof this[t]!="function")throw new Error('Unknown handler name "'+t+'"');this[t].call(this,e)}globalAssignment(t){c(window,t)}javaScriptModuleInstruction(t){a(t)}}export{m as JavaScriptItemProcessor,a as executeJavaScriptModuleInstruction,o as loadModule,s as resolveSubjectRef};
