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
import Modal from"TYPO3/CMS/Backend/Modal.esm.js";import Notification from"TYPO3/CMS/Backend/Notification.esm.js";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.esm.js";import Router from"TYPO3/CMS/Install/Router.esm.js";import PasswordStrength from"TYPO3/CMS/Install/Module/PasswordStrength.esm.js";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule.esm.js";class ChangeInstallToolPassword extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorChangeButton=".t3js-changeInstallToolPassword-change"}initialize(t){this.currentModal=t,this.getData(),t.on("click",this.selectorChangeButton,t=>{t.preventDefault(),this.change()}),t.on("click",".t3-install-form-password-strength",()=>{PasswordStrength.initialize(".t3-install-form-password-strength")})}getData(){const t=this.getModalBody();new AjaxRequest(Router.getUrl("changeInstallToolPasswordGetData")).get({cache:"no-cache"}).then(async s=>{const e=await s.resolve();!0===e.success?(t.empty().append(e.html),Modal.setButtons(e.buttons)):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},s=>{Router.handleAjaxError(s,t)})}change(){this.setModalButtonsState(!1);const t=this.getModalBody(),s=this.getModuleContent().data("install-tool-token");new AjaxRequest(Router.getUrl()).post({install:{action:"changeInstallToolPassword",token:s,password:this.findInModal(".t3js-changeInstallToolPassword-password").val(),passwordCheck:this.findInModal(".t3js-changeInstallToolPassword-password-check").val()}}).then(async t=>{const s=await t.resolve();!0===s.success&&Array.isArray(s.status)?s.status.forEach(t=>{Notification.showMessage(t.title,t.message,t.severity)}):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},s=>{Router.handleAjaxError(s,t)}).finally(()=>{this.findInModal(".t3js-changeInstallToolPassword-password,.t3js-changeInstallToolPassword-password-check").val(""),this.setModalButtonsState(!0)})}}export default new ChangeInstallToolPassword;