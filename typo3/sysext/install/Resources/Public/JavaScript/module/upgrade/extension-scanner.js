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
import"bootstrap"
import e from"@typo3/core/ajax/ajax-request.js"
import{AbstractInteractableModule as n}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/modal.js"
import s from"@typo3/backend/notification.js"
import a from"@typo3/install/ajax/ajax-queue.js"
import r from"@typo3/install/router.js"
import i from"@typo3/core/event/regular-event.js"
var o
!function(e){e.extensionContainer=".t3js-extensionScanner-extension",e.numberOfFiles=".t3js-extensionScanner-number-of-files",e.scanSingleTrigger=".t3js-extensionScanner-scan-single",e.extensionScanButton=".t3js-extensionScanner-scan-all"}(o||(o={}))
export default new class extends n{constructor(){super(...arguments),this.listOfAffectedRestFileHashes=[]}initialize(e){super.initialize(e),Promise.all([this.loadModuleFrameAgnostic("@typo3/backend/element/progress-bar-element.js")]).then((()=>{this.getData()})),new i("typo3-modal-hide",(()=>{a.flush()})).bindTo(e),new i("click",((e,n)=>{e.preventDefault()
const t=n.closest(o.extensionContainer).dataset.extension
this.scanSingleExtension(t)})).delegateTo(e,o.scanSingleTrigger),new i("click",(n=>{n.preventDefault(),this.setModalButtonsState(!1)
const t=e.querySelectorAll(o.extensionContainer)
this.scanAll(t)})).delegateTo(e,o.extensionScanButton)}getData(){const n=this.getModalBody()
new e(r.getUrl("extensionScannerGetData")).get().then((async e=>{const a=await e.resolve()
!0===a.success?(n.innerHTML=a.html,t.setButtons(a.buttons),this.setupEventListeners()):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{r.handleAjaxError(e,n)}))}setupEventListeners(){this.currentModal.querySelectorAll(o.extensionContainer).forEach((e=>{new i("show.bs.collapse",(e=>{const n=e.currentTarget
if(void 0===n.dataset.scanned){const t=n.dataset.extension
this.scanSingleExtension(t),n.dataset.scanned=String(!0)}})).bindTo(e)}))}getExtensionSelector(e){return o.extensionContainer+"-"+e}async scanAll(n){n.forEach((e=>{e.classList.remove("panel-danger","panel-warning","panel-success")
const n=e.querySelector(".panel-progress-bar")
n.style.width=String(0),n.setAttribute("aria-valuenow",String(0)),n.querySelector("span").innerText="0%"})),this.setProgressForAll()
const t=[...n].map((async e=>{const n=e.dataset.extension
try{await this.scanSingleExtension(n)}finally{e.dataset.scanned=String(!0)}}))
try{await Promise.allSettled(t)}finally{this.setModalButtonsState(!0),s.success("Scan finished","All extensions have been scanned.")
try{const a=await new e(r.getUrl()).post({install:{action:"extensionScannerMarkFullyScannedRestFiles",token:this.getModuleContent().dataset.extensionScannerMarkFullyScannedRestFilesToken,hashes:Array.from(new Set(this.listOfAffectedRestFileHashes))}}),i=await a.resolve()
!0===i.success&&s.success("Marked not affected files","Marked "+i.markedAsNotAffected+" ReST files as not affected.")}catch(e){r.handleAjaxError(e,this.getModalBody())}}}setStatusMessageForScan(e,n,t){this.findInModal(this.getExtensionSelector(e)).querySelector(o.numberOfFiles).innerText="Checked "+n+" of "+t+" files"}setProgressForScan(e,n,t){const s=n/t*100,a=this.findInModal(this.getExtensionSelector(e)).querySelector(".panel-progress-bar")
a.style.width=s+"%",a.setAttribute("aria-valuenow",String(s)),a.querySelector("span").innerText=s+"%"}setProgressForAll(){const e=this.currentModal.querySelectorAll(o.extensionContainer).length,n=this.currentModal.querySelectorAll(o.extensionContainer+".t3js-extensionscan-finished").length,t=`Scanning extensions (${n} of ${e} done)…`,s=this.findInModal(".t3js-extensionScanner-progress-all-extension")
s.removeAttribute("hidden"),s.max=e,s.value=n,s.label=t}async scanSingleExtension(n){const t=this.getModuleContent().dataset.extensionScannerFilesToken,i=this.getModalBody(),o=this.findInModal(this.getExtensionSelector(n))
let l=!1
o.classList.add("panel-default"),o.classList.remove("panel-danger","panel-warning","panel-success","t3js-extensionscan-finished"),o.dataset.hasRun=String("true"),(h=o.querySelector(".t3js-extensionScanner-scan-single")).innerText="Scanning...",h.disabled=!0,o.querySelector(".t3js-extensionScanner-extension-body-loc").innerText="0",o.querySelector(".t3js-extensionScanner-extension-body-ignored-files").innerText="0",o.querySelector(".t3js-extensionScanner-extension-body-ignored-lines").innerText="0",this.setProgressForAll()
try{const c=await new e(r.getUrl()).post({install:{action:"extensionScannerFiles",token:t,extension:n}}),d=await c.resolve()
if(!0===d.success&&Array.isArray(d.files)){const S=d.files.length
if(S<=0)return void s.warning("No files found","The extension "+n+" contains no scannable files")
this.setStatusMessageForScan(n,0,S),o.querySelector(".t3js-extensionScanner-extension-body").innerText="",o.classList.add("panel-has-progress")
let u=0
const h,x=d.files.map((e=>new Promise(((t,s)=>{a.add({method:"POST",data:{install:{action:"extensionScannerScanFile",token:this.getModuleContent().dataset.extensionScannerScanFileToken,extension:n,file:e}},url:r.getUrl(),onfulfilled:async s=>{const a=await s.resolve()
if(u++,this.setStatusMessageForScan(n,u,S),this.setProgressForScan(n,u,S),a.success&&Array.isArray(a.matches)&&a.matches.forEach((n=>{l=!0
const t=i.querySelector("#t3js-extensionScanner-file-hit-template .panel").cloneNode(!0)
t.querySelector(".t3js-extensionScanner-hit-file-panel-head").setAttribute("data-bs-target","#collapse"+n.uniqueId),t.querySelector(".t3js-extensionScanner-hit-file-panel-head").setAttribute("aria-controls","collapse"+n.uniqueId),t.querySelector(".t3js-extensionScanner-hit-file-panel-body").setAttribute("id","collapse"+n.uniqueId),t.querySelector(".t3js-extensionScanner-hit-filename").innerText=e,t.querySelector(".t3js-extensionScanner-hit-message").innerText=n.message,"strong"===n.indicator?t.querySelector(".t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges").innerHTML+='<span class="badge badge-danger" title="Reliable match, false positive unlikely">strong</span>':t.querySelector(".t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges").innerHTML+='<span class="badge badge-warning" title="Probable match, but can be a false positive">weak</span>',!0===n.silenced&&(t.querySelector(".t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges").innerHTML+='<span class="badge badge-info" title="Match has been annotated by extension author as false positive match">silenced</span>'),t.querySelector(".t3js-extensionScanner-hit-file-lineContent").innerText=n.lineContent,t.querySelector(".t3js-extensionScanner-hit-file-line").innerText=n.line+": ",Array.isArray(n.restFiles)&&n.restFiles.forEach((e=>{const n=i.querySelector("#t3js-extensionScanner-file-hit-rest-template .panel").cloneNode(!0)
n.querySelector(".t3js-extensionScanner-hit-rest-panel-head").setAttribute("data-bs-target","#collapse"+e.uniqueId),n.querySelector(".t3js-extensionScanner-hit-rest-panel-head").setAttribute("aria-controls","collapse"+e.uniqueId),n.querySelector(".t3js-extensionScanner-hit-rest-panel-head .t3js-extensionScanner-hit-rest-badge").innerText=e.version,n.querySelector(".t3js-extensionScanner-hit-rest-panel-body").setAttribute("id","collapse"+e.uniqueId),n.querySelector(".t3js-extensionScanner-hit-rest-headline").innerText=e.headline,n.querySelector(".t3js-extensionScanner-hit-rest-body").innerText=e.content,n.classList.add("panel-"+e.class),t.querySelector(".t3js-extensionScanner-hit-file-rest-container").append(n),this.listOfAffectedRestFileHashes.push(e.file_hash)}))
const s=t.querySelectorAll(".panel-breaking, .t3js-extensionScanner-hit-file-rest-container").length>0?"panel-danger":"panel-warning"
t.classList.add(s),t.classList.remove("panel-default")
const a=o.querySelector(".t3js-extensionScanner-extension-body")
a.classList.remove("hide"),a.append(t),o.classList.remove("panel-default"),"panel-danger"===s&&(o.classList.remove("panel-warning"),o.classList.add(s)),"panel-warning"!==s||o.classList.contains("panel-danger")||o.classList.add(s)})),a.success){const r=parseInt(o.querySelector(".t3js-extensionScanner-extension-body-loc").innerText,10)
if(o.querySelector(".t3js-extensionScanner-extension-body-loc").innerText=String(r+a.effectiveCodeLines),a.isFileIgnored){const c=parseInt(o.querySelector(".t3js-extensionScanner-extension-body-ignored-files").innerText,10)
o.querySelector(".t3js-extensionScanner-extension-body-ignored-files").innerText=String(c+1)}const d=parseInt(o.querySelector(".t3js-extensionScanner-extension-body-ignored-lines").innerText,10)
o.querySelector(".t3js-extensionScanner-extension-body-ignored-lines").innerText=String(d+a.ignoredLines)}t()},onrejected:e=>{s(),u+=1,this.setStatusMessageForScan(n,u,S),this.setProgressForScan(n,u,S),o.classList.remove("panel-has-progress"),this.setProgressForAll(),console.error(e)}})}))))
await Promise.allSettled(x),l||(o.classList.remove("panel-default"),o.classList.add("panel-success")),o.classList.add("t3js-extensionscan-finished"),o.classList.remove("panel-has-progress"),this.setProgressForAll(),(h=o.querySelector(".t3js-extensionScanner-scan-single")).innerText="Rescan",h.disabled=!1}else s.error("Oops, an error occurred","Please look at the browser console output for details"),console.error(d)}catch(e){r.handleAjaxError(e,i)}}}
