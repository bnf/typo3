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
import{html as e,render as t,nothing as r}from"lit"
import{until as n}from"lit/directives/until.js"
export const renderNodes=e=>{const r=document.createElement("div")
return t(e,r),r.childNodes}
export const renderHTML=e=>{const r=document.createElement("div")
return t(e,r),r.innerHTML}
export const lll=(e,...args)=>{if(!window.TYPO3||!window.TYPO3.lang||"string"!=typeof window.TYPO3.lang[e])return""
let t=0
return window.TYPO3.lang[e].replace(/%[sdf]/g,(e=>{const r=args[t++]
switch(e){case"%s":return String(r)
case"%d":return String(parseInt(r,10))
case"%f":return String(parseFloat(r).toFixed(2))
default:return e}}))}
export const classesArrayToClassInfo=e=>e.reduce(((e,t)=>(e[t]=!0,e)),{})
export const styleTag=(t,r)=>{const n=(r||window).litNonce
return n?e`<style nonce="${n}">${t}</style>`:e`<style>${t}</style>`}
export const delay=(e,t,fallback=()=>r)=>n(new Promise((r=>window.setTimeout((()=>r(t())),e))),fallback())
