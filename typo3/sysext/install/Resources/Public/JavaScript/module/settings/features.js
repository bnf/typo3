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
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/modal.js"
import s from"@typo3/backend/notification.js"
import o from"@typo3/core/ajax/ajax-request.js"
import a from"@typo3/install/router.js"
import n from"@typo3/core/event/regular-event.js"
var r
!function(e){e.saveTrigger=".t3js-features-save"}(r||(r={}))
export default new class extends e{initialize(e){super.initialize(e),this.getContent(),new n("click",(e=>{e.preventDefault(),this.save()})).delegateTo(e,r.saveTrigger)}getContent(){const e=this.getModalBody()
new o(a.getUrl("featuresGetContent")).get({cache:"no-cache"}).then((async o=>{const a=await o.resolve()
!0===a.success&&"undefined"!==a.html&&a.html.length>0?(e.innerHTML=a.html,t.setButtons(a.buttons)):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)}))}save(){this.setModalButtonsState(!1)
const e=this.getModalBody(),t=this.getModuleContent().dataset.featuresSaveToken,n={},r=new FormData(this.findInModal("form"))
for(const[e,t]of r)n[e]=t.toString()
n["install[action]"]="featuresSave",n["install[token]"]=t,new o(a.getUrl()).post(n).then((async e=>{const t=await e.resolve()
!0===t.success&&Array.isArray(t.status)?(t.status.forEach((e=>{s.showMessage(e.title,e.message,e.severity)})),this.getContent()):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)})).finally((()=>{this.setModalButtonsState(!0)}))}}
