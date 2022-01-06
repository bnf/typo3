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
const FLAG_USE_REQUIRE_JS=1,FLAG_USE_IMPORTMAP=2,FLAG_USE_TOP_WINDOW=16,deniedProperties=["__proto__","prototype","constructor"],allowedJavaScriptItemTypes=["assign","invoke","instance"],defaultAllowedNames=["globalAssignment","javaScriptModuleInstruction"];let useShim=!1;const moduleImporter=e=>useShim?window.importShim(e):import(e).catch(()=>(useShim=!0,moduleImporter(e)));function loadModule(e){if(!e.name)throw new Error("JavaScript module name is required");if(2==(2&e.flags))return 16&e.flags?new Promise((e,n)=>{top.document.dispatchEvent(new CustomEvent("typo3:import-module",{detail:{loaded:n=>e(n),error:e=>n(e)}}))}):moduleImporter(e.name);if(1==(1&e.flags))return new Promise((n,o)=>{(16==(16&e.flags)?top.window:window).require([e.name],e=>n(e),e=>o(e))});throw new Error("Unknown JavaScript module type")}function executeJavaScriptModuleInstruction(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return void loadModule(e);const n=e.exportName,o=o=>"string"==typeof n?o[n]:1==(1&e.flags)?o:o.default,t=e.items.filter(e=>allowedJavaScriptItemTypes.includes(e.type)).map(n=>"assign"===n.type?e=>{mergeRecursive(o(e),n.assignments)}:"invoke"===n.type?t=>{if(void 0===t)return void console.error("JavaScriptHandler: invoke-instruction: module is undefined",e.name);const r=o(t);n.method in r||console.error("JavaScriptHandler: invoke-instruction: subjectRef not in module",e.name,n.method,t),r[n.method].apply(r,n.args)}:"instance"===n.type?t=>{if(void 0===t)return void console.error("JavaScriptHandler: instance-instruction: module is undefined",e.name);const r=[null].concat(n.args),i=o(t);new(i.bind.apply(i,r))}:e=>{});loadModule(e).then(e=>t.forEach(n=>n.call(null,e)))}function isObjectInstance(e){return e instanceof Object&&!(e instanceof Array)}function mergeRecursive(e,n){Object.keys(n).forEach(o=>{if(-1!==deniedProperties.indexOf(o))throw new Error("Property "+o+" is not allowed");isObjectInstance(n[o])&&void 0!==e[o]?mergeRecursive(e[o],n[o]):Object.assign(e,{[o]:n[o]})})}export class JavaScriptItemProcessor{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach(e=>this.invoke(e.type,e.payload))}invoke(e,n){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,n)}globalAssignment(e){mergeRecursive(window,e)}javaScriptModuleInstruction(e){executeJavaScriptModuleInstruction(e)}}