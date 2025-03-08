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
import e from"@typo3/backend/notification.js"
import t from"@typo3/core/ajax/ajax-request.js"
import o from"@typo3/install/router.js"
import{AbstractInteractableModule as s}from"@typo3/install/module/abstract-interactable-module.js"
export default new class extends s{initialize(e){super.initialize(e),this.getData()}getData(){const s=this.getModalBody()
new t(o.getUrl("systemInformationGetData")).get({cache:"no-cache"}).then((async t=>{const o=await t.resolve()
!0===o.success?s.innerHTML=o.html:e.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}),(e=>{o.handleAjaxError(e,s)}))}}
