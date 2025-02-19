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
import e from"@typo3/core/ajax/ajax-request.js";import t from"@typo3/backend/icons.js";import o from"@typo3/backend/notification.js";import r from"@typo3/backend/viewport.js";import c from"@typo3/core/event/regular-event.js";var n;!function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-clearcachetoolbaritem",e.menuItemSelector=".t3js-toolbar-cache-flush-action",e.toolbarIconSelector=".toolbar-item-icon .t3js-icon"}(n||(n={}));export default new class{constructor(){this.initializeEvents=()=>{const e=document.querySelector(n.containerSelector);new c("click",((e,t)=>{e.preventDefault(),t.href&&this.clearCache(t.href)})).delegateTo(e,n.menuItemSelector)},r.Topbar.Toolbar.registerEvent(this.initializeEvents)}clearCache(r){const c=document.querySelector(n.containerSelector);c.classList.remove("open");const a=c.querySelector(n.toolbarIconSelector),s=a.cloneNode(!0);t.getIcon("spinner-circle",t.sizes.small).then((e=>{a.replaceWith(document.createRange().createContextualFragment(e))})),new e(r).post({}).then((async e=>{const t=await e.resolve();!0===t.success?o.success(t.title,t.message):!1===t.success&&o.error(t.title,t.message)}),(()=>{o.error(TYPO3.lang["flushCaches.error"],TYPO3.lang["flushCaches.error.description"])})).finally((()=>{c.querySelector(n.toolbarIconSelector).replaceWith(s)}))}};