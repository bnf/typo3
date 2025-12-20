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
import g from"@typo3/core/event/regular-event.js";import{html as y}from"lit";import{FileListActionEvent as F}from"@typo3/filelist/file-list-actions.js";import m from"@typo3/backend/modal.js";import{updateFolder as h,updateFile as E,notifyError as v}from"@typo3/backend/resource/resource-api.js";import w from"@typo3/backend/notification.js";import l from"@typo3/backend/viewport.js";import r from"~labels/core.core";import C from"~labels/core.file_messages";import L from"~labels/backend.resource";class R{constructor(){new g(F.rename,o=>{const e=o.detail.resources[0],u=m.advanced({title:r.get("file_rename.title"),type:m.types.default,size:m.sizes.small,content:this.composeEditForm(e),buttons:[{text:r.get("file_rename.button.cancel"),btnClass:"btn-default",name:"cancel",trigger:()=>{u.hideModal()}},{text:r.get("file_rename.button.rename"),btnClass:"btn-primary",name:"rename",form:"file-list-rename-form"}],callback:function(n){const c=n.querySelector("form");c.addEventListener("submit",t=>{t.preventDefault();const p=new FormData(t.target),a=Object.fromEntries(p).name.toString();if(e.name!==a){const i=e.type==="folder";(i?h(e.identifier,{name:a}):E(e.uid,{name:a})).then(f=>{w.success(L.get("ajax.success"),C.get(i?"FileUtility.DirectoryRenamedFromTo":"FileUtility.FileRenamedFromTo",[e.name,f.name]));const d=l.ContentContainer.getUrl(),b=new URL(d,window.location.origin).searchParams;i&&b.get("id")===e.identifier?l.ContentContainer.setUrl(d+"&id="+f.identifier):l.ContentContainer.refresh(),top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh")),n.hideModal()}).catch(v)}}),n.addEventListener("typo3-modal-shown",()=>{const t=c.querySelector("input");t!==null&&(t.focus(),t.setSelectionRange(0,e.name.lastIndexOf(".")))})}})}).bindTo(document)}composeEditForm(o){const s=o?.type==="folder"?r.get("folder_rename.label"):r.get("file_rename.label");return y`<form id=file-list-rename-form><label class=form-label for=rename_target>${s}</label> <input id=rename_target name=name class=form-control value=${o.name} required autofocus></form>`}}var _=new R;export{_ as default};
