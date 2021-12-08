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
import"bootstrap";import $ from"jquery";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import Notification from"TYPO3/CMS/Backend/Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import InfoBox from"TYPO3/CMS/Install/Renderable/InfoBox";import ProgressBar from"TYPO3/CMS/Install/Renderable/ProgressBar";import Severity from"TYPO3/CMS/Install/Renderable/Severity";import Router from"TYPO3/CMS/Install/Router";class FolderStructure extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorGridderBadge=".t3js-folderStructure-badge",this.selectorOutputContainer=".t3js-folderStructure-output",this.selectorErrorContainer=".t3js-folderStructure-errors",this.selectorErrorList=".t3js-folderStructure-errors-list",this.selectorErrorFixTrigger=".t3js-folderStructure-errors-fix",this.selectorOkContainer=".t3js-folderStructure-ok",this.selectorOkList=".t3js-folderStructure-ok-list",this.selectorPermissionContainer=".t3js-folderStructure-permissions"}static removeLoadingMessage(e){e.find(".alert-loading").remove()}initialize(e){this.currentModal=e,this.getStatus(),e.on("click",this.selectorErrorFixTrigger,e=>{e.preventDefault(),this.fix()})}getStatus(){const e=this.getModalBody(),t=$(this.selectorGridderBadge);t.text("").hide(),e.find(this.selectorOutputContainer).empty().append(ProgressBar.render(Severity.loading,"Loading...","")),new AjaxRequest(Router.getUrl("folderStructureGetStatus")).get({cache:"no-cache"}).then(async r=>{const o=await r.resolve();if(e.empty().append(o.html),Modal.setButtons(o.buttons),!0===o.success&&Array.isArray(o.errorStatus)){let r=0;o.errorStatus.length>0?(e.find(this.selectorErrorContainer).show(),e.find(this.selectorErrorList).empty(),o.errorStatus.forEach(o=>{r++,t.text(r).show();const s=InfoBox.render(o.severity,o.title,o.message);e.find(this.selectorErrorList).append(s)})):e.find(this.selectorErrorContainer).hide()}!0===o.success&&Array.isArray(o.okStatus)&&(o.okStatus.length>0?(e.find(this.selectorOkContainer).show(),e.find(this.selectorOkList).empty(),o.okStatus.forEach(t=>{const r=InfoBox.render(t.severity,t.title,t.message);e.find(this.selectorOkList).append(r)})):e.find(this.selectorOkContainer).hide());let s=o.folderStructureFilePermissionStatus;e.find(this.selectorPermissionContainer).empty().append(InfoBox.render(s.severity,s.title,s.message)),s=o.folderStructureDirectoryPermissionStatus,e.find(this.selectorPermissionContainer).append(InfoBox.render(s.severity,s.title,s.message))},t=>{Router.handleAjaxError(t,e)})}fix(){this.setModalButtonsState(!1);const e=this.getModalBody(),t=this.findInModal(this.selectorOutputContainer),r=ProgressBar.render(Severity.loading,"Loading...","");t.empty().html(r),new AjaxRequest(Router.getUrl("folderStructureFix")).get({cache:"no-cache"}).then(async e=>{const r=await e.resolve();FolderStructure.removeLoadingMessage(t),!0===r.success&&Array.isArray(r.fixedStatus)?(r.fixedStatus.length>0?r.fixedStatus.forEach(e=>{t.append(InfoBox.render(e.severity,e.title,e.message))}):t.append(InfoBox.render(Severity.warning,"Nothing fixed","")),this.getStatus()):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{Router.handleAjaxError(t,e)})}}export default new FolderStructure;