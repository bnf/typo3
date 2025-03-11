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
import e from"nprogress"
import n from"@typo3/backend/modal.js"
import t from"@typo3/backend/notification.js"
import s from"@typo3/backend/severity.js"
import o from"@typo3/backend/sortable-table.js"
import"@typo3/backend/input/clearable.js"
import r from"@typo3/core/ajax/ajax-request.js"
import i from"@typo3/core/event/regular-event.js"
export default class{constructor(){this.getDependencies=async o=>{const r=await o.resolve(),i=document.createElement("div")
i.innerHTML=r.message,e.done(),r.hasDependencies?n.confirm(r.title,i,s.info,[{text:TYPO3.lang["button.cancel"],active:!0,btnClass:"btn-default",trigger:()=>{n.dismiss()}},{text:TYPO3.lang["button.resolveDependencies"],btnClass:"btn-primary",trigger:()=>{this.getResolveDependenciesAndInstallResult(r.url),n.dismiss()}}]):r.hasErrors?t.error(r.title,r.message,15):this.getResolveDependenciesAndInstallResult(r.url)}}initDom(){e.configure({parent:".module-loading-indicator",showSpinner:!1})
const n=document.getElementById("terVersionTable"),t=document.getElementById("terSearchTable")
n instanceof HTMLTableElement&&new o(n),t instanceof HTMLTableElement&&new o(t),this.bindDownload(),this.bindSearchFieldResetter()}bindDownload(){new i("click",((n,t)=>{n.preventDefault()
const s=t.closest("form").dataset.href
e.start(),new r(s).get().then(this.getDependencies)})).delegateTo(document,".downloadFromTer form.download button[type=submit]")}getResolveDependenciesAndInstallResult(o){e.start(),new r(o).post({}).then((async e=>{try{const o=await e.raw().json(),r=document.createElement("div")
if(r.innerHTML=o.errorMessage,o.errorCount>0){const i=n.confirm(o.errorTitle,r,s.error,[{text:TYPO3.lang["button.cancel"],active:!0,btnClass:"btn-default",trigger:()=>{n.dismiss()}},{text:TYPO3.lang["button.resolveDependenciesIgnore"],btnClass:"btn-danger disabled t3js-dependencies",trigger:e=>{e.currentTarget.classList.contains("disabled")||(this.getResolveDependenciesAndInstallResult(o.skipDependencyUri),n.dismiss())}}])
i.addEventListener("typo3-modal-shown",(()=>{const e=i.querySelector(".t3js-dependencies")
i.querySelector('input[name="unlockDependencyIgnoreButton"]').addEventListener("change",(n=>{n.currentTarget.checked?e?.classList.remove("disabled"):e?.classList.add("disabled")}))}))}else{let l=TYPO3.lang["extensionList.dependenciesResolveDownloadSuccess.message"+o.installationTypeLanguageKey].replace(/\{0\}/g,o.extension)
l+="\n"+TYPO3.lang["extensionList.dependenciesResolveDownloadSuccess.header"]+": "
for(const[index,value]of Object.entries(o.result)){l+="\n\n"+TYPO3.lang["extensionList.dependenciesResolveDownloadSuccess.item"]+" "+index+": "
for(const a of Object.keys(value))l+="\n* "+a}t.info(TYPO3.lang["extensionList.dependenciesResolveFlashMessage.title"+o.installationTypeLanguageKey].replace(/\{0\}/g,o.extension),l,15),top.TYPO3.ModuleMenu.App.refreshMenu()}}catch{t.error(TYPO3.lang["extensionList.dependenciesResolveInstallError.title"]||"Install error",TYPO3.lang["extensionList.dependenciesResolveInstallError.message"]||"Your installation failed while resolving dependencies.")}}),(()=>{t.error(TYPO3.lang["extensionList.dependenciesResolveInstallError.title"]||"Install error",TYPO3.lang["extensionList.dependenciesResolveInstallError.message"]||"Your installation failed while resolving dependencies.")})).finally((()=>{e.done()}))}bindSearchFieldResetter(){let e
if(null!==(e=document.querySelector('.typo3-extensionmanager-searchTerForm input[type="text"]'))){const n=""!==e.value
e.clearable({onClear:e=>{n&&e.closest("form").submit()}})}}}