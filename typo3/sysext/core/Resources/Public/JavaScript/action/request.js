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
import s from"@typo3/core/ajax/ajax-request.js";import{topDocument as o}from"@typo3/core/utility/top-window.js";const n=e=>{const{apiPrefix:r}=o.body.dataset;if(r===void 0)throw new Error("Missing data-api-prefix attribute on top <body>");return e.startsWith(r.replace(/\/api$/,""))?e:e.startsWith("/")?r+e:e},c=(e,r)=>Object.entries(r).reduce((t,[a,i])=>t.replaceAll("{"+a+"}",i),e),d=(e,r={})=>new s(c(n(e),r)).addMiddleware(async(t,a)=>(t.headers.append("Authorization","Bearer "+o.body.dataset.apiToken),a(t)));export{d as action};
