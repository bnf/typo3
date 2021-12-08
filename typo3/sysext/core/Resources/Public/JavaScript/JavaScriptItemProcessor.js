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
const FLAG_USE_REQUIRE_JS=1,FLAG_USE_TOP_WINDOW=16,deniedProperties=["__proto__","prototype","constructor"],allowedJavaScriptItemTypes=["assign","invoke","instance"];function loadModule(e){if(!e.name)throw new Error("JavaScript module name is required");if(1==(1&e.flags))return new Promise((t,n)=>{(16==(16&e.flags)?top.window:window).require([e.name],e=>t(e),e=>n(e))});throw new Error("Unknown JavaScript module type")}function executeJavaScriptModuleInstruction(e){if(!e.name)throw new Error("JavaScript module name is required");if(!e.items)return void loadModule(e);const t=e.exportName,n=e=>"string"==typeof t?e[t]:e,o=e.items.filter(e=>allowedJavaScriptItemTypes.includes(e.type)).map(e=>"assign"===e.type?t=>{mergeRecursive(n(t),e.assignments)}:"invoke"===e.type?t=>{const o=n(t);o[e.method].apply(o,e.args)}:"instance"===e.type?t=>{const o=[null].concat(e.args),r=n(t);new(r.bind.apply(r,o))}:e=>{});loadModule(e).then(e=>o.forEach(t=>t.call(null,e)))}function isObjectInstance(e){return e instanceof Object&&!(e instanceof Array)}function mergeRecursive(e,t){Object.keys(t).forEach(n=>{if(-1!==deniedProperties.indexOf(n))throw new Error("Property "+n+" is not allowed");isObjectInstance(t[n])&&void 0!==e[n]?mergeRecursive(e[n],t[n]):Object.assign(e,{[n]:t[n]})})}export class JavaScriptItemProcessor{constructor(){this.invokableNames=["globalAssignment","javaScriptModuleInstruction"]}processItems(e){e.forEach(e=>this.invoke(e.type,e.payload))}invoke(e,t){if(!this.invokableNames.includes(e)||"function"!=typeof this[e])throw new Error('Unknown handler name "'+e+'"');this[e].call(this,t)}globalAssignment(e){mergeRecursive(window,e)}javaScriptModuleInstruction(e){executeJavaScriptModuleInstruction(e)}}