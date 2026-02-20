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
import{IntlMessageFormat as d}from"intl-messageformat";import{DateTime as f}from"luxon";class c{constructor(t){this.labels=t,this.cache={}}get(t,r){const e=this.render(t,r);return Array.isArray(e)?e.join(""):e}render(t,r){if(!(t in this.labels))throw new Error("Label is not defined: "+String(t));const e=this.labels[t];if(r===void 0)return e;if(Array.isArray(r))return this.sprintf(e,r);const o=this.getFormatter(e).formatToParts(r);return o.length===1?o[0].value:o.map(n=>n.value)}sprintf(t,r){let e=0;return t.replace(/%[sdf]/g,o=>{const n=r[e++];switch(o){case"%s":return String(n);case"%d":return String(typeof n=="number"?n:parseInt(String(n),10));case"%f":return String(typeof n=="number"?n:parseFloat(n).toFixed(2));default:return o}})}getFormatter(t){return this.cache[t]??=this.createFormatter(t)}createFormatter(t){const r=this.getConfiguredDateFormats(),e=r?.timezone??void 0,o={short:{timeZone:e,dateStyle:"short"},medium:{timeZone:e,dateStyle:"medium"},long:{timeZone:e,dateStyle:"long"},full:{timeZone:e,dateStyle:"full"}},n={short:{timeZone:e,timeStyle:"short"},medium:{timeZone:e,timeStyle:"medium"},long:{timeZone:e,timeStyle:"long"},full:{timeZone:e,timeStyle:"full"}};return new d(t,this.getLocale(),{date:o,time:n},{formatters:{getNumberFormat:(i,a)=>new Intl.NumberFormat(i,a),getDateTimeFormat:(i,a)=>{const{dateStyle:m,timeStyle:s,timeZone:l}=a;return r&&(m==="medium"||s==="medium")?{format:u=>f.fromJSDate(new Date(u),{zone:l}).setLocale(i).toFormat(m==="medium"&&s==="medium"?r.formats.datetime:m==="medium"?r.formats.date:r.formats.time)}:new Intl.DateTimeFormat(i,{dateStyle:m,timeStyle:s,timeZone:l})},getPluralRules:(i,a)=>new Intl.PluralRules(i,a)}})}getConfiguredDateFormats(){try{return(typeof opener?.top?.TYPO3<"u"?opener.top:top).TYPO3.settings.DateConfiguration}catch{return null}}getLocale(){const t=document.documentElement.lang||"en";return t==="ch"?"zh":t}}export{c as LabelProvider};
