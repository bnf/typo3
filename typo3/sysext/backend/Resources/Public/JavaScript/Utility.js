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
define((function(){"use strict";class t{static trimExplode(t,e){return e.split(t).map(t=>t.trim()).filter(t=>""!==t)}static intExplode(t,e,r=!1){return e.split(t).map(t=>parseInt(t,10)).filter(t=>!isNaN(t)||r&&0===t)}static isNumber(t){return!isNaN(parseFloat(t.toString()))&&isFinite(t)}static getParameterFromUrl(t,e){if("function"!=typeof t.split)return"";const r=t.split("?");let n="";if(r.length>=2){const t=r.join("?"),i=encodeURIComponent(e)+"=",c=t.split(/[&;]/g);for(let t=c.length;t-- >0;)if(-1!==c[t].lastIndexOf(i,0)){n=c[t].split("=")[1];break}}return n}static updateQueryStringParameter(t,e,r){const n=new RegExp("([?&])"+e+"=.*?(&|$)","i"),i=t.includes("?")?"&":"?";return t.match(n)?t.replace(n,"$1"+e+"="+r+"$2"):t+i+e+"="+r}static convertFormToObject(t){const e={};return t.querySelectorAll("input, select, textarea").forEach(t=>{const r=t.name,n=t.value;r&&(t instanceof HTMLInputElement&&"checkbox"==t.type?(void 0===e[r]&&(e[r]=[]),t.checked&&e[r].push(n)):e[r]=n)}),e}static mergeDeep(...e){const r=t=>t&&"object"==typeof t;return e.reduce((e,n)=>(Object.keys(n).forEach(i=>{const c=e[i],s=n[i];Array.isArray(c)&&Array.isArray(s)?e[i]=c.concat(...s):r(c)&&r(s)?e[i]=t.mergeDeep(c,s):e[i]=s}),e),{})}}return t}));