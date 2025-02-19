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
import e from"@typo3/core/document-service.js";import{MessageUtility as t}from"@typo3/backend/utility/message-utility.js";import o from"nprogress";import r from"@typo3/core/ajax/ajax-request.js";import a,{Types as n}from"@typo3/backend/modal.js";import i from"@typo3/backend/notification.js";import d from"@typo3/backend/severity.js";import l from"@typo3/core/event/regular-event.js";import{topLevelModuleImport as s}from"@typo3/backend/utility/top-level-module-import.js";var m=new class{constructor(){e.ready().then((async()=>{await s("@typo3/backend/form-engine/element/online-media-form-element.js"),this.registerEvents()}))}registerEvents(){new l("click",((e,t)=>{this.triggerModal(t)})).delegateTo(document,".t3js-online-media-add-btn")}addOnlineMedia(e,a,n){const d=e.dataset.targetFolder,l=e.dataset.onlineMediaAllowed,s=e.dataset.fileIrreObject;o.start(),new r(TYPO3.settings.ajaxUrls.online_media_create).post({url:n,targetFolder:d,allowed:l}).then((async e=>{const r=await e.resolve();if(r.file){const e={actionName:"typo3:foreignRelation:insert",objectGroup:s,table:"sys_file",uid:r.file};t.send(e),a.hideModal()}else i.error(top.TYPO3.lang["online_media.error.new_media.failed"],r.error);o.done()}))}triggerModal(e){const t=e.dataset.btnSubmit||"Add",o=e.dataset.placeholder||"Paste media url here...",r=e.dataset.onlineMediaAllowedHelpText||"Allow to embed from sources:",i=document.createElement("typo3-backend-formengine-online-media-form");i.placeholder=o,i.setAttribute("help-text",r),i.setAttribute("extensions",e.dataset.onlineMediaAllowed),a.advanced({type:n.default,title:e.title,content:i,severity:d.notice,callback:t=>{t.querySelector("typo3-backend-formengine-online-media-form").addEventListener("typo3:formengine:online-media-added",(o=>{this.addOnlineMedia(e,t,o.detail["online-media-url"])}))},buttons:[{text:t,btnClass:"btn btn-primary",name:"ok",trigger:()=>{i.querySelector("form").requestSubmit()}}]})}};export{m as default};