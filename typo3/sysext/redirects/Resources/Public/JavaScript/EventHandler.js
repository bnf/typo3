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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Backend/ActionButton/DeferredAction"],(function(e,t,r){"use strict";return new class{constructor(){document.addEventListener("typo3:redirects:slugChanged",e=>this.onSlugChanged(e.detail))}onSlugChanged(e){let n=[];const i=e.correlations;e.autoUpdateSlugs&&n.push({label:TYPO3.lang["notification.redirects.button.revert_update"],action:new r(()=>this.revert([i.correlationIdSlugUpdate,i.correlationIdRedirectCreation]))}),e.autoCreateRedirects&&n.push({label:TYPO3.lang["notification.redirects.button.revert_redirect"],action:new r(()=>this.revert([i.correlationIdRedirectCreation]))});let a=TYPO3.lang["notification.slug_only.title"],o=TYPO3.lang["notification.slug_only.message"];e.autoCreateRedirects&&(a=TYPO3.lang["notification.slug_and_redirects.title"],o=TYPO3.lang["notification.slug_and_redirects.message"]),t.info(a,o,0,n)}revert(r){const n=new e(TYPO3.settings.ajaxUrls.redirects_revert_correlation).withQueryArguments({correlation_ids:r}).get();return n.then(async e=>{const r=await e.resolve();"ok"===r.status&&t.success(r.title,r.message),"error"===r.status&&t.error(r.title,r.message)}).catch(()=>{t.error(TYPO3.lang.redirects_error_title,TYPO3.lang.redirects_error_message)}),n}}}));