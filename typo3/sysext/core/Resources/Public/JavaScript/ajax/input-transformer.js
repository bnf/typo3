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
export class InputTransformer{static byHeader(e,headers={}){return"Content-Type"in headers&&headers["Content-Type"].includes("application/json")?JSON.stringify(e):InputTransformer.toFormData(e)}static toFormData(e){const t=InputTransformer.filter(InputTransformer.flattenObject(e)),r=new FormData
for(const[key,value]of Object.entries(t))r.set(key,value)
return r}static toSearchParams(e){if("string"==typeof e)return e
if(e instanceof Array)return e.join("&")
const t=InputTransformer.filter(InputTransformer.flattenObject(e)),r=new URLSearchParams
for(const[key,value]of Object.entries(t))r.set(key,value)
return decodeURI(r.toString())}static flattenObject(e,prefix=""){return Object.keys(e).reduce(((t,r)=>{const n=prefix.length?prefix+"[":"",a=prefix.length?"]":""
return"object"==typeof e[r]&&null!==e[r]?Object.assign(t,InputTransformer.flattenObject(e[r],n+r+a)):t[n+r+a]=e[r],t}),{})}static filter(e){return Object.keys(e).forEach((t=>{void 0===e[t]&&delete e[t]})),e}}