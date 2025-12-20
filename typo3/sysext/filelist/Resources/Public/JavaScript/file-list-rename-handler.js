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
import g from"@typo3/core/event/regular-event.js";import{html as h}from"lit";import{FileListActionEvent as y}from"@typo3/filelist/file-list-actions.js";import l from"@typo3/backend/modal.js";import C from"@typo3/core/ajax/ajax-request.js";import d from"@typo3/backend/notification.js";import i from"@typo3/backend/viewport.js";import n from"~labels/core.core";const w={headers:{"Content-Type":"application/json"}};class v{constructor(){new g(y.rename,o=>{const a=o.detail.resources[0],c=l.advanced({title:n.get("file_rename.title"),type:l.types.default,size:l.sizes.small,content:this.composeEditForm(a),buttons:[{text:n.get("file_rename.button.cancel"),btnClass:"btn-default",name:"cancel",trigger:()=>{c.hideModal()}},{text:n.get("file_rename.button.rename"),btnClass:"btn-primary",name:"rename",trigger:()=>{c.querySelector("form")?.requestSubmit()}}],callback:function(s){const f=s.querySelector("form");f.addEventListener("submit",t=>{t.preventDefault();const p=new FormData(t.target),u=Object.fromEntries(p).name.toString();a.name!==u&&new C(TYPO3.settings.ajaxUrls.resource_rename).post({resourceIdentifier:a.identifier,resourceName:u},w).then(async b=>{const r=await b.resolve();if(r.status.length>0&&r.status.forEach(e=>{r.success?d.success(e.title,e.message):d.error(e.title,e.message)}),r.resource?.type==="folder"){const e=i.ContentContainer.getUrl();new URL(e,window.location.origin).searchParams.get("id")===r.origin.identifier?i.ContentContainer.setUrl(e+"&id="+r.resource.identifier):i.ContentContainer.refresh()}else i.ContentContainer.refresh();top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh")),s.hideModal()})}),s.addEventListener("typo3-modal-shown",()=>{const t=f.querySelector("input");t!==null&&(t.focus(),t.setSelectionRange(0,a.name.lastIndexOf(".")))})}})}).bindTo(document)}composeEditForm(o){const m=o?.type==="folder"?n.get("folder_rename.label"):n.get("file_rename.label");return h`<form><label class=form-label for=rename_target>${m}</label> <input id=rename_target name=name class=form-control value=${o.name} required></form>`}}var E=new v;export{E as default};
