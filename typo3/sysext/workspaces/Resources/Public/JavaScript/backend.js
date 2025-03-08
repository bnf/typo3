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
import{html as t}from"lit"
import"@typo3/backend/element/icon-element.js"
import{SeverityEnum as n}from"@typo3/backend/enum/severity.js"
import"@typo3/backend/input/clearable.js"
import"@typo3/workspaces/renderable/record-table.js"
import"@typo3/backend/element/pagination.js"
import a from"@typo3/workspaces/workspaces.js"
import{default as o}from"@typo3/backend/modal.js"
import s from"@typo3/backend/storage/persistent.js"
import i from"@typo3/backend/utility.js"
import c from"@typo3/backend/window-manager.js"
import r from"@typo3/core/event/regular-event.js"
import{topLevelModuleImport as l}from"@typo3/backend/utility/top-level-module-import.js"
import{selector as d}from"@typo3/core/literals.js"
import g from"@typo3/workspaces/utility/icon-helper.js"
import h from"@typo3/backend/action-button/deferred-action.js"
import{PaginationElement as p}from"@typo3/backend/element/pagination.js"
var u
!function(e){e.searchForm="#workspace-settings-form",e.searchTextField='#workspace-settings-form input[name="search-text"]',e.searchSubmitBtn='#workspace-settings-form button[type="submit"]',e.depthSelector='#workspace-settings-form [name="depth"]',e.languageSelector='#workspace-settings-form select[name="languages"]',e.stagesSelector='#workspace-settings-form select[name="stages"]',e.workspaceActions=".workspace-actions",e.chooseStageAction='.workspace-actions [name="stage-action"]',e.chooseSelectionAction='.workspace-actions [name="selection-action"]',e.chooseMassAction='.workspace-actions [name="mass-action"]',e.publishAction='[data-action="publish"]',e.prevStageAction='[data-action="prevstage"]',e.nextStageAction='[data-action="nextstage"]',e.changesAction='[data-action="changes"]',e.previewAction='[data-action="preview"]',e.openAction='[data-action="open"]',e.versionAction='[data-action="version"]',e.removeAction='[data-action="remove"]',e.expandAction='[data-action="expand"]',e.workspaceRecipientsSelectAll=".t3js-workspace-recipients-selectall",e.workspaceRecipientsDeselectAll=".t3js-workspace-recipients-deselectall",e.container="#workspace-panel",e.contentsContainer="#workspace-contents",e.noContentsContainer="#workspace-contents-empty",e.previewLinksButton=".t3js-preview-link",e.pagination="#workspace-pagination"}(u||(u={}))
class m extends a{constructor(){super(),this.settings={dir:"ASC",id:TYPO3.settings.Workspaces.id,depth:1,language:"all",limit:30,query:"",sort:"label_Workspace",start:0,filterTxt:""},this.paging={currentPage:1,totalPages:1,totalItems:0},this.markedRecordsForMassAction=[],this.handleCheckboxStateChanged=e=>{const t=e.target,n=t.closest("tr"),a=t.checked,o=n.dataset.table+":"+n.dataset.uid+":"+n.dataset.t3ver_oid
if(a)this.markedRecordsForMassAction.push(o)
else{const e=this.markedRecordsForMassAction.indexOf(o)
e>-1&&this.markedRecordsForMassAction.splice(e,1)}n.dataset.collectionCurrent?m.changeCollectionChildrenState(n.dataset.collectionCurrent,a):n.dataset.collection&&(m.changeCollectionChildrenState(n.dataset.collection,a),m.changeCollectionParentState(n.dataset.collection,a))
document.querySelector(u.chooseMassAction).disabled=this.markedRecordsForMassAction.length>0},this.openIntegrityWarningModal=()=>{const e=o.confirm(TYPO3.lang["window.integrity_warning.title"],t`<p>${TYPO3.lang["integrity.hasIssuesDescription"]}<br>${TYPO3.lang["integrity.hasIssuesQuestion"]}</p>`,n.warning)
return e.addEventListener("button.clicked",(()=>e.hideModal())),e},l("@typo3/workspaces/renderable/send-to-stage-form.js"),l("@typo3/workspaces/renderable/record-information.js"),e.ready().then((()=>{this.registerEvents(),this.notifyWorkspaceSwitchAction(),this.settings.depth=document.querySelector(u.depthSelector)?.value,this.settings.language=document.querySelector(u.languageSelector)?.value,this.settings.stage=document.querySelector(u.stagesSelector)?.value,null!==document.querySelector(u.container)&&this.getWorkspaceInfos()}))}static refreshPageTree(){top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}static changeCollectionParentState(e,t){const n=document.querySelector('tr[data-collection-current="'+e+'"] input[type=checkbox]')
null!==n&&n.checked!==t&&(n.checked=t,n.dataset.manuallyChanged="true",n.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{bubbles:!0,cancelable:!1})))}static changeCollectionChildrenState(e,t){const n=document.querySelectorAll(d`tr[data-collection="${e}"] input[type=checkbox]`)
n.length&&n.forEach((e=>{e.checked!==t&&(e.checked=t,e.dataset.manuallyChanged="true",e.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{bubbles:!0,cancelable:!1})))}))}notifyWorkspaceSwitchAction(){const e=document.querySelector("main[data-workspace-switch-action]")
if(e.dataset.workspaceSwitchAction){const t=JSON.parse(e.dataset.workspaceSwitchAction)
top.TYPO3.WorkspacesMenu.performWorkspaceSwitch(t.id,t.title),top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh")),top.TYPO3.ModuleMenu.App.refreshMenu()}}checkIntegrity(e){return this.sendRemoteRequest(this.generateRemotePayload("checkIntegrity",e))}registerEvents(){new r("click",((e,t)=>{const n=t.closest("tr")
this.checkIntegrity({selection:[{liveId:n.dataset.uid,versionId:n.dataset.t3ver_oid,table:n.dataset.table}],type:"selection"}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderPublishModal(n)})):this.renderPublishModal(n)}))})).delegateTo(document,u.publishAction),new r("click",((e,t)=>{this.sendToStage(t.closest("tr"),"prev")})).delegateTo(document,u.prevStageAction),new r("click",((e,t)=>{this.sendToStage(t.closest("tr"),"next")})).delegateTo(document,u.nextStageAction),new r("click",this.viewChanges.bind(this)).delegateTo(document,u.changesAction),new r("click",this.openPreview.bind(this)).delegateTo(document,u.previewAction),new r("click",((e,t)=>{const n=t.closest("tr"),a=TYPO3.settings.FormEngine.moduleUrl+"&returnUrl="+encodeURIComponent(document.location.href)+"&id="+TYPO3.settings.Workspaces.id+"&edit["+n.dataset.table+"]["+n.dataset.uid+"]=edit"
window.location.href=a})).delegateTo(document,u.openAction),new r("click",((e,t)=>{const n=t.closest("tr"),a="pages"===n.dataset.table?n.dataset.t3ver_oid:n.dataset.pid
window.location.href=TYPO3.settings.WebLayout.moduleUrl+"&id="+a})).delegateTo(document,u.versionAction),new r("click",this.confirmDeleteRecordFromWorkspace.bind(this)).delegateTo(document,u.removeAction),new r("click",((e,t)=>{let n
n="true"===t.ariaExpanded?"actions-caret-down":"actions-caret-right",t.replaceChildren(document.createRange().createContextualFragment(g.getIcon(n)))})).delegateTo(document,u.expandAction),new r("click",(()=>{window.top.document.querySelectorAll(".t3js-workspace-recipient").forEach((e=>{e.disabled||(e.checked=!0)}))})).delegateTo(window.top.document,u.workspaceRecipientsSelectAll),new r("click",(()=>{window.top.document.querySelectorAll(".t3js-workspace-recipient").forEach((e=>{e.disabled||(e.checked=!1)}))})).delegateTo(window.top.document,u.workspaceRecipientsDeselectAll),new r("submit",(e=>{e.preventDefault(),this.getWorkspaceInfos()})).delegateTo(document,u.searchForm),new r("input",((e,t)=>{const n=document.querySelector(u.searchSubmitBtn)
""!==t.value?n.disabled=!1:(n.disabled=!0,this.settings.filterTxt="",this.getWorkspaceInfos())})).delegateTo(document,u.searchTextField),new r("change",((e,t)=>{this.settings.filterTxt=t.value,""!==this.settings.filterTxt&&this.getWorkspaceInfos()})).delegateTo(document,u.searchTextField)
const e=document.querySelector(u.searchTextField)
null!==e&&e.clearable({onClear:()=>{document.querySelector(u.searchSubmitBtn).disabled=!0,this.settings.filterTxt="",this.getWorkspaceInfos()}}),new r("multiRecordSelection:checkbox:state:changed",this.handleCheckboxStateChanged).bindTo(document),new r("change",((e,t)=>{const n=t.value
s.set("moduleData.workspaces_admin.depth",n),this.settings.depth=n,this.getWorkspaceInfos()})).delegateTo(document,u.depthSelector),new r("click",this.generatePreviewLinks.bind(this)).delegateTo(document,u.previewLinksButton),new r("change",((e,t)=>{s.set("moduleData.workspaces_admin.language",t.value),this.settings.language=t.value,this.sendRemoteRequest(this.generateRemotePayload("getWorkspaceInfos",this.settings)).then((async e=>{const n=await e.resolve()
t.previousElementSibling.innerHTML=t.querySelector("option:checked").dataset.icon,this.renderWorkspaceInfos(n[0].result)}))})).delegateTo(document,u.languageSelector),new r("change",((e,t)=>{const n=t.value
s.set("moduleData.workspaces_admin.stage",n),this.settings.stage=n,this.getWorkspaceInfos()})).delegateTo(document,u.stagesSelector),new r("change",this.sendToSpecificStageAction.bind(this)).delegateTo(document,u.chooseStageAction),new r("change",this.runSelectionAction.bind(this)).delegateTo(document,u.chooseSelectionAction),new r("change",this.runMassAction.bind(this)).delegateTo(document,u.chooseMassAction),new r("click",(e=>{e.preventDefault()
const t=e.target.closest("button")
let n=!1
switch(t.dataset.action){case"previous":this.paging.currentPage>1&&(this.paging.currentPage--,n=!0)
break
case"next":this.paging.currentPage<this.paging.totalPages&&(this.paging.currentPage++,n=!0)
break
case"page":this.paging.currentPage=parseInt(t.dataset.page,10),n=!0
break
default:throw'Unknown action "'+t.dataset.action+'"'}n&&(this.settings.start=parseInt(this.settings.limit.toString(),10)*(this.paging.currentPage-1),this.getWorkspaceInfos())})).delegateTo(document,u.pagination)}sendToStage(e,t){let n,a,o
if("next"===t)n=e.dataset.nextStage,a="sendToNextStageWindow",o="sendToNextStageExecute"
else{if("prev"!==t)throw"Invalid direction given."
n=e.dataset.prevStage,a="sendToPrevStageWindow",o="sendToPrevStageExecute"}this.sendRemoteRequest(this.generateRemoteActionsPayload(a,[e.dataset.uid,e.dataset.table,e.dataset.t3ver_oid])).then((async t=>{const a=this.renderSendToStageWindow(await t.resolve())
a.addEventListener("button.clicked",(t=>{if("ok"===t.target.name){const t=i.convertFormToObject(a.querySelector("form"))
t.affects={table:e.dataset.table,nextStage:n,t3ver_oid:e.dataset.t3ver_oid,uid:e.dataset.uid,elements:[]},this.sendRemoteRequest([this.generateRemoteActionsPayload(o,[t]),this.generateRemotePayload("getWorkspaceInfos",this.settings)]).then((async e=>{const t=await e.resolve()
a.hideModal(),this.renderWorkspaceInfos(t[1].result),m.refreshPageTree()}))}}))}))}getWorkspaceInfos(){this.sendRemoteRequest(this.generateRemotePayload("getWorkspaceInfos",this.settings)).then((async e=>{this.renderWorkspaceInfos((await e.resolve())[0].result)}))}renderWorkspaceInfos(e){const t=document.querySelector(u.contentsContainer),n=document.querySelector(u.noContentsContainer)
this.resetMassActionState(e.data.length),this.buildPagination(e.total),0===e.total?(t.style.display="none",n.style.display="block"):(t.style.display="block",n.style.display="none")
document.querySelector("typo3-workspaces-record-table").results=e.data}buildPagination(e){const t=document.querySelector(u.pagination)
if(0===e)return void t.replaceChildren()
if(this.paging.totalItems=e,this.paging.totalPages=Math.ceil(e/parseInt(this.settings.limit.toString(),10)),1===this.paging.totalPages)return void t.replaceChildren()
let n=t.querySelector("typo3-backend-pagination")
null===n&&(n=document.createElement("typo3-backend-pagination"),t.append(n)),n.paging={...this.paging}}viewChanges(e,t){e.preventDefault()
const a=t.closest("tr")
this.sendRemoteRequest(this.generateRemotePayload("getRowDetails",{stage:parseInt(a.dataset.stage,10),t3ver_oid:parseInt(a.dataset.t3ver_oid,10),table:a.dataset.table,uid:parseInt(a.dataset.uid,10),filterFields:!0})).then((async e=>{const t=(await e.resolve())[0].result.data[0],s=[],i=document.createElement("typo3-workspaces-record-information")
i.record=t,i.TYPO3lang=TYPO3.lang,!1!==t.label_PrevStage&&a.dataset.stage!==a.dataset.prevStage&&s.push({text:t.label_PrevStage.title,active:!0,btnClass:"btn-default",name:"prevstage",trigger:(e,t)=>{t.hideModal(),this.sendToStage(a,"prev")}}),!1!==t.label_NextStage&&s.push({text:t.label_NextStage.title,active:!0,btnClass:"btn-default",name:"nextstage",trigger:(e,t)=>{t.hideModal(),this.sendToStage(a,"next")}}),s.push({text:TYPO3.lang.close,active:!0,btnClass:"btn-info",name:"cancel",trigger:(e,t)=>t.hideModal()}),o.advanced({type:o.types.default,title:TYPO3.lang["window.recordInformation"].replace("{0}",a.querySelector(".t3js-title-workspace").innerText.trim()),content:i,severity:n.info,buttons:s,size:o.sizes.medium})}))}openPreview(e,t){const n=t.closest("tr")
this.sendRemoteRequest(this.generateRemoteActionsPayload("viewSingleRecord",[n.dataset.table,n.dataset.uid])).then((async e=>{const t=(await e.resolve())[0].result
c.localOpen(t)}))}confirmDeleteRecordFromWorkspace(e,t){const a=t.closest("tr"),s=o.confirm(TYPO3.lang["window.discard.title"],TYPO3.lang["window.discard.message"],n.warning,[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{s.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-warning",name:"ok"}])
s.addEventListener("button.clicked",(e=>{"ok"===e.target.name&&this.sendRemoteRequest([this.generateRemoteActionsPayload("deleteSingleRecord",[a.dataset.table,a.dataset.uid])]).then((()=>{s.hideModal(),this.getWorkspaceInfos(),m.refreshPageTree()}))}))}runSelectionAction(e,t){const n=t.value,a="discard"!==n
if(0===n.length)return
const o=[]
for(let e=0;e<this.markedRecordsForMassAction.length;++e){const t=this.markedRecordsForMassAction[e].split(":")
o.push({table:t[0],liveId:t[2],versionId:t[1]})}a?this.checkIntegrity({selection:o,type:"selection"}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderSelectionActionModal(n,o)})):this.renderSelectionActionModal(n,o)})):this.renderSelectionActionModal(n,o)}renderPublishModal(e){const t=o.advanced({title:TYPO3.lang["window.publish.title"],content:TYPO3.lang["window.publish.message"],severity:n.info,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){t.hideModal()}},{text:TYPO3.lang.label_doaction_publish,btnClass:"btn-info",action:new h((async()=>{await this.sendRemoteRequest(this.generateRemoteActionsPayload("publishSingleRecord",[e.dataset.table,e.dataset.t3ver_oid,e.dataset.uid])),this.getWorkspaceInfos(),m.refreshPageTree()}))}]})}renderSelectionActionModal(e,a){const s=o.advanced({title:TYPO3.lang["window.selectionAction.title"],content:t`<p>${TYPO3.lang["tooltip."+e+"Selected"]}</p>`,severity:n.warning,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){s.hideModal()}},{text:TYPO3.lang["label_doaction_"+e],btnClass:"btn-warning",action:new h((async()=>{await this.sendRemoteRequest(this.generateRemoteActionsPayload("executeSelectionAction",{action:e,selection:a})),this.markedRecordsForMassAction=[],this.getWorkspaceInfos(),m.refreshPageTree()}))}]})
s.addEventListener("typo3-modal-hidden",(()=>{document.querySelector(u.chooseSelectionAction).value=""}))}runMassAction(e,t){const n=t.value,a="discard"!==n
0!==n.length&&(a?this.checkIntegrity({language:this.settings.language,type:n}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderMassActionModal(n)})):this.renderMassActionModal(n)})):this.renderMassActionModal(n))}renderMassActionModal(e){let a,s
switch(e){case"publish":a="publishWorkspace",s=TYPO3.lang.label_doaction_publish
break
case"discard":a="flushWorkspace",s=TYPO3.lang.label_doaction_discard
break
default:throw"Invalid mass action "+e+" called."}const i=async e=>{const t=(await e.resolve())[0].result
t.processed<t.total?this.sendRemoteRequest(this.generateRemoteMassActionsPayload(a,t)).then(i):(this.getWorkspaceInfos(),o.dismiss())},c=o.advanced({title:TYPO3.lang["window.massAction.title"],content:t`<p>${TYPO3.lang["tooltip."+e+"All"]}</p><p>${TYPO3.lang["tooltip.affectWholeWorkspace"]}</p>`,severity:n.warning,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){c.hideModal()}},{text:s,btnClass:"btn-warning",action:new h((async()=>{const e=await this.sendRemoteRequest(this.generateRemoteMassActionsPayload(a,{init:!0,total:0,processed:0,language:this.settings.language}))
await i(e)}))}]})
c.addEventListener("typo3-modal-hidden",(()=>{document.querySelector(u.chooseMassAction).value=""}))}sendToSpecificStageAction(e,t){const n=[],a=t.value
for(let e=0;e<this.markedRecordsForMassAction.length;++e){const t=this.markedRecordsForMassAction[e].split(":")
n.push({table:t[0],uid:t[1],t3ver_oid:t[2]})}this.sendRemoteRequest(this.generateRemoteActionsPayload("sendToSpecificStageWindow",[a,n])).then((async e=>{const t=this.renderSendToStageWindow(await e.resolve())
t.addEventListener("button.clicked",(e=>{if("ok"===e.target.name){const e=i.convertFormToObject(t.querySelector("form"))
e.affects={elements:n,nextStage:a},this.sendRemoteRequest([this.generateRemoteActionsPayload("sendToSpecificStageExecute",[e]),this.generateRemotePayload("getWorkspaceInfos",this.settings)]).then((async e=>{const n=await e.resolve()
t.hideModal(),this.renderWorkspaceInfos(n[1].result),m.refreshPageTree()}))}})),t.addEventListener("typo3-modal-hide",(()=>{document.querySelector(u.chooseStageAction).value=""}))}))}generatePreviewLinks(){this.sendRemoteRequest(this.generateRemoteActionsPayload("generateWorkspacePreviewLinksForAllLanguages",[this.settings.id])).then((async e=>{const t=(await e.resolve())[0].result,a=document.createElement("dl")
for(const[e,n]of Object.entries(t)){const t=document.createElement("dt")
t.textContent=e
const o=document.createElement("a")
o.href=n,o.target="_blank",o.textContent=n
const s=document.createElement("dd")
s.appendChild(o),a.append(t,s)}o.show(TYPO3.lang.previewLink,a,n.info,[{text:TYPO3.lang.ok,active:!0,btnClass:"btn-info",name:"ok",trigger:(e,t)=>t.hideModal()}],["modal-inner-scroll"])}))}resetMassActionState(e){if(this.markedRecordsForMassAction=[],e){document.querySelector(u.workspaceActions).classList.remove("hidden")
document.querySelector(u.chooseMassAction).disabled=!1}document.dispatchEvent(new CustomEvent("multiRecordSelection:actions:hide"))}}export default new m
