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
import s from"@typo3/core/ajax/ajax-request.js";const c=e=>{const{apiPrefix:t}=top.document.body.dataset;if(t===void 0)throw new Error("Missing data-api-prefix attribute on top <body>");return e.startsWith(t.replace(/\/api$/,""))?e:e.startsWith("/")?t+e:e},d=(e,t)=>Object.entries(t).reduce((r,[o,n])=>r.replaceAll("{"+o+"}",n),e),a=(e,t={})=>d(c(e),t),i=()=>"Bearer "+top.document.body.dataset.apiToken,p=(e,t={})=>new s(a(e,t)).addMiddleware(async(r,o)=>(r.headers.append("Authorization",i()),o(r)));export{p as action,i as actionAuthorization,a as actionUrl};
