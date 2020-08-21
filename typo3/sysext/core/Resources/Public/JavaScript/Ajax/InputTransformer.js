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
define((function(){"use strict";class t{static byHeader(e,r={}){return r.hasOwnProperty("Content-Type")&&r["Content-Type"].includes("application/json")?JSON.stringify(e):t.toFormData(e)}static toFormData(e){const r=t.filter(t.flattenObject(e)),n=new FormData;for(const[t,e]of Object.entries(r))n.set(t,e);return n}static toSearchParams(e){if("string"==typeof e)return e;if(e instanceof Array)return e.join("&");const r=t.filter(t.flattenObject(e)),n=new URLSearchParams;for(const[t,e]of Object.entries(r))n.set(t,e);return decodeURI(n.toString())}static flattenObject(e,r=""){return Object.keys(e).reduce((n,a)=>{const c=r.length?r+"[":"",o=r.length?"]":"";return"object"==typeof e[a]?Object.assign(n,t.flattenObject(e[a],c+a+o)):n[c+a+o]=e[a],n},{})}static filter(t){return Object.keys(t).forEach(e=>{void 0===t[e]&&delete t[e]}),t}}return{InputTransformer:t}}));