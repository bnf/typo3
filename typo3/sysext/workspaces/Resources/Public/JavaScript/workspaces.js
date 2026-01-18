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
import n from"@typo3/core/ajax/ajax-request.js";import{SeverityEnum as s}from"@typo3/backend/enum/severity.js";import"@typo3/backend/element/progress-bar-element.js";import l from"@typo3/backend/modal.js";import{html as i}from"lit";class c{ajaxRoute="workspace_dispatch";progressBar=null;renderSendToStageWindow(t){const e=t[0].result,a=l.advanced({title:TYPO3.lang.actionSendToStage,content:i`<div class=modal-loading><typo3-backend-spinner size=large></typo3-backend-spinner></div>`,severity:s.info,buttons:[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{a.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-primary",name:"ok"}],callback:o=>{const r=o.ownerDocument.createElement("typo3-workspaces-send-to-stage-form");r.data=e,r.TYPO3lang=TYPO3.lang,o.querySelector(".t3js-modal-body").replaceChildren(r)}});return a}sendRemoteRequest(t,e="#workspace-content-wrapper"){return this.progressBar=document.createElement("typo3-backend-progress-bar"),document.querySelector(e).prepend(this.progressBar),this.progressBar.start(),new n(TYPO3.settings.ajaxUrls[this.ajaxRoute]).post(t,{headers:{"Content-Type":"application/json; charset=utf-8"}}).finally(()=>{this.progressBar&&this.progressBar.done()})}generateRemotePayloadBody(t,e){return e instanceof Array||(e=[e]),{data:e,method:t}}}export{c as default};
