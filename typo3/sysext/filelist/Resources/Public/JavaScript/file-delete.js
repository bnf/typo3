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
import{SeverityEnum as m}from"@typo3/backend/enum/severity.js";import p from"@typo3/core/event/regular-event.js";import u from"@typo3/core/document-service.js";import D from"@typo3/backend/modal.js";import b from"@typo3/backend/notification.js";import{deleteFolder as h,deleteFile as y,notifyError as g}from"@typo3/backend/resource/resource-api.js";import i from"~labels/backend.alt_doc";import d from"~labels/core.core";class _{constructor(){u.ready().then(()=>{new p("click",(c,e)=>{c.preventDefault();const f=e.dataset.redirectUrl||top.list_frame.document.location.pathname+top.list_frame.document.location.search,l=e.dataset.filelistDeleteIdentifier,r=e.dataset.filelistDeleteType,s=()=>{const t=r==="delete_folder",o=l.split("/").filter(n=>n!=="").pop()??l;(t?h(l,!0):y(parseInt(e.dataset.filelistDeleteUid,10))).then(()=>{b.success(d.get(t?"message.header.folderDeleted":"message.header.fileDeleted"),d.get(t?"message.description.folderDeleted":"message.description.fileDeleted",[o])),top.list_frame.location.href=f}).catch(g)};if(e.dataset.filelistDeleteCheck){const t=D.confirm(e.dataset.title,e.dataset.content,m.warning,[{text:i.get("buttons.confirm.delete_file.no"),active:!0,btnClass:"btn-default",name:"no"},{text:r==="delete_folder"?i.get("buttons.confirm.delete_folder.yes"):i.get("buttons.confirm.delete_file.yes"),btnClass:"btn-warning",name:"yes"}]);t.addEventListener("button.clicked",o=>{const a=o.target.name;a==="no"?t.hideModal():a==="yes"&&(t.hideModal(),s())})}else s()}).delegateTo(document,'[data-filelist-delete="true"]')})}}var k=new _;export{k as default};
