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
import e from"@typo3/backend/link-browser.js";import t from"@typo3/core/event/regular-event.js";import{FileListActionEvent as n}from"@typo3/filelist/file-list-actions.js";import o from"@typo3/backend/info-window.js";import i from"@typo3/core/ajax/ajax-request.js";import s from"@typo3/backend/notification.js";export default new class{constructor(){new t("click",((t,n)=>{t.preventDefault(),e.finalizeFunction(n.dataset.linkbrowserLink)})).delegateTo(document,"[data-linkbrowser-link]"),new t(n.primary,(e=>{e.preventDefault();const t=e.detail;t.action=n.select,document.dispatchEvent(new CustomEvent(n.select,{detail:t}))})).bindTo(document),new t(n.select,(e=>{e.preventDefault();const t=e.detail.resources[0];"folder"===t.type&&this.insertLink(t)})).bindTo(document),new t(n.show,(e=>{e.preventDefault();const t=e.detail.resources[0];o.showItem("_"+t.type.toUpperCase(),t.identifier)})).bindTo(document)}insertLink(t){new i(TYPO3.settings.ajaxUrls.link_resource).post({identifier:t.identifier}).then((async t=>{const n=await t.resolve();n.status.forEach((e=>{s.showMessage(e.title,e.message,e.severity)})),n.success&&e.finalizeFunction(n.link)}))}};