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
import e from"@typo3/backend/notification.js";import t from"@typo3/backend/icons.js";import s from"@typo3/core/event/regular-event.js";import a from"@typo3/core/ajax/ajax-request.js";var r;!function(e){e.clearCache=".t3js-clear-page-cache",e.icon=".t3js-icon"}(r||(r={}));class c{constructor(){this.registerClickHandler()}static setDisabled(e,t){e.disabled=t,e.classList.toggle("disabled",t)}static sendClearCacheRequest(t){const s=new a(TYPO3.settings.ajaxUrls.web_list_clearpagecache).withQueryArguments({id:t}).get({cache:"no-cache"});return s.then((async t=>{const s=await t.resolve();!0===s.success?e.success(s.title,s.message,1):e.error(s.title,s.message,1)}),(()=>{e.error("Clearing page caches went wrong on the server side.")})),s}registerClickHandler(){const e=document.querySelector(`${r.clearCache}:not([disabled])`);null!==e&&new s("click",(e=>{e.preventDefault();const s=e.currentTarget,a=parseInt(s.dataset.id,10);c.setDisabled(s,!0),t.getIcon("spinner-circle",t.sizes.small,null,"disabled").then((e=>{s.querySelector(r.icon).outerHTML=e})),c.sendClearCacheRequest(a).finally((()=>{t.getIcon("actions-system-cache-clear",t.sizes.small).then((e=>{s.querySelector(r.icon).outerHTML=e})),c.setDisabled(s,!1)}))})).bindTo(e)}}var n=new c;export{n as default};