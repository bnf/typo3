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
import n from"@typo3/core/ajax/ajax-request.js"
import{InfoBox as o}from"@typo3/install/renderable/info-box.js"
import r from"@typo3/install/renderable/severity.js"
import a from"@typo3/install/router.js"
import i from"@typo3/core/event/regular-event.js"
var c
!function(e){e.executeTrigger=".t3js-imageProcessing-execute",e.testContainer=".t3js-imageProcessing-twinContainer",e.twinImageTemplate="#t3js-imageProcessing-twinImage-template",e.commandContainer=".t3js-imageProcessing-command",e.commandText=".t3js-imageProcessing-command-text",e.twinImages=".t3js-imageProcessing-images"}(c||(c={}))
export default new class extends e{initialize(e){super.initialize(e),this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js").then((()=>{this.getData()})),new i("click",(e=>{e.preventDefault(),this.runTests()})).delegateTo(e,c.executeTrigger)}getData(){const e=this.getModalBody()
new n(a.getUrl("imageProcessingGetData")).get({cache:"no-cache"}).then((async n=>{const o=await n.resolve()
!0===o.success?(e.innerHTML=o.html,t.setButtons(o.buttons),this.runTests()):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(t=>{a.handleAjaxError(t,e)}))}runTests(){const e=this.getModalBody()
this.setModalButtonsState(!1)
const t=this.findInModal(c.twinImageTemplate),s=[]
e.querySelectorAll(c.testContainer).forEach((i=>{i.replaceChildren(o.create(r.loading,"Loading..."))
const l=new n(a.getUrl(i.dataset.test)).get({cache:"no-cache"}).then((async e=>{const s=await e.resolve()
if(!0===s.success){i.innerHTML="",Array.isArray(s.status)&&s.status.forEach((e=>{i.append(o.create(e.severity,e.title,e.message))}))
const n=t.content.cloneNode(!0)
if(!0===s.fileExists&&(n.querySelector("img.reference")?.setAttribute("src",s.referenceFile),n.querySelector("img.result")?.setAttribute("src",s.outputFile),n.querySelectorAll(c.twinImages).forEach((e=>e.hidden=!1))),Array.isArray(s.command)&&s.command.length>0){const r=n.querySelector(c.commandContainer)
null!==r&&(r.hidden=!1)
const a=[]
s.command.forEach((e=>{a.push("<strong>Command:</strong>\n"+e[1]),3===e.length&&a.push("<strong>Result:</strong>\n"+e[2])}))
const l=n.querySelector(c.commandText)
null!==l&&(l.innerHTML=a.join("\n"))}i.append(n)}}),(t=>{a.handleAjaxError(t,e)}))
s.push(l)})),Promise.all(s).then((()=>{this.setModalButtonsState(!0)}))}}
