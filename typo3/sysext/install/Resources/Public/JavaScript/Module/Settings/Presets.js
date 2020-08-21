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
define(["jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","bootstrap"],(function(e,t,s,a,n,o){"use strict";class r extends t.AbstractInteractableModule{constructor(){super(...arguments),this.selectorActivateTrigger=".t3js-presets-activate",this.selectorImageExecutable=".t3js-presets-image-executable",this.selectorImageExecutableTrigger=".t3js-presets-image-executable-trigger"}initialize(t){this.currentModal=t,this.getContent(),t.on("click",this.selectorImageExecutableTrigger,e=>{e.preventDefault(),this.getCustomImagePathContent()}),t.on("click",this.selectorActivateTrigger,e=>{e.preventDefault(),this.activate()}),t.find(".t3js-custom-preset").on("input",".t3js-custom-preset",t=>{e("#"+e(t.currentTarget).data("radio")).prop("checked",!0)})}getContent(){const e=this.getModalBody();new n(o.getUrl("presetsGetContent")).get({cache:"no-cache"}).then(async t=>{const n=await t.resolve();!0===n.success&&"undefined"!==n.html&&n.html.length>0?(e.empty().append(n.html),s.setButtons(n.buttons)):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{o.handleAjaxError(t,e)})}getCustomImagePathContent(){const e=this.getModalBody(),t=this.getModuleContent().data("presets-content-token");new n(o.getUrl()).post({install:{token:t,action:"presetsGetContent",values:{Image:{additionalSearchPath:this.findInModal(this.selectorImageExecutable).val()}}}}).then(async t=>{const s=await t.resolve();!0===s.success&&"undefined"!==s.html&&s.html.length>0?e.empty().append(s.html):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{o.handleAjaxError(t,e)})}activate(){this.setModalButtonsState(!1);const t=this.getModalBody(),s=this.getModuleContent().data("presets-activate-token"),r={};e(this.findInModal("form").serializeArray()).each((e,t)=>{r[t.name]=t.value}),r["install[action]"]="presetsActivate",r["install[token]"]=s,new n(o.getUrl()).post(r).then(async e=>{const t=await e.resolve();!0===t.success&&Array.isArray(t.status)?t.status.forEach(e=>{a.showMessage(e.title,e.message,e.severity)}):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{o.handleAjaxError(e,t)}).finally(()=>{this.setModalButtonsState(!0)})}}return new r}));