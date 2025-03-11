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
import e from"@typo3/core/document-service.js"
import t from"@typo3/backend/storage/browser-session.js"
import n from"nprogress"
import{default as o}from"@typo3/backend/modal.js"
import i from"@typo3/backend/severity.js"
import s from"@typo3/core/security-utility.js"
import r from"@typo3/extensionmanager/repository.js"
import a from"@typo3/extensionmanager/update.js"
import l from"@typo3/extensionmanager/upload-form.js"
import"@typo3/backend/input/clearable.js"
import c from"@typo3/core/ajax/ajax-request.js"
import m from"@typo3/core/event/debounce-event.js"
import d from"@typo3/core/event/regular-event.js"
import u from"@typo3/backend/sortable-table.js"
const p=new s
var g
!function(e){e.extensionlist="typo3-extension-list",e.searchField="#Tx_Extensionmanager_extensionkey"}(g||(g={}))
const f=new class{constructor(){this.searchFilterSessionKey="tx-extensionmanager-local-filter",e.ready().then((()=>{this.Update=new a,this.UploadForm=new l,this.Repository=new r
const e=document.getElementById(g.extensionlist)
let s
if(null!==e&&(e instanceof HTMLTableElement&&new u(e),new d("click",((e,t)=>{e.preventDefault(),o.confirm(TYPO3.lang["extensionList.removalConfirmation.title"],TYPO3.lang["extensionList.removalConfirmation.question"],i.error,[{text:TYPO3.lang["button.cancel"],active:!0,btnClass:"btn-default",trigger:()=>{o.dismiss()}},{text:TYPO3.lang["button.remove"],btnClass:"btn-danger",trigger:()=>{this.removeExtensionFromDisk(t),o.dismiss()}}])})).delegateTo(e,".removeExtension"),new d("click",((e,t)=>{e.preventDefault(),o.confirm(TYPO3.lang["extensionList.databaseReload.title"],TYPO3.lang["extensionList.databaseReload.message"],i.warning,[{text:TYPO3.lang["button.cancel"],active:!0,btnClass:"btn-default",trigger:()=>{o.dismiss()}},{text:TYPO3.lang["button.reimport"],btnClass:"btn-warning",trigger:()=>{n.start(),new c(t.href).post({}).then((()=>{location.reload()})).finally((()=>{n.done(),o.dismiss()}))}}])})).delegateTo(e,".reloadSqlData")),new d("click",(()=>{n.start()})).delegateTo(document,".onClickMaskExtensionManager"),new d("click",((e,t)=>{e.preventDefault(),n.start(),new c(t.href).get().then(this.updateExtension)})).delegateTo(document,"a[data-action=update-extension]"),new d("change",((e,t)=>{const n=document.querySelector(".t3js-dependencies")
t.checked?n.classList.remove("disabled"):n.classList.add("disabled")})).delegateTo(document,"input[name=unlockDependencyIgnoreButton]"),new d("click",(()=>{n.start()})).delegateTo(document,".t3-button-action-installdistribution"),null!==(s=document.querySelector(g.searchField))){const p=t.get(this.searchFilterSessionKey)
null!==p&&(s.value=p,this.filterExtensions(p)),new d("submit",(e=>{e.preventDefault()})).bindTo(s.closest("form")),new m("input",(e=>{const n=e.target
t.set(this.searchFilterSessionKey,n.value),this.filterExtensions(n.value)}),100).bindTo(s),s.clearable({onClear:()=>{t.unset(this.searchFilterSessionKey),this.filterExtensions("")}})}this.Repository.initDom(),this.Update.initializeEvents(),this.UploadForm.initializeEvents()}))}filterExtensions(e){const t=document.querySelectorAll("[data-filterable]"),n=[]
t.forEach((e=>{const t=Array.from(e.parentElement.children)
n.push(t.indexOf(e))})),document.querySelectorAll("#typo3-extension-list tbody tr").forEach((t=>{const o=n.map((e=>t.children.item(e))),i=[]
o.forEach((e=>{i.push(e.textContent.trim().replace(/\s+/g," "))})),t.classList.toggle("hidden",""!==e&&!RegExp(e,"i").test(i.join(":")))}))}removeExtensionFromDisk(e){n.start(),new c(e.href).post({}).then((()=>{location.reload()})).finally((()=>{n.done()}))}async updateExtension(e){let t=0
const s=await e.resolve(),r=document.createElement("form")
for(const[version,comment]of Object.entries(s.updateComments)){const a=document.createElement("input")
a.setAttribute("type","radio"),a.setAttribute("name","version"),a.value=version,0===t&&a.setAttribute("checked","checked")
const l=document.createElement("h3")
l.innerHTML=p.encodeHtml(version),l.prepend(a)
const m=document.createElement("div")
m.innerHTML=comment.replace(/(\r\n|\n\r|\r|\n)/g,"\n").split(/\n/).map((e=>p.encodeHtml(e))).join("<br>"),r.append(l,m),t++}const d=document.createElement("h1")
d.textContent=TYPO3.lang["extensionList.updateConfirmation.title"]
const u=document.createElement("h2")
u.textContent=TYPO3.lang["extensionList.updateConfirmation.message"]
const g=document.createElement("div")
g.append(d,u,r),n.done(),o.confirm(TYPO3.lang["extensionList.updateConfirmation.questionVersionComments"],g,i.warning,[{text:TYPO3.lang["button.cancel"],active:!0,btnClass:"btn-default",trigger:(e,t)=>t.hideModal()},{text:TYPO3.lang["button.updateExtension"],btnClass:"btn-warning",trigger:(e,t)=>{n.start(),new c(s.url).post({version:t.querySelector('input[name="version"]:checked')?.value}).finally((()=>{location.reload()})),t.hideModal()}}])}}
void 0===TYPO3.ExtensionManager&&(TYPO3.ExtensionManager=f)
export default f
