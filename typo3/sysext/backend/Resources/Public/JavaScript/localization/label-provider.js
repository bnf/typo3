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
import{IntlMessageFormat as i}from"intl-messageformat";class s{constructor(e){this.labels=e,this.cache={}}get(e,t){const r=this.render(e,t);return Array.isArray(r)?r.join(""):r}render(e,t){if(!(e in this.labels))throw new Error("Label is not defined: "+String(e));const r=this.labels[e];if(t===void 0)return r;if(Array.isArray(t))return this.sprintf(r,t);const o=this.getFormatter(r).formatToParts(t);return o.length===1?o[0].value:o.map(n=>n.value)}sprintf(e,t){let r=0;return e.replace(/%[sdf]/g,o=>{const n=t[r++];switch(o){case"%s":return String(n);case"%d":return String(typeof n=="number"?n:parseInt(String(n),10));case"%f":return String(typeof n=="number"?n:parseFloat(n).toFixed(2));default:return o}})}getFormatter(e){return this.cache[e]??=this.createFormatter(e)}createFormatter(e){const t=this.getConfiguredTimezone(),r={short:{timeZone:t},medium:{timeZone:t},long:{timeZone:t},full:{timeZone:t}};return new i(e,document.documentElement.lang,{date:r,time:r})}getConfiguredTimezone(){return this.getConfiguredDateFormats()?.timezone??void 0}getConfiguredDateFormats(){try{return(typeof opener?.top?.TYPO3<"u"?opener.top:top).TYPO3.settings.DateConfiguration}catch{return null}}}export{s as LabelProvider};
