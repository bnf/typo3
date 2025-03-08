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
import e from"@typo3/core/event/regular-event.js"
import t from"@typo3/core/document-service.js"
import o from"@typo3/backend/ajax-data-handler.js"
import a from"@typo3/backend/modal.js"
import i from"@typo3/backend/module-menu.js"
import n from"@typo3/backend/notification.js"
import s from"@typo3/backend/action-button/immediate-action.js"
import{lll as r}from"@typo3/core/lit-helper.js"
export class MovePage{constructor(){this.initialize()}async initialize(){await t.ready(),this.registerEvents(document.querySelector(".element-browser-body"))}registerEvents(t){const c=document.querySelector("#elementRecordTitle").value,m=new URL(window.location.href)
new e("click",(async(e,t)=>{const p=document.querySelector("#makeCopy").checked,d=p?"copy":"move",l={cmd:{[m.searchParams.get("table")]:{[m.searchParams.get("uid")]:{[d]:t.dataset.position}}}}
o.process(l).then((()=>{a.dismiss(),n.success(r(p?"movePage.notification.pageCopied.title":"movePage.notification.pageMoved.title"),r(p?"movePage.notification.pageCopied.message":"movePage.notification.pageMoved.message",c),10,[{label:r("movePage.notification.pagePasted.action.dismiss")},{label:r("movePage.notification.pagePasted.action.open",c),action:new s((()=>{i.App.showModule("web_list","id="+m.searchParams.get("uid"))}))}]),top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh")),i.App.showModule("web_list","id="+m.searchParams.get("expandPage"))}))})).delegateTo(t,'[data-action="paste"]')}}