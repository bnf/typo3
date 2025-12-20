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
import c from"@typo3/core/ajax/ajax-request.js";import{topDocument as a}from"@typo3/core/utility/top-window.js";const d=r=>{const{apiPrefix:e}=a.body.dataset;if(e===void 0)throw new Error("Missing data-api-prefix attribute on top <body>");return r.startsWith(e.replace(/\/api$/,""))?r:r.startsWith("/")?e+r:r},p=(r,e)=>Object.entries(e).reduce((t,[o,s])=>t.replaceAll("{"+o+"}",s),r),i=(r,e={})=>p(d(r),e),n=()=>"Bearer "+a.body.dataset.apiToken,l=(r,e={})=>new c(i(r,e)).addMiddleware(async(t,o)=>(t.headers.append("Authorization",n()),o(t)));export{l as action,n as actionAuthorization,i as actionUrl};
