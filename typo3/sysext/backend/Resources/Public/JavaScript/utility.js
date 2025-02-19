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
class t{static trimExplode(t,e){return e.split(t).map((t=>t.trim())).filter((t=>""!==t))}static trimItems(t){return t.map((t=>t instanceof String?t.trim():t))}static intExplode(t,e,r=!1){return e.split(t).map((t=>parseInt(t,10))).filter((t=>!isNaN(t)||r&&0===t))}static isNumber(t){return!isNaN(parseFloat(t.toString()))&&isFinite(t)}static convertFormToObject(t){const e={};return t.querySelectorAll("input, select, textarea").forEach((t=>{const r=t.name,i=t.value;if(r)if("input"===t.tagName.toLowerCase()&&"checkbox"==t.type){const a=t;void 0===e[r]&&(e[r]=[]),a.checked&&e[r].push(i)}else e[r]=i})),e}static mergeDeep(...e){const r=t=>t&&"object"==typeof t;return e.reduce(((e,i)=>(Object.keys(i).forEach((a=>{const s=e[a],n=i[a];Array.isArray(s)&&Array.isArray(n)?e[a]=s.concat(...n):r(s)&&r(n)?e[a]=t.mergeDeep(s,n):e[a]=n})),e)),{})}static urlsPointToSameServerSideResource(e,r){if(!e||!r)return!1;const i=window.location.origin;try{const a=new URL(e,t.isValidUrl(e)?void 0:i),s=new URL(r,t.isValidUrl(r)?void 0:i),n=a.origin+a.pathname+a.search;return n===s.origin+s.pathname+s.search}catch{return!1}}static isValidUrl(t){try{return new URL(t),!0}catch{return!1}}}export{t as default};