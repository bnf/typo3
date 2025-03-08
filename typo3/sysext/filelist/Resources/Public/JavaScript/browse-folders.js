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
import e from"@typo3/backend/element-browser.js"
import t from"@typo3/core/event/regular-event.js"
import{FileListActionEvent as n,FileListActionSelector as o,FileListActionUtility as i}from"@typo3/filelist/file-list-actions.js"
import r from"@typo3/backend/info-window.js"
class c{constructor(){this.importSelection=t=>{t.preventDefault()
const n=t.detail.checkboxes
if(!n.length)return
const r=[]
n.forEach((e=>{if(e.checked){const t=e.closest(o.elementSelector),n=i.getResourceForElement(t)
"folder"===n.type&&n.identifier&&r.unshift(n)}})),r.length&&(r.forEach((function(e){c.insertElement(e.identifier)})),e.focusOpenerAndClose())},new t(n.primary,(e=>{e.preventDefault()
const t=e.detail
t.originalAction=n.primary,t.action=n.select,document.dispatchEvent(new CustomEvent(n.select,{detail:t}))})).bindTo(document),new t(n.select,(e=>{e.preventDefault()
const t=e.detail,o=t.resources[0]
"folder"===o.type&&c.insertElement(o.identifier,t.originalAction===n.primary)})).bindTo(document),new t(n.show,(e=>{e.preventDefault()
const t=e.detail.resources[0]
r.showItem("_"+t.type.toUpperCase(),t.identifier)})).bindTo(document),new t("multiRecordSelection:action:import",this.importSelection).bindTo(document)}static insertElement(t,n){return e.insertElement("",t,t,t,n)}}export default new c
