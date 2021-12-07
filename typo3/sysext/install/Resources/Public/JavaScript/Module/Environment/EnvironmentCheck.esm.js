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
import"bootstrap";import $ from"jquery";import{AbstractInteractableModule}from"../AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import Notification from"TYPO3/CMS/Backend/Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import InfoBox from"../../Renderable/InfoBox";import ProgressBar from"../../Renderable/ProgressBar";import Severity from"../../Renderable/Severity";import Router from"../../Router";class EnvironmentCheck extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorGridderBadge=".t3js-environmentCheck-badge",this.selectorExecuteTrigger=".t3js-environmentCheck-execute",this.selectorOutputContainer=".t3js-environmentCheck-output"}initialize(e){this.currentModal=e,this.runTests(),e.on("click",this.selectorExecuteTrigger,e=>{e.preventDefault(),this.runTests()})}runTests(){this.setModalButtonsState(!1);const e=this.getModalBody(),t=$(this.selectorGridderBadge);t.text("").hide();const r=ProgressBar.render(Severity.loading,"Loading...","");e.find(this.selectorOutputContainer).empty().append(r),new AjaxRequest(Router.getUrl("environmentCheckGetStatus")).get({cache:"no-cache"}).then(async r=>{const o=await r.resolve();e.empty().append(o.html),Modal.setButtons(o.buttons);let s=0,n=0;!0===o.success&&"object"==typeof o.status?($.each(o.status,(t,r)=>{Array.isArray(r)&&r.length>0&&r.forEach(t=>{1===t.severity&&s++,2===t.severity&&n++;const r=InfoBox.render(t.severity,t.title,t.message);e.find(this.selectorOutputContainer).append(r)})}),n>0?t.removeClass("label-warning").addClass("label-danger").text(n).show():s>0&&t.removeClass("label-error").addClass("label-warning").text(s).show()):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{Router.handleAjaxError(t,e)})}}export default new EnvironmentCheck;