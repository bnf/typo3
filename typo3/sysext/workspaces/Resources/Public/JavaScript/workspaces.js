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
import e from"@typo3/core/ajax/ajax-request.js"
import{SeverityEnum as t}from"@typo3/backend/enum/severity.js"
import a from"nprogress"
import{default as o}from"@typo3/backend/modal.js"
import{html as n}from"lit"
export default class r{constructor(){this.tid=0}renderSendToStageWindow(e){const a=e[0].result,r=o.advanced({title:TYPO3.lang.actionSendToStage,content:n`<div class="modal-loading"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`,severity:t.info,buttons:[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{r.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-primary",name:"ok"}],callback:e=>{const t=e.ownerDocument.createElement("typo3-workspaces-send-to-stage-form")
t.data=a,t.TYPO3lang=TYPO3.lang,e.querySelector(".t3js-modal-body").replaceChildren(t)}})
return r}sendRemoteRequest(t,o="#workspace-content-wrapper"){return a.configure({parent:o,showSpinner:!1}),a.start(),new e(TYPO3.settings.ajaxUrls.workspace_dispatch).post(t,{headers:{"Content-Type":"application/json; charset=utf-8"}}).finally((()=>a.done()))}generateRemotePayload(e,t={}){return this.generateRemotePayloadBody("RemoteServer",e,t)}generateRemoteMassActionsPayload(e,t={}){return this.generateRemotePayloadBody("MassActions",e,t)}generateRemoteActionsPayload(e,t={}){return this.generateRemotePayloadBody("Actions",e,t)}generateRemotePayloadBody(e,t,a){return a instanceof Array?a.push(TYPO3.settings.Workspaces.token):a=[a,TYPO3.settings.Workspaces.token],{action:e,data:a,method:t,type:"rpc",tid:this.tid++}}}