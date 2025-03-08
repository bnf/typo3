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
import e from"@typo3/core/document-service.js"
import t from"@typo3/backend/notification.js"
import o from"@typo3/core/event/regular-event.js"
import n from"@typo3/backend/sortable-table.js"
var c,l
!function(e){e.linktypesSelectorCheck='.t3js-linkvalidator-settings input[type="checkbox"].options-by-type-check',e.actionButtonSelectorCheck=".t3js-linkvalidator-action-button-check",e.toggleAllLinktypesSelectorReport='.t3js-linkvalidator-settings input[type="checkbox"].options-by-type-toggle-all-report',e.linktypesSelectorReport='.t3js-linkvalidator-settings input[type="checkbox"].options-by-type-report',e.actionButtonSelectorReport=".t3js-linkvalidator-action-button-report"}(c||(c={})),function(e){e.toggleAllLinktypesIdReport="options-by-type-toggle-all-report",e.brokenLinksTableIdReport="typo3-broken-links-table"}(l||(l={}))
class r{constructor(){e.ready().then((()=>{const e=document.getElementById(l.brokenLinksTableIdReport)
null!==e&&e instanceof HTMLTableElement&&new n(e)})),this.initializeEvents()}static allCheckBoxesAreChecked(e){const t=Array.from(e)
return e.length===t.filter((e=>e.checked)).length}toggleActionButtonReport(){document.querySelector(c.actionButtonSelectorReport)?.toggleAttribute("disabled",!document.querySelectorAll('input[type="checkbox"]:checked').length)}toggleTriggerCheckBoxReport(){const e=document.querySelectorAll(c.linktypesSelectorReport)
document.getElementById(l.toggleAllLinktypesIdReport).checked=r.allCheckBoxesAreChecked(e)}initializeEvents(){new o("change",((e,t)=>{const o=document.querySelectorAll(c.linktypesSelectorReport),n=!r.allCheckBoxesAreChecked(o)
o.forEach((e=>{e.checked=n})),t.checked=n,this.toggleActionButtonReport()})).delegateTo(document,c.toggleAllLinktypesSelectorReport),new o("change",(()=>{this.toggleTriggerCheckBoxReport(),this.toggleActionButtonReport()})).delegateTo(document,c.linktypesSelectorReport),new o("click",((e,o)=>{t.success(o.dataset.notificationMessage||"Event triggered","",2)})).delegateTo(document,c.actionButtonSelectorCheck),new o("click",((e,o)=>{t.success(o.dataset.notificationMessage||"Event triggered","",2)})).delegateTo(document,c.actionButtonSelectorReport)}}export default new r
