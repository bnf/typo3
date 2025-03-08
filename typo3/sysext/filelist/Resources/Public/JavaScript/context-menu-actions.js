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
import{SeverityEnum as t}from"@typo3/backend/enum/severity.js"
import n from"@typo3/core/ajax/ajax-request.js"
import o from"@typo3/backend/notification.js"
import a from"@typo3/backend/modal.js"
import r from"@typo3/backend/hashing/md5.js"
import{fileListOpenElementBrowser as i}from"@typo3/filelist/file-list.js"
import{FileListActionEvent as l,FileListActionUtility as s}from"@typo3/filelist/file-list-actions.js"
class c{static getReturnUrl(){return encodeURIComponent(top.list_frame.document.location.pathname+top.list_frame.document.location.search)}static triggerFileDownload(t,n,a=!1){const r=document.createElement("a")
r.href=t,r.download=n,document.body.appendChild(r),r.click(),a&&URL.revokeObjectURL(t),document.body.removeChild(r),o.success(e("file_download.success"),"",2)}static renameFile(e,t,n){(async()=>{await import("@typo3/filelist/file-list-rename-handler.js")
const e=s.createResourceFromContextDataset(n),t={event:null,trigger:null,action:l.rename,resources:[e],url:null,originalAction:null}
document.dispatchEvent(new CustomEvent(l.rename,{detail:t}))})()}static editFile(e,t,n){const o=n.actionUrl
top.TYPO3.Backend.ContentContainer.setUrl(o+"&target="+encodeURIComponent(t)+"&returnUrl="+c.getReturnUrl())}static editMetadata(e,t,n){const o=s.createResourceFromContextDataset(n)
o.metaUid&&top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl+"&edit[sys_file_metadata]["+o.metaUid+"]=edit&returnUrl="+c.getReturnUrl())}static openInfoPopUp(e,t){"sys_file_storage"===e?top.TYPO3.InfoWindow.showItem(e,t):top.TYPO3.InfoWindow.showItem("_FILE",t)}static uploadFile(e,t,n){const o=n.actionUrl
top.TYPO3.Backend.ContentContainer.setUrl(o+"&target="+encodeURIComponent(t)+"&returnUrl="+c.getReturnUrl())}static createFolder(e,t,n){top.TYPO3.Backend.ContentContainer.get().document.dispatchEvent(new CustomEvent(i,{detail:{actionUrl:n.actionUrl,identifier:n.identifier,mode:n.mode}}))}static createFile(e,t,n){const o=n.actionUrl
top.TYPO3.Backend.ContentContainer.setUrl(o+"&target="+encodeURIComponent(t)+"&returnUrl="+c.getReturnUrl())}static downloadFile(e,t,n){c.triggerFileDownload(n.url,n.name)}static downloadFolder(t,a,r){o.info(e("file_download.prepare"),"",2)
const i=r.actionUrl
new n(i).post({items:[a]}).then((async t=>{let n=t.response.headers.get("Content-Disposition")
if(!n){const n=await t.resolve()
return void(!1===n.success&&n.status?o.warning(e("file_download."+n.status),e("file_download."+n.status+".message"),10):o.error(e("file_download.error")))}n=n.substring(n.indexOf(" filename=")+10)
const a=await t.raw().arrayBuffer(),r=new Blob([a],{type:t.raw().headers.get("Content-Type")})
c.triggerFileDownload(URL.createObjectURL(r),n,!0)})).catch((()=>{o.error(e("file_download.error"))}))}static createFilemount(e,t){2===t.split(":").length&&top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl+"&edit[sys_filemounts][0]=new&defVals[sys_filemounts][identifier]="+encodeURIComponent(t)+"&returnUrl="+c.getReturnUrl())}static deleteFile(e,n,o){const r=()=>{top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl+"&data[delete][0][data]="+encodeURIComponent(n)+"&data[delete][0][redirect]="+c.getReturnUrl())}
if(!o.title)return void r()
const i=a.confirm(o.title,o.message,t.warning,[{text:o.buttonCloseText||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:o.buttonOkText||TYPO3.lang["button.delete"]||"Delete",btnClass:"btn-warning",name:"delete"}])
i.addEventListener("button.clicked",(e=>{"delete"===e.target.name&&r(),i.hideModal()}))}static copyFile(e,t){const o=r.hash(t),a=TYPO3.settings.ajaxUrls.contextmenu_clipboard,i={CB:{el:{["_FILE%7C"+o]:t},setCopyMode:"1"}}
new n(a).withQueryArguments(i).get().finally((()=>{top.TYPO3.Backend.ContentContainer.refresh()}))}static copyReleaseFile(e,t){const o=r.hash(t),a=TYPO3.settings.ajaxUrls.contextmenu_clipboard,i={CB:{el:{["_FILE%7C"+o]:"0"},setCopyMode:"1"}}
new n(a).withQueryArguments(i).get().finally((()=>{top.TYPO3.Backend.ContentContainer.refresh()}))}static cutFile(e,t){const o=r.hash(t),a=TYPO3.settings.ajaxUrls.contextmenu_clipboard,i={CB:{el:{["_FILE%7C"+o]:t}}}
new n(a).withQueryArguments(i).get().finally((()=>{top.TYPO3.Backend.ContentContainer.refresh()}))}static cutReleaseFile(e,t){const o=r.hash(t),a=TYPO3.settings.ajaxUrls.contextmenu_clipboard,i={CB:{el:{["_FILE%7C"+o]:"0"}}}
new n(a).withQueryArguments(i).get().finally((()=>{top.TYPO3.Backend.ContentContainer.refresh()}))}static pasteFileInto(e,n,o){const r=()=>{top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl+"&CB[paste]=FILE|"+encodeURIComponent(n)+"&CB[pad]=normal&redirect="+c.getReturnUrl())}
if(!o.title)return void r()
const i=a.confirm(o.title,o.message,t.warning,[{text:o.buttonCloseText||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:o.buttonOkText||TYPO3.lang["button.ok"]||"OK",btnClass:"btn-warning",name:"ok"}])
i.addEventListener("button.clicked",(e=>{"ok"===e.target.name&&r(),i.hideModal()}))}static updateOnlineMedia(t,a,r){if(!r.actionUrl||!r.filecontextUid||"file"!==r.filecontextType)return
const i={resource:{type:r.filecontextType,uid:r.filecontextUid}}
new n(r.actionUrl).post(i).then((()=>{o.success(e("online_media.update.success"))})).catch((()=>{o.error(e("online_media.update.error"))})).finally((()=>{window.location.reload()}))}}export default c
