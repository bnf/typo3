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
define(["TYPO3/CMS/Backend/Notification","TYPO3/CMS/Backend/Icons","TYPO3/CMS/Core/Event/RegularEvent","TYPO3/CMS/Core/Ajax/AjaxRequest"],(function(e,s,t,c){"use strict";var a;!function(e){e.clearCache=".t3js-clear-page-cache",e.icon=".t3js-icon"}(a||(a={}));class n{static setDisabled(e,s){e.disabled=s,e.classList.toggle("disabled",s)}static sendClearCacheRequest(s){const t=new c(TYPO3.settings.ajaxUrls.web_list_clearpagecache).withQueryArguments({id:s}).get({cache:"no-cache"});return t.then(async s=>{const t=await s.resolve();!0===t.success?e.success(t.title,t.message,1):e.error(t.title,t.message,1)},()=>{e.error("Clearing page caches went wrong on the server side.")}),t}constructor(){this.registerClickHandler()}registerClickHandler(){const e=document.querySelector(a.clearCache+":not([disabled])");null!==e&&new t("click",e=>{e.preventDefault();const t=e.currentTarget,c=parseInt(t.dataset.id,10);n.setDisabled(t,!0),s.getIcon("spinner-circle-dark",s.sizes.small,null,"disabled").then(e=>{t.querySelector(a.icon).outerHTML=e}),n.sendClearCacheRequest(c).finally(()=>{s.getIcon("actions-system-cache-clear",s.sizes.small).then(e=>{t.querySelector(a.icon).outerHTML=e}),n.setDisabled(t,!1)})}).bindTo(e)}}return new n}));