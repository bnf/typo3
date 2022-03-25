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
import{SeverityEnum}from"@typo3/backend/enum/severity.js";import $ from"jquery";import Modal from"@typo3/backend/modal.js";import Utility from"@typo3/backend/utility.js";import Workspaces from"@typo3/workspaces/workspaces.js";import ThrottleEvent from"@typo3/core/event/throttle-event.js";var Identifiers;!function(e){e.topbar="#typo3-topbar",e.workspacePanel=".workspace-panel",e.liveView="#live-view",e.stageSlider="#workspace-stage-slider",e.workspaceView="#workspace-view",e.sendToStageAction='[data-action="send-to-stage"]',e.discardAction='[data-action="discard"]',e.stageButtonsContainer=".t3js-stage-buttons",e.previewModeContainer=".t3js-preview-mode",e.activePreviewMode=".t3js-active-preview-mode",e.workspacePreview=".t3js-workspace-preview"}(Identifiers||(Identifiers={}));class Preview extends Workspaces{constructor(){super(),this.currentSlidePosition=100,this.elements={},this.updateSlidePosition=e=>{this.currentSlidePosition=parseInt(e.target.value,10),this.resizeViews()},this.renderDiscardWindow=()=>{const e=Modal.confirm(TYPO3.lang["window.discardAll.title"],TYPO3.lang["window.discardAll.message"],SeverityEnum.warning,[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{e.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-warning",name:"ok"}]);e.addEventListener("button.clicked",t=>{"ok"===t.target.name&&this.sendRemoteRequest([this.generateRemoteActionsPayload("discardStagesFromPage",[TYPO3.settings.Workspaces.id]),this.generateRemoteActionsPayload("updateStageChangeButtons",[TYPO3.settings.Workspaces.id])],"#typo3-topbar").then(async t=>{e.hideModal(),this.renderStageButtons((await t.resolve())[1].result),this.elements.$workspaceView.attr("src",this.elements.$workspaceView.attr("src"))})})},this.renderSendPageToStageWindow=e=>{const t=e.currentTarget,i=t.dataset.direction;let s;if("prev"===i)s="sendPageToPreviousStage";else{if("next"!==i)throw"Invalid direction "+i+" requested.";s="sendPageToNextStage"}this.sendRemoteRequest(this.generateRemoteActionsPayload(s,[TYPO3.settings.Workspaces.id]),"#typo3-topbar").then(async e=>{const i=await e.resolve(),s=this.renderSendToStageWindow(i);s.addEventListener("button.clicked",e=>{const n=e.target;if("ok"===n.name){const e=Utility.convertFormToObject(n.querySelector("form"));e.affects=i[0].result.affects,e.stageId=t.dataset.stageId,this.sendRemoteRequest([this.generateRemoteActionsPayload("sentCollectionToStage",[e]),this.generateRemoteActionsPayload("updateStageChangeButtons",[TYPO3.settings.Workspaces.id])],"#typo3-topbar").then(async e=>{s.hideModal(),this.renderStageButtons((await e.resolve())[1].result)})}})})},this.changePreviewMode=e=>{e.preventDefault();const t=$(e.currentTarget),i=this.elements.$activePreviewMode.data("activePreviewMode"),s=t.data("previewMode");this.elements.$activePreviewMode.text(t.text()).data("activePreviewMode",s),this.elements.$workspacePreview.parent().removeClass("preview-mode-"+i).addClass("preview-mode-"+s),"slider"===s?(this.elements.$stageSlider.parent().toggle(!0),this.resizeViews()):(this.elements.$stageSlider.parent().toggle(!1),"vbox"===s?this.elements.$liveView.height("100%"):this.elements.$liveView.height("50%"))},$(()=>{this.getElements(),this.resizeViews(),this.adjustPreviewModeSelectorWidth(),this.registerEvents()})}static getAvailableSpace(){return $(window).height()-$(Identifiers.topbar).outerHeight()}getElements(){this.elements.$liveView=$(Identifiers.liveView),this.elements.$workspacePanel=$(Identifiers.workspacePanel),this.elements.$stageSlider=$(Identifiers.stageSlider),this.elements.$workspaceView=$(Identifiers.workspaceView),this.elements.$stageButtonsContainer=$(Identifiers.stageButtonsContainer),this.elements.$previewModeContainer=$(Identifiers.previewModeContainer),this.elements.$activePreviewMode=$(Identifiers.activePreviewMode),this.elements.$workspacePreview=$(Identifiers.workspacePreview)}registerEvents(){new ThrottleEvent("resize",()=>{this.resizeViews()},50).bindTo(window),$(document).on("click",Identifiers.discardAction,this.renderDiscardWindow).on("click",Identifiers.sendToStageAction,this.renderSendPageToStageWindow).on("click",".t3js-workspace-recipients-selectall",()=>{$(".t3js-workspace-recipient",window.top.document).not(":disabled").prop("checked",!0)}).on("click",".t3js-workspace-recipients-deselectall",()=>{$(".t3js-workspace-recipient",window.top.document).not(":disabled").prop("checked",!1)}),new ThrottleEvent("input",this.updateSlidePosition,25).bindTo(document.querySelector(Identifiers.stageSlider)),this.elements.$previewModeContainer.find("[data-preview-mode]").on("click",this.changePreviewMode)}renderStageButtons(e){this.elements.$stageButtonsContainer.html(e)}resizeViews(){const e=Preview.getAvailableSpace(),t=-1*(this.currentSlidePosition-100),i=Math.round(Math.abs(e*t/100)),s=this.elements.$liveView.outerHeight()-this.elements.$liveView.height();this.elements.$workspacePreview.height(e),"slider"===this.elements.$activePreviewMode.data("activePreviewMode")&&this.elements.$liveView.height(i-s)}adjustPreviewModeSelectorWidth(){const e=this.elements.$previewModeContainer.find(".dropdown-menu");let t=0;e.addClass("show"),this.elements.$previewModeContainer.find("li > a > span").each((e,i)=>{const s=$(i).width();t<s&&(t=s)}),e.removeClass("show"),this.elements.$activePreviewMode.width(t)}}export default new Preview;