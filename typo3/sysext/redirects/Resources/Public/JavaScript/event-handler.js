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
import t from"@typo3/core/ajax/ajax-request.js";import e from"@typo3/backend/notification.js";import r from"@typo3/backend/action-button/deferred-action.js";export default new class{constructor(){document.addEventListener("typo3:redirects:slugChanged",(t=>this.onSlugChanged(t.detail)))}dispatchCustomEvent(t,e=null){const r=new CustomEvent(t,{detail:e});document.dispatchEvent(r)}onSlugChanged(t){const a=[],n=t.correlations;t.autoUpdateSlugs&&a.push({label:TYPO3.lang["notification.redirects.button.revert_update"],action:new r((async()=>{await this.revert([n.correlationIdSlugUpdate,n.correlationIdRedirectCreation])}))}),t.autoCreateRedirects&&a.push({label:TYPO3.lang["notification.redirects.button.revert_redirect"],action:new r((async()=>{await this.revert([n.correlationIdRedirectCreation])}))});let o=TYPO3.lang["notification.slug_only.title"],i=TYPO3.lang["notification.slug_only.message"];t.autoCreateRedirects&&(o=TYPO3.lang["notification.slug_and_redirects.title"],i=TYPO3.lang["notification.slug_and_redirects.message"]),e.info(o,i,0,a)}revert(r){const a=new t(TYPO3.settings.ajaxUrls.redirects_revert_correlation).withQueryArguments({correlation_ids:r}).get();return a.then((async t=>{const r=await t.resolve();"ok"===r.status&&e.success(r.title,r.message),"error"===r.status&&e.error(r.title,r.message)})).catch((()=>{e.error(TYPO3.lang.redirects_error_title,TYPO3.lang.redirects_error_message)})),a}};