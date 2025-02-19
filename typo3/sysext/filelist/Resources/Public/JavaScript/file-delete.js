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
import{SeverityEnum as e}from"@typo3/backend/enum/severity.js";import t from"@typo3/core/event/regular-event.js";import o from"@typo3/core/document-service.js";import n from"@typo3/backend/modal.js";export default new class{constructor(){o.ready().then((()=>{new t("click",((t,o)=>{t.preventDefault();let a=o.dataset.redirectUrl;a=a?encodeURIComponent(a):encodeURIComponent(top.list_frame.document.location.pathname+top.list_frame.document.location.search);const l=o.dataset.filelistDeleteIdentifier,i=o.dataset.filelistDeleteType,r=o.dataset.filelistDeleteUrl+"&data[delete][0][data]="+encodeURIComponent(l)+"&data[delete][0][redirect]="+a;if(o.dataset.filelistDeleteCheck){const t=n.confirm(o.dataset.title,o.dataset.bsContent,e.warning,[{text:TYPO3.lang["buttons.confirm.delete_file.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm."+i+".yes"]||"Yes, delete this file or folder",btnClass:"btn-warning",name:"yes"}]);t.addEventListener("button.clicked",(e=>{const o=e.target.name;"no"===o?t.hideModal():"yes"===o&&(t.hideModal(),top.list_frame.location.href=r)}))}else top.list_frame.location.href=r})).delegateTo(document,'[data-filelist-delete="true"]')}))}};