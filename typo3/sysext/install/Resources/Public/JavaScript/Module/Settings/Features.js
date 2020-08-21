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
define(["jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router"],(function(e,t,s,a,n,o){"use strict";class r extends t.AbstractInteractableModule{constructor(){super(...arguments),this.selectorSaveTrigger=".t3js-features-save"}initialize(e){this.currentModal=e,this.getContent(),e.on("click",this.selectorSaveTrigger,e=>{e.preventDefault(),this.save()})}getContent(){const e=this.getModalBody();new n(o.getUrl("featuresGetContent")).get({cache:"no-cache"}).then(async t=>{const n=await t.resolve();!0===n.success&&"undefined"!==n.html&&n.html.length>0?(e.empty().append(n.html),s.setButtons(n.buttons)):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{o.handleAjaxError(t,e)})}save(){this.setModalButtonsState(!1);const t=this.getModalBody(),s=this.getModuleContent().data("features-save-token"),r={};e(this.findInModal("form").serializeArray()).each((e,t)=>{r[t.name]=t.value}),r["install[action]"]="featuresSave",r["install[token]"]=s,new n(o.getUrl()).post(r).then(async e=>{const t=await e.resolve();!0===t.success&&Array.isArray(t.status)?(t.status.forEach(e=>{a.showMessage(e.title,e.message,e.severity)}),this.getContent()):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{o.handleAjaxError(e,t)})}}return new r}));