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
import{action as s,actionUrl as c,actionAuthorization as u}from"@typo3/core/action/request.js";import{AjaxResponse as p}from"@typo3/core/ajax/ajax-response.js";import l from"@typo3/backend/notification.js";import f from"~labels/backend.resource";const a={headers:{"Content-Type":"application/json"}};async function d(e){return await(await s("/files/{uid}",{uid:e.toString(10)}).get()).resolve()}async function y(e,t={}){const n={identifier:e};for(const[o,i]of Object.entries(t))i!==void 0&&(n[o]=String(i));return await(await s("/folders").withQueryArguments(n).get({cache:"no-cache"})).resolve()}async function w(e,t){return await(await s("/files/{uid}",{uid:e.toString(10)}).patch(t,a)).resolve()}async function m(e,t){return await(await s("/folders").withQueryArguments({identifier:e}).patch(t,a)).resolve()}async function h(e,t){return await(await s("/folders").withQueryArguments({identifier:e}).post(t,a)).resolve()}function g(e,t,n="cancel"){const r=new URLSearchParams({folder:e,name:t.name,conflictMode:n}),o=new XMLHttpRequest;return o.open("POST",c("/files")+"?"+r.toString()),o.setRequestHeader("Authorization",u()),o.setRequestHeader("Content-Type",t.type||"application/octet-stream"),o}async function v(e,t,n){const r=s("/files/{uid}",{uid:e.toString(10)});return await(await(n!==void 0?r.withQueryArguments({name:n}):r).put("",{body:t,headers:{"Content-Type":t.type||"application/octet-stream"}})).resolve()}async function A(e){await s("/files/{uid}",{uid:e.toString(10)}).delete()}async function S(e,t=!1){await s("/folders").withQueryArguments({identifier:e,recursive:t?"true":"false"}).delete()}async function q(e){let t="";if(e instanceof p){const n=await e.resolve().catch(()=>null);t=typeof n?.error=="string"?n.error:e.response.statusText}else e instanceof Error&&(t=e.message);l.error(f.get("ajax.error"),t)}export{h as createResource,A as deleteFile,S as deleteFolder,d as fetchFile,y as fetchFolder,q as notifyError,g as openUploadRequest,v as replaceFile,w as updateFile,m as updateFolder};
