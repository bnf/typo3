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
define(["TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","../PasswordStrength","../AbstractInteractableModule"],(function(s,t,e,a,o,n){"use strict";class l extends n.AbstractInteractableModule{constructor(){super(...arguments),this.selectorChangeButton=".t3js-changeInstallToolPassword-change"}initialize(s){this.currentModal=s,this.getData(),s.on("click",this.selectorChangeButton,s=>{s.preventDefault(),this.change()}),s.on("click",".t3-install-form-password-strength",()=>{o.initialize(".t3-install-form-password-strength")})}getData(){const o=this.getModalBody();new e(a.getUrl("changeInstallToolPasswordGetData")).get({cache:"no-cache"}).then(async e=>{const a=await e.resolve();!0===a.success?(o.empty().append(a.html),s.setButtons(a.buttons)):t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},s=>{a.handleAjaxError(s,o)})}change(){this.setModalButtonsState(!1);const s=this.getModalBody(),o=this.getModuleContent().data("install-tool-token");new e(a.getUrl()).post({install:{action:"changeInstallToolPassword",token:o,password:this.findInModal(".t3js-changeInstallToolPassword-password").val(),passwordCheck:this.findInModal(".t3js-changeInstallToolPassword-password-check").val()}}).then(async s=>{const e=await s.resolve();!0===e.success&&Array.isArray(e.status)?e.status.forEach(s=>{t.showMessage(s.title,s.message,s.severity)}):t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{a.handleAjaxError(t,s)}).finally(()=>{this.findInModal(".t3js-changeInstallToolPassword-password,.t3js-changeInstallToolPassword-password-check").val(""),this.setModalButtonsState(!0)})}}return new l}));