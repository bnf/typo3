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
import l from"@typo3/backend/element-browser.js";import r from"@typo3/core/event/regular-event.js";import{FileListActionEvent as i,FileListActionSelector as a,FileListActionUtility as d}from"@typo3/filelist/file-list-actions.js";import u from"@typo3/backend/info-window.js";class c{constructor(){new r(i.primary,e=>{e.preventDefault();const t=e.detail;t.originalAction=i.primary,t.action=i.select,document.dispatchEvent(new CustomEvent(i.select,{detail:t}))}).bindTo(document),new r(i.select,e=>{e.preventDefault();const t=e.detail,o=t.resources[0];o.type==="folder"&&c.insertElement(o.identifier,t.originalAction===i.primary)}).bindTo(document),new r(i.show,e=>{e.preventDefault();const o=e.detail.resources[0];u.showItem("_"+o.type.toUpperCase(),o.identifier)}).bindTo(document),new r("multiRecordSelection:action:import",this.importSelection).bindTo(document)}static insertElement(e,t){return l.insertElement("",e,e,e,t)}importSelection=e=>{e.preventDefault();const t=e.detail.checkboxes;if(!t.length)return;const o=[];t.forEach(n=>{if(n.checked){const m=n.closest(a.elementSelector),s=d.getResourceForElement(m);s.type==="folder"&&s.identifier&&o.unshift(s)}}),o.length&&(o.forEach(function(n){c.insertElement(n.identifier)}),l.focusOpenerAndClose())}}var f=new c;export{f as default};
