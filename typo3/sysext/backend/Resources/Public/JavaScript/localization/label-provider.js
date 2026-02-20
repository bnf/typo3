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
import{IntlMessageFormat as s}from"intl-messageformat";class o{constructor(r){this.labels=r}get(r,t){if(!(r in this.labels))throw new Error("Label is not defined: "+String(r));const n=this.labels[r];return t===void 0?n:Array.isArray(t)?this.sprintf(n,t):new s(n,document.documentElement.lang).format(t)}sprintf(r,t){let n=0;return r.replace(/%[sdf]/g,i=>{const e=t[n++];switch(i){case"%s":return String(e);case"%d":return String(typeof e=="number"?e:parseInt(String(e),10));case"%f":return String(typeof e=="number"?e:parseFloat(e).toFixed(2));default:return i}})}}export{o as LabelProvider};
