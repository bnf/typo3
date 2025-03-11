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
import e from"@typo3/core/event/regular-event.js"
import{MultiRecordSelectionSelectors as t}from"@typo3/backend/multi-record-selection.js"
import{FileListActionSelector as r,FileListActionUtility as s}from"@typo3/filelist/file-list-actions.js"
import{DataTransferTypes as a}from"@typo3/backend/enum/data-transfer-types.js"
export var FileListDragDropEvent
!function(e){e.transfer="typo3:filelist:resource:dragdrop:transfer"}(FileListDragDropEvent||(FileListDragDropEvent={}))
export default new class{constructor(){this.previewSize=32
const o=r.elementSelector+'[draggable="true"]'
new e("dragstart",((e,o)=>{const l=[]
let i="",n=""
const c=document.querySelectorAll(t.checkboxSelector+":checked")
if(c.length)c.forEach((e=>{if(e.checked){const t=e.closest(r.elementSelector)
t.dataset.filelistDragdropTransferItem="true"
const a=s.getResourceForElement(t)
l.push(a),n=t.dataset.filelistName,i=t.dataset.filelistIcon}}))
else{const d=o.closest(r.elementSelector)
d.dataset.filelistDragdropTransferItem="true"
const f=s.getResourceForElement(d)
l.push(f),n=d.dataset.filelistName,i=d.dataset.filelistIcon}e.dataTransfer.effectAllowed="move",e.dataTransfer.setData(a.falResources,JSON.stringify(l))
const u={tooltipIconIdentifier:l.length>1?"apps-clipboard-images":i,tooltipLabel:l.length>1?this.getPreviewLabel(l):n,thumbnails:this.getPreviewItems(l)}
e.dataTransfer.setData(a.dragTooltip,JSON.stringify(u))})).delegateTo(document,o),new e("dragover",((e,t)=>{const r=s.getResourceForElement(t)
this.isDropAllowedOnResoruce(r)&&(e.dataTransfer.dropEffect="move",e.preventDefault(),t.classList.add("success"))}),{capture:!0}).delegateTo(document,o),new e("drop",((e,t)=>{const r={action:"transfer",resources:JSON.parse(e.dataTransfer.getData(a.falResources)??"{}"),target:s.getResourceForElement(t)}
top.document.dispatchEvent(new CustomEvent(FileListDragDropEvent.transfer,{detail:r}))}),{capture:!0,passive:!0}).delegateTo(document,o),new e("dragend",(()=>{this.reset()}),{capture:!0,passive:!0}).delegateTo(document,o),new e("dragleave",((e,t)=>{t.classList.remove("success")}),{capture:!0,passive:!0}).delegateTo(document,o)}getPreviewItems(e){return e.filter((e=>null!==e.thumbnail)).map((e=>({src:e.thumbnail,width:this.previewSize,height:this.previewSize})))}getPreviewLabel(e){const t=e.filter((e=>null!==e.thumbnail)),r=e.length-t.length
return r>0?(t.length>0?"+":"")+r.toString():""}reset(){document.querySelectorAll(r.elementSelector).forEach((e=>{delete e.dataset.filelistDragdropTransferItem,e.classList.remove("success")}))}isDropAllowedOnResoruce(e){return!("filelistDragdropTransferItem"in document.querySelector(r.elementSelector+'[data-filelist-identifier="'+e.identifier+'"]').dataset)&&"folder"===e.type}}
