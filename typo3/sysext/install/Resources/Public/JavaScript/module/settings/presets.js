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
import"bootstrap"
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js"
import t from"@typo3/backend/modal.js"
import s from"@typo3/backend/notification.js"
import o from"@typo3/core/ajax/ajax-request.js"
import a from"@typo3/install/router.js"
import n from"@typo3/core/event/regular-event.js"
var r
!function(e){e.activateTrigger=".t3js-presets-activate",e.imageExecutable=".t3js-presets-image-executable",e.imageExecutableTrigger=".t3js-presets-image-executable-trigger"}(r||(r={}))
export default new class extends e{initialize(e){super.initialize(e),this.getContent(),new n("click",(e=>{e.preventDefault(),this.getCustomImagePathContent()})).delegateTo(e,r.imageExecutableTrigger),new n("click",(e=>{e.preventDefault(),this.activate()})).delegateTo(e,r.activateTrigger),e.querySelectorAll(".t3js-custom-preset").forEach((t=>{new n("input",((t,s)=>{e.querySelector(`#${s.dataset.radio}`).checked=!0})).delegateTo(t,".t3js-custom-preset")}))}getContent(){const e=this.getModalBody()
new o(a.getUrl("presetsGetContent")).get({cache:"no-cache"}).then((async o=>{const a=await o.resolve()
!0===a.success&&"undefined"!==a.html&&a.html.length>0?(e.innerHTML=a.html,t.setButtons(a.buttons)):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)}))}getCustomImagePathContent(){const e=this.getModalBody(),t=this.getModuleContent().dataset.presetsContentToken
new o(a.getUrl()).post({install:{token:t,action:"presetsGetContent",values:{Image:{additionalSearchPath:this.findInModal(r.imageExecutable).value}}}}).then((async t=>{const o=await t.resolve()
!0===o.success&&"undefined"!==o.html&&o.html.length>0?e.innerHTML=o.html:s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)}))}activate(){this.setModalButtonsState(!1)
const e=this.getModalBody(),t=this.getModuleContent().dataset.presetsActivateToken,n={},r=new FormData(this.findInModal("form"))
for(const[name,value]of r)n[name]=value.toString()
n["install[action]"]="presetsActivate",n["install[token]"]=t,new o(a.getUrl()).post(n).then((async e=>{const t=await e.resolve()
!0===t.success&&Array.isArray(t.status)?t.status.forEach((e=>{s.showMessage(e.title,e.message,e.severity)})):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)})).finally((()=>{this.setModalButtonsState(!0)}))}}
