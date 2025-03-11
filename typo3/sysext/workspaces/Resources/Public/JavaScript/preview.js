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
import{SeverityEnum as e}from"@typo3/backend/enum/severity.js"
import t from"@typo3/core/document-service.js"
import s from"@typo3/backend/modal.js"
import i from"@typo3/backend/utility.js"
import o from"@typo3/workspaces/workspaces.js"
import n from"@typo3/core/event/throttle-event.js"
import"@typo3/workspaces/renderable/send-to-stage-form.js"
import r from"@typo3/core/event/regular-event.js"
var a
!function(e){e.topbar=".t3js-workspace-topbar",e.stageSliderContainer=".t3js-stage-slider-container",e.stageSlider=".t3js-stage-slider",e.liveView=".t3js-workspace-view-live",e.workspaceView=".t3js-workspace-view-workspace",e.sendToStageAction='[data-action="send-to-stage"]',e.discardAction='[data-action="discard"]',e.stageButtonsContainer=".t3js-stage-buttons",e.previewModeContainer=".t3js-preview-mode",e.activePreviewMode=".t3js-active-preview-mode",e.workspacePreview=".t3js-workspace-preview"}(a||(a={}))
export default new class extends o{constructor(){super(),this.currentSlidePosition=100,this.elements={},t.ready().then((()=>{this.getElements(),this.resizeViews(),this.registerEvents()}))}getElements(){this.elements.liveView=document.querySelector(a.liveView),this.elements.stageSliderContainer=document.querySelector(a.stageSliderContainer),this.elements.stageSlider=document.querySelector(a.stageSlider),this.elements.workspaceView=document.querySelector(a.workspaceView),this.elements.stageButtonsContainer=document.querySelector(a.stageButtonsContainer),this.elements.previewModeContainer=document.querySelector(a.previewModeContainer),this.elements.activePreviewMode=document.querySelector(a.activePreviewMode),this.elements.workspacePreview=document.querySelector(a.workspacePreview)}registerEvents(){new n("resize",(()=>{this.resizeViews()}),50).bindTo(window),new r("click",this.renderDiscardWindow.bind(this)).delegateTo(document,a.discardAction),new r("click",this.renderSendPageToStageWindow.bind(this)).delegateTo(document,a.sendToStageAction),new r("click",(()=>{window.top.document.querySelectorAll(".t3js-workspace-recipient:not(:disabled)").forEach((e=>{e.checked=!0}))})).delegateTo(document,".t3js-workspace-recipients-selectall"),new r("click",(()=>{window.top.document.querySelectorAll(".t3js-workspace-recipient:not(:disabled)").forEach((e=>{e.checked=!1}))})).delegateTo(document,".t3js-workspace-recipients-deselectall"),new n("input",this.updateSlidePosition.bind(this),10).bindTo(document.querySelector(a.stageSlider)),new r("click",this.changePreviewMode.bind(this)).delegateTo(this.elements.previewModeContainer,"[data-preview-mode]")}renderStageButtons(e){this.elements.stageButtonsContainer.innerHTML=e}updateSlidePosition(e){this.currentSlidePosition=parseInt(e.target.value,10),this.resizeViews()}resizeViews(){"slider"===this.elements.activePreviewMode.dataset.activePreviewMode&&(this.elements.liveView.style.height=100-this.currentSlidePosition+"%")}renderDiscardWindow(){const t=s.confirm(TYPO3.lang["window.discardAll.title"],TYPO3.lang["window.discardAll.message"],e.warning,[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{t.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-warning",name:"ok"}])
t.addEventListener("button.clicked",(e=>{"ok"===e.target.name&&this.sendRemoteRequest([this.generateRemoteActionsPayload("discardStagesFromPage",[TYPO3.settings.Workspaces.id]),this.generateRemoteActionsPayload("updateStageChangeButtons",[TYPO3.settings.Workspaces.id])],a.topbar).then((async e=>{t.hideModal(),this.renderStageButtons((await e.resolve())[1].result),this.elements.workspaceView.setAttribute("src",this.elements.workspaceView.getAttribute("src"))}))}))}renderSendPageToStageWindow(e,t){const s=t.dataset.direction
let o
if("prev"===s)o="sendPageToPreviousStage"
else{if("next"!==s)throw"Invalid direction "+s+" requested."
o="sendPageToNextStage"}this.sendRemoteRequest(this.generateRemoteActionsPayload(o,[TYPO3.settings.Workspaces.id]),a.topbar).then((async e=>{const s=await e.resolve(),o=this.renderSendToStageWindow(s)
o.addEventListener("button.clicked",(e=>{if("ok"===e.target.name){const n=i.convertFormToObject(o.querySelector("form"))
n.affects=s[0].result.affects,n.stageId=parseInt(t.dataset.stageId,10),this.sendRemoteRequest([this.generateRemoteActionsPayload("sentCollectionToStage",[n]),this.generateRemoteActionsPayload("updateStageChangeButtons",[TYPO3.settings.Workspaces.id])],a.topbar).then((async e=>{o.hideModal(),this.renderStageButtons((await e.resolve())[1].result)}))}}))}))}changePreviewMode(e,t){e.preventDefault()
const s=this.elements.activePreviewMode.dataset.activePreviewMode,i=t.dataset.previewMode
this.elements.activePreviewMode.textContent=t.textContent,this.elements.activePreviewMode.dataset.activePreviewMode=i,this.elements.workspacePreview.classList.remove("typo3-workspace-preview-"+s),this.elements.workspacePreview.classList.add("typo3-workspace-preview-"+i),"slider"===i?(this.elements.stageSliderContainer.style.display="",this.resizeViews()):(this.elements.stageSliderContainer.style.display="none",this.elements.liveView.style.height="")}}
