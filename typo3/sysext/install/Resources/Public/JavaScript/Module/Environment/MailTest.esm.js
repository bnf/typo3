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
import"bootstrap";import{AbstractInteractableModule}from"../AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import Notification from"TYPO3/CMS/Backend/Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import InfoBox from"../../Renderable/InfoBox";import ProgressBar from"../../Renderable/ProgressBar";import Severity from"../../Renderable/Severity";import Router from"../../Router";class MailTest extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorOutputContainer=".t3js-mailTest-output",this.selectorMailTestButton=".t3js-mailTest-execute"}initialize(t){this.currentModal=t,this.getData(),t.on("click",this.selectorMailTestButton,t=>{t.preventDefault(),this.send()}),t.on("submit","form",t=>{t.preventDefault(),this.send()})}getData(){const t=this.getModalBody();new AjaxRequest(Router.getUrl("mailTestGetData")).get({cache:"no-cache"}).then(async e=>{const o=await e.resolve();!0===o.success?(t.empty().append(o.html),Modal.setButtons(o.buttons)):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{Router.handleAjaxError(e,t)})}send(){this.setModalButtonsState(!1);const t=this.getModuleContent().data("mail-test-token"),e=this.findInModal(this.selectorOutputContainer),o=ProgressBar.render(Severity.loading,"Loading...","");e.empty().html(o),new AjaxRequest(Router.getUrl()).post({install:{action:"mailTest",token:t,email:this.findInModal(".t3js-mailTest-email").val()}}).then(async t=>{const o=await t.resolve();e.empty(),Array.isArray(o.status)?o.status.forEach(t=>{const o=InfoBox.render(t.severity,t.title,t.message);e.html(o)}):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},()=>{Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}).finally(()=>{this.setModalButtonsState(!0)})}}export default new MailTest;