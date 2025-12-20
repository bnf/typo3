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
import{SeverityEnum as f}from"@typo3/backend/enum/severity.js";import d from"@typo3/backend/modal.js";import p from"@typo3/core/event/regular-event.js";import g from"@typo3/backend/notification.js";import u from"@typo3/backend/viewport.js";import i from"~labels/filelist.transfer_handler";import{FileListDragDropEvent as y}from"@typo3/filelist/file-list-dragdrop.js";import{updateFolder as v,updateFile as b,createResource as F,notifyError as h}from"@typo3/backend/resource/resource-api.js";import T from"~labels/core.file_messages";import w from"~labels/backend.resource";var a;(function(m){m.move="move",m.copy="copy"})(a||(a={}));class x{constructor(){new p(y.transfer,l=>{const s=l.detail,r=s.target,n=s.resources;let e,t;if(s.resources.length===1){const c=s.resources[0];e=i.get("message.transfer_resource.title"),t=i.get("message.transfer_resource.text",[c.name,r.name])}else e=i.get("message.transfer_resources.title"),t=i.get("message.transfer_resources.text",[n.length,r.name]);const o=d.confirm(e,t,f.notice,[{text:i.get("message.button.cancel"),active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{o.hideModal()}},{text:i.get("message.button.copy"),btnClass:"btn-primary",name:"copy",trigger:()=>{this.transfer(a.copy,n,r),o.hideModal()}},{text:i.get("message.button.move"),btnClass:"btn-primary",name:"move",trigger:()=>{this.transfer(a.move,n,r),o.hideModal()}}])}).bindTo(top.document)}transfer(l,s,r){const n=s.map(async e=>{const t=e.type==="folder";let o;l===a.move?o=t?await v(e.identifier,{parent:r.identifier,conflictMode:"rename"}):await b(e.uid,{folder:r.identifier}):o=await F(r.identifier,{copyFrom:t?{folder:e.identifier}:{file:e.uid}});const c=l===a.move?t?"FileUtility.DirectoryMovedTo":"FileUtility.FileMovedTo":t?"FileUtility.DirectoryCopiedTo":"FileUtility.FileCopiedTo";g.success(w.get("ajax.success"),T.get(c,[e.identifier,o.identifier]))});Promise.allSettled(n).then(async e=>{for(const t of e)t.status==="rejected"&&await h(t.reason);u.ContentContainer.refresh(),top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh"))})}}var C=new x;export{C as default};
