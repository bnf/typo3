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
class e{static trimExplode(e,t){return t.split(e).map((e=>e.trim())).filter((e=>""!==e))}static trimItems(e){return e.map((e=>e instanceof String?e.trim():e))}static intExplode(e,t,excludeZeroValues=!1){return t.split(e).map((e=>parseInt(e,10))).filter((e=>!isNaN(e)||excludeZeroValues&&0===e))}static isNumber(e){return!isNaN(parseFloat(e.toString()))&&isFinite(e)}static convertFormToObject(e){const t={}
return e.querySelectorAll("input, select, textarea").forEach((e=>{const r=e.name,i=e.value
if(r)if("input"===e.tagName.toLowerCase()&&"checkbox"==e.type){const a=e
void 0===t[r]&&(t[r]=[]),a.checked&&t[r].push(i)}else t[r]=i})),t}static mergeDeep(...objects){const t=e=>e&&"object"==typeof e
return objects.reduce(((r,i)=>(Object.keys(i).forEach((a=>{const s=r[a],c=i[a]
Array.isArray(s)&&Array.isArray(c)?r[a]=s.concat(...c):t(s)&&t(c)?r[a]=e.mergeDeep(s,c):r[a]=c})),r)),{})}static urlsPointToSameServerSideResource(t,r){if(!t||!r)return!1
const i=window.location.origin
try{const a=new URL(t,e.isValidUrl(t)?void 0:i),s=new URL(r,e.isValidUrl(r)?void 0:i)
return a.origin+a.pathname+a.search===s.origin+s.pathname+s.search}catch{return!1}}static isValidUrl(e){try{return new URL(e),!0}catch{return!1}}}export default e
