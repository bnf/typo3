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
import o from"@typo3/backend/notification.js"
import s from"@typo3/core/ajax/ajax-request.js"
import{InfoBox as r}from"@typo3/install/renderable/info-box.js"
import n from"@typo3/install/router.js"
import a from"@typo3/core/event/regular-event.js"
var i
!function(e){e.executeTrigger=".t3js-environmentCheck-execute",e.outputContainer=".t3js-environmentCheck-output"}(i||(i={}))
export default new class extends e{initialize(e){super.initialize(e),this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js").then((()=>{this.runTests()})),new a("click",(e=>{e.preventDefault(),this.runTests()})).delegateTo(e,i.executeTrigger)}runTests(){this.setModalButtonsState(!1)
const e=this.getModalBody(),a=e.querySelector(i.outputContainer)
null!==a&&this.renderProgressBar(a),new s(n.getUrl("environmentCheckGetStatus")).get({cache:"no-cache"}).then((async s=>{const n=await s.resolve()
if(e.innerHTML=n.html,t.setButtons(n.buttons),!0===n.success&&"object"==typeof n.status)for(const a of Object.values(n.status))for(const l of a)e.querySelector(i.outputContainer).append(r.create(l.severity,l.title,l.message))
else o.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{n.handleAjaxError(t,e)})).finally((()=>{this.setModalButtonsState(!0)}))}}
