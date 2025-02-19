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
import e from"@typo3/backend/element-browser.js";import t from"@typo3/core/event/regular-event.js";import{FileListActionSelector as n,FileListActionUtility as o,FileListActionEvent as i}from"@typo3/filelist/file-list-actions.js";import r from"@typo3/backend/info-window.js";class c{constructor(){this.importSelection=t=>{t.preventDefault();const i=t.detail.checkboxes;if(!i.length)return;const r=[];i.forEach((e=>{if(e.checked){const t=e.closest(n.elementSelector),i=o.getResourceForElement(t);"folder"===i.type&&i.identifier&&r.unshift(i)}})),r.length&&(r.forEach((function(e){c.insertElement(e.identifier)})),e.focusOpenerAndClose())},new t(i.primary,(e=>{e.preventDefault();const t=e.detail;t.originalAction=i.primary,t.action=i.select,document.dispatchEvent(new CustomEvent(i.select,{detail:t}))})).bindTo(document),new t(i.select,(e=>{e.preventDefault();const t=e.detail,n=t.resources[0];"folder"===n.type&&c.insertElement(n.identifier,t.originalAction===i.primary)})).bindTo(document),new t(i.show,(e=>{e.preventDefault();const t=e.detail.resources[0];r.showItem("_"+t.type.toUpperCase(),t.identifier)})).bindTo(document),new t("multiRecordSelection:action:import",this.importSelection).bindTo(document)}static insertElement(t,n){return e.insertElement("",t,t,t,n)}}var s=new c;export{s as default};