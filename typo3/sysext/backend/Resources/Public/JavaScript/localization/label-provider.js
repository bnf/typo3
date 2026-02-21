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
import{IntlMessageFormat as i}from"intl-messageformat";class a{constructor(r){this.labels=r}get(r,n){const e=this.render(r,n);return Array.isArray(e)?e.join(""):e}render(r,n){if(!(r in this.labels))throw new Error("Label is not defined: "+String(r));const e=this.labels[r];if(n===void 0)return e;if(Array.isArray(n))return this.sprintf(e,n);const s=new i(e,document.documentElement.lang).formatToParts(n);return s.length===1?s[0].value:s.map(t=>t.value)}sprintf(r,n){let e=0;return r.replace(/%[sdf]/g,s=>{const t=n[e++];switch(s){case"%s":return String(t);case"%d":return String(typeof t=="number"?t:parseInt(String(t),10));case"%f":return String(typeof t=="number"?t:parseFloat(t).toFixed(2));default:return s}})}}export{a as LabelProvider};
