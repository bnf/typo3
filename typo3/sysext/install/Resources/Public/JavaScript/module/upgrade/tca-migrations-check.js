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
import o from"@typo3/core/ajax/ajax-request.js"
import{FlashMessage as r}from"@typo3/install/renderable/flash-message.js"
import{InfoBox as a}from"@typo3/install/renderable/info-box.js"
import n from"@typo3/install/renderable/severity.js"
import s from"@typo3/install/router.js"
import i from"@typo3/core/event/regular-event.js"
var l
!function(e){e.checkTrigger=".t3js-tcaMigrationsCheck-check",e.outputContainer=".t3js-tcaMigrationsCheck-output"}(l||(l={}))
export default new class extends e{initialize(e){super.initialize(e),Promise.all([this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js"),this.loadModuleFrameAgnostic("@typo3/install/renderable/flash-message.js")]).then((()=>{this.check()})),new i("click",(e=>{e.preventDefault(),this.check()})).delegateTo(e,l.checkTrigger)}check(){this.setModalButtonsState(!1)
const e=document.querySelector(l.outputContainer)
null!==e&&this.renderProgressBar(e,{},"append")
const i=this.getModalBody()
new o(s.getUrl("tcaMigrationsCheck")).get({cache:"no-cache"}).then((async e=>{const o=await e.resolve()
i.innerHTML=o.html,t.setButtons(o.buttons),!0===o.success&&Array.isArray(o.status)?o.status.length>0?(i.querySelector(l.outputContainer).append(a.create(n.warning,"TCA migrations need to be applied","Check the following list and apply needed changes.")),o.status.forEach((e=>{i.querySelector(l.outputContainer).append(a.create(e.severity,e.title,e.message))}))):i.querySelector(l.outputContainer).append(a.create(n.ok,"No TCA migrations need to be applied","Your TCA looks good.")):i.querySelector(l.outputContainer).append(r.create(n.error,"Something went wrong",'Use "Check for broken extensions"'))}),(e=>{s.handleAjaxError(e,i)})).finally((()=>{this.setModalButtonsState(!0)}))}}
