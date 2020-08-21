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
define(["TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","../AbstractInteractableModule"],(function(e,t,a,s){"use strict";class n extends s.AbstractInteractableModule{initialize(e){this.currentModal=e,this.getData()}getData(){const s=this.getModalBody();new t(a.getUrl("systemInformationGetData")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success?s.empty().append(a.html):e.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{a.handleAjaxError(e,s)})}}return new n}));