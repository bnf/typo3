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
define(["TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","../AbstractInlineModule"],(function(e,t,s,n){"use strict";class o extends n.AbstractInlineModule{initialize(n){this.setButtonState(n,!1),new t(s.getUrl("dumpAutoload")).get({cache:"no-cache"}).then(async t=>{const s=await t.resolve();!0===s.success&&Array.isArray(s.status)?s.status.length>0&&s.status.forEach(t=>{e.success(t.message)}):e.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},()=>{e.error("Autoloader not dumped","Dumping autoload files failed for unknown reasons. Check the system for broken extensions and try again.")}).finally(()=>{this.setButtonState(n,!0)})}}return new o}));