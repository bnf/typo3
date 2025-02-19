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
import{SeverityEnum as e}from"@typo3/backend/enum/severity.js";import t from"@typo3/backend/modal.js";import s from"@typo3/core/ajax/ajax-request.js";import r from"@typo3/core/event/regular-event.js";import a from"@typo3/backend/notification.js";import o from"@typo3/backend/viewport.js";import{FileListDragDropEvent as n}from"@typo3/filelist/file-list-dragdrop.js";var i;!function(e){e.move="move",e.copy="copy"}(i||(i={}));var c=new class{constructor(){new r(n.transfer,(s=>{const r=s.detail,a=r.target,o=r.resources;let n,c;if(1===r.resources.length){const e=r.resources[0];n=TYPO3.lang["message.transfer_resource.title"],c=TYPO3.lang["message.transfer_resource.text"].replace("%s",e.name).replace("%s",a.name)}else n=TYPO3.lang["message.transfer_resources.title"],c=TYPO3.lang["message.transfer_resources.text"].replace("%d",o.length.toString(10)).replace("%s",a.name);const l=t.confirm(n,c,e.notice,[{text:TYPO3.lang["message.button.cancel"],active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{l.hideModal()}},{text:TYPO3.lang["message.button.copy"],btnClass:"btn-primary",name:"copy",trigger:()=>{this.transfer(i.copy,o,a),l.hideModal()}},{text:TYPO3.lang["message.button.move"],btnClass:"btn-primary",name:"move",trigger:()=>{this.transfer(i.move,o,a),l.hideModal()}}])})).bindTo(top.document)}transfer(e,t,r){const a=[];t.forEach((e=>{const t={data:e.identifier,target:r.identifier};a.push(t)}));const n={data:{[e]:a}};new s(top.TYPO3.settings.ajaxUrls.file_process).post(n).then((async e=>{const t=await e.resolve();this.handleMessages(t.messages??[]),o.ContentContainer.refresh(),top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh"))})).catch((async e=>{const t=await e.resolve();this.handleMessages(t.messages??[]),o.ContentContainer.refresh(),top.document.dispatchEvent(new CustomEvent("typo3:filestoragetree:refresh"))}))}handleMessages(e){e.forEach((e=>{a.showMessage(e.title||"",e.message||"",e.severity)}))}};export{c as default};