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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest","../AbstractInlineModule","TYPO3/CMS/Backend/Notification","../../Router"],(function(e,s,t,n){"use strict";class r extends s.AbstractInlineModule{initialize(s){this.setButtonState(s,!1),new e(n.getUrl("resetBackendUserUc")).get({cache:"no-cache"}).then(async e=>{const s=await e.resolve();!0===s.success&&Array.isArray(s.status)?s.status.length>0&&s.status.forEach(e=>{t.success(e.title,e.message)}):t.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},()=>{t.error("Reset preferences of all backend users failed","Resetting preferences of all backend users failed for an unknown reason. Please check your server's logs for further investigation.")}).finally(()=>{this.setButtonState(s,!0)})}}return new r}));