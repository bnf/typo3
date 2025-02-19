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
import e from"@typo3/backend/notification.js";import t from"@typo3/core/ajax/ajax-request.js";import r from"@typo3/install/router.js";import{AbstractInlineModule as s}from"@typo3/install/module/abstract-inline-module.js";export default new class extends s{initialize(s){this.setButtonState(s,!1),new t(r.getUrl("cacheClearAll","maintenance")).get({cache:"no-cache"}).then((async t=>{const r=await t.resolve();!0===r.success&&Array.isArray(r.status)?r.status.length>0&&r.status.forEach((t=>{e.success(t.title,t.message)})):e.error("Something went wrong clearing caches")}),(()=>{e.error("Clearing caches failed","Clearing caches went wrong on the server side. Check the system for broken extensions or missing database tables and try again. Also ensure you are properly authenticated and the server does not report specific PHP parse errors or JavaScript errors are listed in the browser console.")})).finally((()=>{this.setButtonState(s,!0)}))}};