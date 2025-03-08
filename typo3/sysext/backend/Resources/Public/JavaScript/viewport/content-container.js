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
import{ScaffoldIdentifierEnum as e}from"@typo3/backend/enum/viewport/scaffold-identifier.js"
import{AbstractContainer as t}from"@typo3/backend/viewport/abstract-container.js"
import r from"@typo3/backend/event/client-request.js"
import o from"@typo3/backend/event/interaction-request.js"
import n from"@typo3/backend/viewport/loader.js"
import s from"@typo3/backend/event/trigger-request.js"
export default class extends t{get(){return document.querySelector(e.contentModuleIframe).contentWindow}beforeSetUrl(e){return this.consumerScope.invoke(new s("typo3.beforeSetUrl",e))}setUrl(e,t,i){const l=this.resolveRouterElement()
if(null===l)return Promise.reject()
t instanceof o||(t=new r("typo3.setUrl",null))
const c=this.consumerScope.invoke(new s("typo3.setUrl",t))
return c.then((()=>{n.start(),l.setAttribute("endpoint",e),l.setAttribute("module",i||null),l.parentElement.addEventListener("typo3-module-loaded",(()=>n.finish()),{once:!0})})),c}getUrl(){return this.resolveRouterElement().getAttribute("endpoint")}refresh(e){const t=this.resolveIFrameElement()
if(null===t)return Promise.reject()
const r=this.consumerScope.invoke(new s("typo3.refresh",e))
return r.then((()=>{t.contentWindow.location.reload()})),r}getIdFromUrl(){if(this.getUrl()){const e=new URL(this.getUrl(),window.location.origin).searchParams.get("id")??""
return parseInt(e,10)}return 0}resolveIFrameElement(){return document.querySelector(e.contentModuleIframe)}resolveRouterElement(){return document.querySelector(e.contentModuleRouter)}}