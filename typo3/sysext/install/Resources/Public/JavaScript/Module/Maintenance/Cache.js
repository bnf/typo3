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
define(["TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","../AbstractInlineModule"],(function(e,t,s,a){"use strict";class n extends a.AbstractInlineModule{initialize(a){this.setButtonState(a,!1),new t(s.getUrl("cacheClearAll","maintenance")).get({cache:"no-cache"}).then(async t=>{const s=await t.resolve();!0===s.success&&Array.isArray(s.status)?s.status.length>0&&s.status.forEach(t=>{e.success(t.title,t.message)}):e.error("Something went wrong clearing caches")},()=>{e.error("Clearing caches failed","Clearing caches went wrong on the server side. Check the system for broken extensions or missing database tables and try again.")}).finally(()=>{this.setButtonState(a,!0)})}}return new n}));