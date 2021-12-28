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
import $ from"jquery";import DataHandler from"TYPO3/CMS/Backend/AjaxDataHandler.esm.js";import Modal from"TYPO3/CMS/Backend/Modal.esm.js";import Severity from"TYPO3/CMS/Backend/Severity.esm.js";import"TYPO3/CMS/Backend/Element/IconElement.esm.js";import{SeverityEnum}from"TYPO3/CMS/Backend/Enum/Severity.esm.js";class Paste{constructor(){this.itemOnClipboardUid=0,this.itemOnClipboardTitle="",this.copyMode="",this.elementIdentifier=".t3js-page-ce",this.pasteAfterLinkTemplate="",this.pasteIntoLinkTemplate="",$(()=>{$(".t3js-page-columns").length&&(this.generateButtonTemplates(),this.activatePasteIcons(),this.initializeEvents())})}static determineColumn(t){const e=t.closest("[data-colpos]");return e.length&&"undefined"!==e.data("colpos")?e.data("colpos"):0}initializeEvents(){$(document).on("click",".t3js-paste",t=>{t.preventDefault(),this.activatePasteModal($(t.currentTarget))})}generateButtonTemplates(){var t,e;this.itemOnClipboardUid&&(this.pasteAfterLinkTemplate='<button type="button" class="t3js-paste t3js-paste'+(this.copyMode?"-"+this.copyMode:"")+' t3js-paste-after btn btn-default btn-sm" title="'+(null===(t=TYPO3.lang)||void 0===t?void 0:t.pasteAfterRecord)+'"><typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon></button>',this.pasteIntoLinkTemplate='<button type="button" class="t3js-paste t3js-paste'+(this.copyMode?"-"+this.copyMode:"")+' t3js-paste-into btn btn-default btn-sm" title="'+(null===(e=TYPO3.lang)||void 0===e?void 0:e.pasteIntoColumn)+'"><typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon></button>')}activatePasteIcons(){$(".t3-page-ce-wrapper-new-ce").each((t,e)=>{if(this.pasteAfterLinkTemplate&&this.pasteIntoLinkTemplate){$(e).parent().data("page")?$(e).append(this.pasteIntoLinkTemplate):$(e).append(this.pasteAfterLinkTemplate)}})}activatePasteModal(t){const e=(TYPO3.lang["paste.modal.title.paste"]||"Paste record")+': "'+this.itemOnClipboardTitle+'"',a=TYPO3.lang["paste.modal.paste"]||"Do you want to paste the record to this position?";let n=[];n=[{text:TYPO3.lang["paste.modal.button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",trigger:()=>{Modal.currentModal.trigger("modal-dismiss")}},{text:TYPO3.lang["paste.modal.button.paste"]||"Paste",btnClass:"btn-"+Severity.getCssClass(SeverityEnum.warning),trigger:()=>{Modal.currentModal.trigger("modal-dismiss"),this.execute(t)}}],Modal.show(e,a,SeverityEnum.warning,n)}execute(t){const e=Paste.determineColumn(t),a=t.closest(this.elementIdentifier),n=a.data("uid");let s;s=void 0===n?parseInt(a.data("page"),10):0-parseInt(n,10);const i={CB:{paste:"tt_content|"+s,pad:"normal",update:{colPos:e,sys_language_uid:parseInt(t.closest("[data-language-uid]").data("language-uid"),10)}}};DataHandler.process(i).then(t=>{t.hasErrors||window.location.reload()})}}export default new Paste;