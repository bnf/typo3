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
import{render as i,html as a,nothing as d}from"lit";import{until as u}from"lit/directives/until.js";const g=e=>{const n=document.createElement("div");return i(e,n),n.childNodes},T=e=>{const n=document.createElement("div");return i(e,n),n.innerHTML},P=(e,...n)=>{console.warn("lll() is internal API. It uses TYPO3.lang as a backend which is deprecated. It will be removed in TYPO3 v15. Use label imports instead.");const t=window,r=top;let l=null;if(t.TYPO3&&t.TYPO3.lang&&typeof t.TYPO3.lang[e]=="string"?l=t.TYPO3.lang:r.TYPO3&&r.TYPO3.lang&&typeof r.TYPO3.lang[e]=="string"&&(l=r.TYPO3.lang),l===null)return"";let c=0;return l[e].replace(/%[sdf]/g,s=>{const o=n[c++];switch(s){case"%s":return String(o);case"%d":return String(parseInt(o,10));case"%f":return String(parseFloat(o).toFixed(2));default:return s}})},m=e=>e.reduce((n,t)=>(n[t]=!0,n),{}),w=(e,n)=>{const t=(n||window).litNonce;return t?a`<style nonce=${t}>${e}</style>`:a`<style>${e}</style>`},f=(e,n,t=()=>d)=>u(new Promise(r=>window.setTimeout(()=>r(n()),e)),t());export{m as classesArrayToClassInfo,f as delay,P as lll,T as renderHTML,g as renderNodes,w as styleTag};
