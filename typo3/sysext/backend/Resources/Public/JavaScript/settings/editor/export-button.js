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
import DocumentService from"@typo3/core/document-service.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{copyToClipboard}from"@typo3/backend/copy-to-clipboard.js";import Notification from"@typo3/backend/notification.js";import{lll}from"@typo3/core/lit-helper.js";class ExportButton{constructor(){this.registerEvents()}async registerEvents(){await DocumentService.ready(),document.querySelectorAll(".t3js-sitesettings-export").forEach((t=>t.addEventListener("click",(async e=>{const o=document.getElementsByName(t.dataset.form)[0]||null;if(!o)return;e.preventDefault();const r=new FormData(o),a=await new AjaxRequest(t.getAttribute("href")).post(r),i=await a.resolve();"string"==typeof i.yaml?copyToClipboard(i.yaml):(console.warn("Value can not be copied to clipboard.",typeof i.yaml),Notification.error(lll("copyToClipboard.error")))}))))}}export default new ExportButton;