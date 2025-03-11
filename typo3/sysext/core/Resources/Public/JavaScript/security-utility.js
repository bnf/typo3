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
export default class{constructor(documentRef=document){this.documentRef=documentRef}getRandomHexValue(e){if(e<=0||e!==Math.ceil(e))throw new SyntaxError("Length must be a positive integer")
const t=new Uint8Array(Math.ceil(e/2))
return crypto.getRandomValues(t),Array.from(t).map((e=>e.toString(16).padStart(2,"0"))).join("").substr(0,e)}encodeHtml(e,doubleEncode=!0){const t=this.createAnvil()
return doubleEncode||(e=e.replace(/&[#A-Za-z0-9]+;/g,(e=>(t.innerHTML=e,t.innerText)))),t.innerText=e,t.innerHTML.replace(/"/g,"&quot;").replace(/'/g,"&apos;")}stripHtml(e){return(new DOMParser).parseFromString(e,"text/html").body.textContent||""}debug(e){e!==this.encodeHtml(e)&&console.warn("XSS?!",e)}createAnvil(){return this.documentRef.createElement("span")}}