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
import{SeverityEnum}from"@typo3/Backend/Enum/Severity.js";import $ from"jquery";import AjaxDataHandler from"@typo3/Backend/AjaxDataHandler.js";import AjaxRequest from"@typo3/core/Ajax/AjaxRequest.js";import InfoWindow from"@typo3/Backend/InfoWindow.js";import Modal from"@typo3/Backend/Modal.js";import ModuleMenu from"@typo3/Backend/ModuleMenu.js";import Notification from"@typo3/backend/Notification.js";import Viewport from"@typo3/Backend/Viewport.js";import{ModuleStateStorage}from"@typo3/Backend/Storage/ModuleStateStorage.js";import{NewContentElementWizard}from"@typo3/backend/NewContentElementWizard.js";class ContextMenuActions{static getReturnUrl(){return encodeURIComponent(top.list_frame.document.location.pathname+top.list_frame.document.location.search)}static editRecord(t,e){let n="",o=$(this).data("pages-language-uid");o&&(n="&overrideVals[pages][sys_language_uid]="+o),Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl+"&edit["+t+"]["+e+"]=edit"+n+"&returnUrl="+ContextMenuActions.getReturnUrl())}static viewRecord(){const t=$(this).data("preview-url");if(t){window.open(t,"newTYPO3frontendWindow").focus()}}static openInfoPopUp(t,e){InfoWindow.showItem(t,e)}static mountAsTreeRoot(t,e){if("pages"===t){const t=new CustomEvent("typo3:pagetree:mountPoint",{detail:{pageId:e}});top.document.dispatchEvent(t)}}static newPageWizard(t,e){const n=$(this).data("pages-new-wizard-url");Viewport.ContentContainer.setUrl(n+"&returnUrl="+ContextMenuActions.getReturnUrl())}static newContentWizard(){const t=$(this);let e=t.data("new-wizard-url");e&&(e+="&returnUrl="+ContextMenuActions.getReturnUrl(),Modal.advanced({title:t.data("title"),type:Modal.types.ajax,size:Modal.sizes.medium,content:e,severity:SeverityEnum.notice,ajaxCallback:()=>{const t=Modal.currentModal.get(0);t&&t.querySelector(".t3-new-content-element-wizard-inner")&&new NewContentElementWizard(t)}}))}static newRecord(t,e){Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl+"&edit["+t+"]["+("pages"!==t?"-":"")+e+"]=new&returnUrl="+ContextMenuActions.getReturnUrl())}static openHistoryPopUp(t,e){Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordHistory.moduleUrl+"&element="+t+":"+e+"&returnUrl="+ContextMenuActions.getReturnUrl())}static openListModule(t,e){const n="pages"===t?e:$(this).data("page-uid");ModuleMenu.App.showModule("web_list","id="+n)}static pagesSort(){const t=$(this).data("pages-sort-url");t&&Viewport.ContentContainer.setUrl(t)}static pagesNewMultiple(){const t=$(this).data("pages-new-multiple-url");t&&Viewport.ContentContainer.setUrl(t)}static disableRecord(t,e){const n=$(this).data("disable-field")||"hidden";Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl+"&data["+t+"]["+e+"]["+n+"]=1&redirect="+ContextMenuActions.getReturnUrl()).done(()=>{ContextMenuActions.refreshPageTree()})}static enableRecord(t,e){const n=$(this).data("disable-field")||"hidden";Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl+"&data["+t+"]["+e+"]["+n+"]=0&redirect="+ContextMenuActions.getReturnUrl()).done(()=>{ContextMenuActions.refreshPageTree()})}static showInMenus(t,e){Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl+"&data["+t+"]["+e+"][nav_hide]=0&redirect="+ContextMenuActions.getReturnUrl()).done(()=>{ContextMenuActions.refreshPageTree()})}static hideInMenus(t,e){Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl+"&data["+t+"]["+e+"][nav_hide]=1&redirect="+ContextMenuActions.getReturnUrl()).done(()=>{ContextMenuActions.refreshPageTree()})}static deleteRecord(t,e){const n=$(this);Modal.confirm(n.data("title"),n.data("message"),SeverityEnum.warning,[{text:$(this).data("button-close-text")||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:$(this).data("button-ok-text")||TYPO3.lang["button.delete"]||"Delete",btnClass:"btn-warning",name:"delete"}]).on("button.clicked",n=>{if("delete"===n.target.getAttribute("name")){const n={component:"contextmenu",action:"delete",table:t,uid:e};AjaxDataHandler.process("cmd["+t+"]["+e+"][delete]=1",n).then(()=>{"pages"===t?(ModuleStateStorage.current("web").identifier===e.toString()&&top.document.dispatchEvent(new CustomEvent("typo3:pagetree:selectFirstNode")),ContextMenuActions.refreshPageTree()):"tt_content"===t&&Viewport.ContentContainer.refresh()})}Modal.dismiss()})}static copy(t,e){const n=TYPO3.settings.ajaxUrls.contextmenu_clipboard+"&CB[el]["+t+"%7C"+e+"]=1&CB[setCopyMode]=1";new AjaxRequest(n).get().finally(()=>{ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href)})}static clipboardRelease(t,e){const n=TYPO3.settings.ajaxUrls.contextmenu_clipboard+"&CB[el]["+t+"%7C"+e+"]=0";new AjaxRequest(n).get().finally(()=>{ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href)})}static cut(t,e){const n=TYPO3.settings.ajaxUrls.contextmenu_clipboard+"&CB[el]["+t+"%7C"+e+"]=1&CB[setCopyMode]=0";new AjaxRequest(n).get().finally(()=>{ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href)})}static triggerRefresh(t){t.includes("record%2Fedit")||Viewport.ContentContainer.refresh()}static clearCache(t,e){new AjaxRequest(TYPO3.settings.ajaxUrls.web_list_clearpagecache).withQueryArguments({id:e}).get({cache:"no-cache"}).then(async t=>{const e=await t.resolve();!0===e.success?Notification.success(e.title,e.message,1):Notification.error(e.title,e.message,1)},()=>{Notification.error("Clearing page caches went wrong on the server side.")})}static pasteAfter(t,e){ContextMenuActions.pasteInto.bind($(this))(t,-e)}static pasteInto(t,e){const n=$(this),o=()=>{const n="&CB[paste]="+t+"%7C"+e+"&CB[pad]=normal&redirect="+ContextMenuActions.getReturnUrl();Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl+n).done(()=>{"pages"===t&&ContextMenuActions.refreshPageTree()})};if(!n.data("title"))return void o();Modal.confirm(n.data("title"),n.data("message"),SeverityEnum.warning,[{text:$(this).data("button-close-text")||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:$(this).data("button-ok-text")||TYPO3.lang["button.ok"]||"OK",btnClass:"btn-warning",name:"ok"}]).on("button.clicked",t=>{"ok"===t.target.getAttribute("name")&&o(),Modal.dismiss()})}static refreshPageTree(){top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}}export default ContextMenuActions;