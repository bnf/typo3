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
import{lll as e}from"@typo3/core/lit-helper.js"
import t from"@typo3/core/document-service.js"
import o from"@typo3/backend/notification.js"
import n from"@typo3/backend/info-window.js"
import{FileListActionEvent as i,FileListActionSelector as r,FileListActionUtility as a}from"@typo3/filelist/file-list-actions.js"
import s from"nprogress"
import l from"@typo3/backend/icons.js"
import d from"@typo3/core/ajax/ajax-request.js"
import c from"@typo3/core/event/regular-event.js"
import{ModuleStateStorage as m}from"@typo3/backend/storage/module-state-storage.js"
import{default as u}from"@typo3/backend/modal.js"
import{SeverityEnum as p}from"@typo3/backend/enum/severity.js"
import f from"@typo3/backend/severity.js"
import{MultiRecordSelectionSelectors as w}from"@typo3/backend/multi-record-selection.js"
import g from"@typo3/backend/context-menu.js"
var h
!function(e){e.fileListFormSelector='form[name="fileListForm"]',e.commandSelector='input[name="cmd"]',e.searchFieldSelector='input[name="searchTerm"]',e.pointerFieldSelector='input[name="pointer"]'}(h||(h={}))
export const fileListOpenElementBrowser="typo3:filelist:openElementBrowser"
export default class b{constructor(){this.downloadFilesAndFolders=t=>{t.preventDefault()
const n=t.target,i=t.detail,s=i.configuration,l=[]
i.checkboxes.forEach((e=>{if(e.checked){const t=e.closest(r.elementSelector),o=a.getResourceForElement(t)
l.unshift(o)}})),l.length?this.triggerDownload(l,s.downloadUrl,n):o.warning(e("file_download.invalidSelection"))},new c(fileListOpenElementBrowser,(e=>{const t=new URL(e.detail.actionUrl,window.location.origin)
t.searchParams.set("expandFolder",e.detail.identifier),t.searchParams.set("mode",e.detail.mode)
u.advanced({type:u.types.iframe,content:t.toString(),size:u.sizes.large}).addEventListener("typo3-modal-hidden",(()=>{top.list_frame.document.location.reload()}))})).bindTo(document),new c(i.primary,(e=>{const t=e.detail,o=t.resources[0],n=t.trigger.closest("[data-default-language-access]")
if("file"===o.type&&null!==n&&(window.location.href=top.TYPO3.settings.FormEngine.moduleUrl+"&edit[sys_file_metadata]["+o.metaUid+"]=edit&returnUrl="+b.getReturnUrl("")),"folder"===o.type){const e=b.parseQueryParameters(document.location)
e.id=o.identifier
let t=""
Object.keys(e).forEach((o=>{""!==e[o]&&(t=t+"&"+o+"="+e[o])})),window.location.href=window.location.pathname+"?"+t.substring(1)}})).bindTo(document),new c(i.primaryContextmenu,(e=>{const t=e.detail,o=t.resources[0]
g.show("sys_file",o.identifier,"","","",t.trigger,t.event)})).bindTo(document),new c(i.show,(e=>{const t=e.detail.resources[0]
b.openInfoPopup("_"+t.type.toUpperCase(),t.identifier)})).bindTo(document),new c(i.download,(e=>{const t=e.detail,o=t.resources[0]
this.triggerDownload([o],t.url,t.trigger)})).bindTo(document),new c(i.updateOnlineMedia,(e=>{const t=e.detail,o=t.resources[0]
this.updateOnlineMedia(o,t.url)})).bindTo(document),t.ready().then((()=>{b.processTriggers(),new c("click",((e,t)=>{e.preventDefault(),document.dispatchEvent(new CustomEvent(fileListOpenElementBrowser,{detail:{actionUrl:t.href,identifier:t.dataset.identifier,mode:t.dataset.mode}}))})).delegateTo(document,".t3js-element-browser")})),new c("multiRecordSelection:action:edit",this.editFileMetadata).bindTo(document),new c("multiRecordSelection:action:delete",this.deleteMultiple).bindTo(document),new c("multiRecordSelection:action:download",this.downloadFilesAndFolders).bindTo(document),new c("multiRecordSelection:action:copyMarked",(e=>{b.submitClipboardFormWithCommand("copyMarked",e.target)})).bindTo(document),new c("multiRecordSelection:action:removeMarked",(e=>{b.submitClipboardFormWithCommand("removeMarked",e.target)})).bindTo(document)
const n=""!==document.querySelector([h.fileListFormSelector,h.searchFieldSelector].join(" "))?.value
new c("search",(e=>{const t=e.target
""===t.value&&n&&t.closest(h.fileListFormSelector)?.submit()})).delegateTo(document,h.searchFieldSelector)}static submitClipboardFormWithCommand(e,t){const o=t.closest(h.fileListFormSelector)
if(!o)return
const n=o.querySelector(h.commandSelector)
if(n){if(n.value=e,"copyMarked"===e||"removeMarked"===e){const e=o.querySelector(h.pointerFieldSelector),t=b.parseQueryParameters(document.location).pointer
e&&t&&(e.value=t)}o.submit()}}static openInfoPopup(e,t){n.showItem(e,t)}static processTriggers(){const e=document.querySelector(".filelist-main")
null!==e&&m.update("media",e.dataset.filelistCurrentIdentifier)}static parseQueryParameters(e){const t={}
if(e&&Object.prototype.hasOwnProperty.call(e,"search")){const o=e.search.substr(1).split("&")
for(let e=0;e<o.length;e++){const n=o[e].split("=")
t[decodeURIComponent(n[0])]=decodeURIComponent(n[1])}}return t}static getReturnUrl(e){return""===e&&(e=top.list_frame.document.location.pathname+top.list_frame.document.location.search),encodeURIComponent(e)}deleteMultiple(e){e.preventDefault()
const t=e.detail.configuration
u.advanced({title:t.title||"Delete",content:t.content||"Are you sure you want to delete those files and folders?",severity:p.warning,buttons:[{text:TYPO3.lang["button.close"]||"Close",active:!0,btnClass:"btn-default",trigger:(e,t)=>t.hideModal()},{text:t.ok||TYPO3.lang["button.ok"]||"OK",btnClass:"btn-"+f.getCssClass(p.warning),trigger:(t,o)=>{b.submitClipboardFormWithCommand("delete",e.target),o.hideModal()}}]})}editFileMetadata(e){e.preventDefault()
const t=e.detail,n=t.configuration
if(!n||!n.idField||!n.table)return
const i=[]
if(t.checkboxes.forEach((e=>{const t=e.closest(w.elementSelector)
null!==t&&t.dataset[n.idField]&&i.push(t.dataset[n.idField])})),i.length){let e=top.TYPO3.settings.FormEngine.moduleUrl+"&edit["+n.table+"]["+i.join(",")+"]=edit&returnUrl="+b.getReturnUrl(n.returnUrl||"")
const t=n.columnsOnly||[]
t.length>0&&(e+=t.map(((e,t)=>"&columnsOnly["+n.table+"]["+t+"]="+e)).join("")),window.location.href=e}else o.warning("The selected elements can not be edited.")}triggerDownload(t,n,i){if(1===t.length){const e=t.at(0)
if("file"===e.type)return void this.invokeDownload(e.url,e.name)}o.info(e("file_download.prepare"),"",2)
const r=i?.innerHTML
i&&(i.setAttribute("disabled","disabled"),l.getIcon("spinner-circle",l.sizes.small).then((e=>{i.innerHTML=e}))),s.configure({parent:"#typo3-filelist",showSpinner:!1}).start()
const a=t.map((e=>e.identifier))
new d(n).post({items:a}).then((async t=>{let n=t.response.headers.get("Content-Disposition")
if(!n){const n=await t.resolve()
return void(!1===n.success&&n.status?o.warning(e("file_download."+n.status),e("file_download."+n.status+".message"),10):o.error(e("file_download.error")))}n=n.substring(n.indexOf(" filename=")+10)
const i=await t.raw().arrayBuffer(),r=new Blob([i],{type:t.raw().headers.get("Content-Type")}),a=URL.createObjectURL(r)
this.invokeDownload(a,n),o.success(e("file_download.success"),"",2)})).catch((()=>{o.error(e("file_download.error"))})).finally((()=>{s.done(),i&&(i.removeAttribute("disabled"),i.innerHTML=r)}))}updateOnlineMedia(t,n){n&&t.uid&&"file"===t.type&&(s.configure({parent:"#typo3-filelist",showSpinner:!1}).start(),new d(n).post({resource:t}).then((()=>{o.success(e("online_media.update.success"))})).catch((()=>{o.error(e("online_media.update.error"))})).finally((()=>{s.done(),window.location.reload()})))}invokeDownload(e,t){const o=document.createElement("a")
o.href=e,o.download=t,document.body.appendChild(o),o.click(),URL.revokeObjectURL(e),document.body.removeChild(o)}}