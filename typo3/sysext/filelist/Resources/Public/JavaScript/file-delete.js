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
import{SeverityEnum as p}from"@typo3/backend/enum/severity.js";import u from"@typo3/core/event/regular-event.js";import D from"@typo3/core/document-service.js";import b from"@typo3/backend/modal.js";import h from"@typo3/backend/notification.js";import{deleteFolder as y,deleteFile as g,notifyError as _}from"@typo3/backend/resource/resource-api.js";import i from"~labels/backend.alt_doc";import{topWindow as r}from"@typo3/core/utility/top-window.js";import c from"~labels/core.core";class w{constructor(){D.ready().then(()=>{new u("click",(f,e)=>{f.preventDefault();const m=e.dataset.redirectUrl||r.list_frame.document.location.pathname+r.list_frame.document.location.search,l=e.dataset.filelistDeleteIdentifier,s=e.dataset.filelistDeleteType,n=()=>{const t=s==="delete_folder",o=l.split("/").filter(a=>a!=="").pop()??l;(t?y(l,!0):g(parseInt(e.dataset.filelistDeleteUid,10))).then(()=>{h.success(c.get(t?"message.header.folderDeleted":"message.header.fileDeleted"),c.get(t?"message.description.folderDeleted":"message.description.fileDeleted",[o])),r.list_frame.location.href=m}).catch(_)};if(e.dataset.filelistDeleteCheck){const t=b.confirm(e.dataset.title,e.dataset.content,p.warning,[{text:i.get("buttons.confirm.delete_file.no"),active:!0,btnClass:"btn-default",name:"no"},{text:s==="delete_folder"?i.get("buttons.confirm.delete_folder.yes"):i.get("buttons.confirm.delete_file.yes"),btnClass:"btn-warning",name:"yes"}]);t.addEventListener("button.clicked",o=>{const d=o.target.name;d==="no"?t.hideModal():d==="yes"&&(t.hideModal(),n())})}else n()}).delegateTo(document,'[data-filelist-delete="true"]')})}}var k=new w;export{k as default};
