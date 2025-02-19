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
import{marked as t}from"marked";import r from"dompurify";import{html as e}from"lit";import{until as o}from"lit/directives/until.js";import{unsafeHTML as i}from"lit/directives/unsafe-html.js";export const markdown=(n,m="default")=>e`${o(async function(e,o){let a,n;try{a=await t.parse(e,{async:!0,...o.markdown})}catch(t){return console.error("Invalid Markdown",e,t),e}try{n=r.sanitize(a,o.dompurify)}catch(t){return console.error("Invalid HTML",a,t),e}return i(n)}(n,a[m]),n)}`;r.addHook("afterSanitizeAttributes",(t=>{"target"in t&&!t.hasAttribute("target")&&t.setAttribute("target","_blank")}));const a={minimal:{markdown:{gfm:!0,pedantic:!1},dompurify:{ALLOWED_TAGS:["a","blockquote","br","code","li","p","pre","strong","ul","ol"],ALLOWED_ATTR:["href","target","title","role"]}},default:{markdown:{gfm:!0,pedantic:!1},dompurify:{USE_PROFILES:{html:!0}}}};