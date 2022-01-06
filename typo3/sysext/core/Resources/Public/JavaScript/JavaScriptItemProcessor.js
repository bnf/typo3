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
define(["require","exports"],(function(e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.JavaScriptItemProcessor=void 0;const o=["__proto__","prototype","constructor"],r=["assign","invoke","instance"];function t(e){if(!e.name)throw new Error("JavaScript module name is required");if(1==(1&e.flags))return new Promise((n,o)=>{(16==(16&e.flags)?top.window:window).require([e.name],e=>n(e),e=>o(e))});throw new Error("Unknown JavaScript module type")}function i(e,n){Object.keys(n).forEach(r=>{if(-1!==o.indexOf(r))throw new Error("Property "+r+" is not allowed");var t;!((t=n[r])instanceof Object)||t instanceof Array||void 0===e[r]?Object.assign(e,{[r]:n[r]}):i(e[r],n[r])})}n.JavaScriptItemProcessor=class{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach(e=>this.invoke(e.type,e.payload))}invoke(e,n){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,n)}globalAssignment(e){i(window,e)}javaScriptModuleInstruction(e){!function(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return void t(e);const n=e.exportName,o=e=>"string"==typeof n?e[n]:e,s=e.items.filter(e=>r.includes(e.type)).map(n=>"assign"===n.type?e=>{i(o(e),n.assignments)}:"invoke"===n.type?r=>{if(void 0===r)return void console.error("JavaScriptHandler: invoke-instruction: module is undefined",e.name);const t=o(r);n.method in t||console.error("JavaScriptHandler: invoke-instruction: subjectRef not in module",e.name,n.method,r),t[n.method].apply(t,n.args)}:"instance"===n.type?r=>{if(void 0===r)return void console.error("JavaScriptHandler: instance-instruction: module is undefined",e.name);const t=[null].concat(n.args),i=o(r);new(i.bind.apply(i,t))}:e=>{});t(e).then(e=>s.forEach(n=>n.call(null,e)))}(e)}}}));