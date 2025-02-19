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
class t{static byHeader(e,n={}){return"Content-Type"in n&&n["Content-Type"].includes("application/json")?JSON.stringify(e):t.toFormData(e)}static toFormData(e){const n=t.filter(t.flattenObject(e)),r=new FormData;for(const[t,e]of Object.entries(n))r.set(t,e);return r}static toSearchParams(e){if("string"==typeof e)return e;if(e instanceof Array)return e.join("&");const n=t.filter(t.flattenObject(e)),r=new URLSearchParams;for(const[t,e]of Object.entries(n))r.set(t,e);return decodeURI(r.toString())}static flattenObject(e,n=""){return Object.keys(e).reduce(((r,a)=>{const c=n.length?n+"[":"",o=n.length?"]":"";return"object"==typeof e[a]&&null!==e[a]?Object.assign(r,t.flattenObject(e[a],c+a+o)):r[c+a+o]=e[a],r}),{})}static filter(t){return Object.keys(t).forEach((e=>{void 0===t[e]&&delete t[e]})),t}}export{t as InputTransformer};