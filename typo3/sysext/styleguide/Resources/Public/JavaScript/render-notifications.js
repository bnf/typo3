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
import t from"@typo3/backend/notification.js";import e from"@typo3/backend/action-button/immediate-action.js";import n from"@typo3/backend/action-button/deferred-action.js";import o from"@typo3/core/event/regular-event.js";export default new class{constructor(){this.registerEvents()}registerEvents(){new o("click",((e,n)=>{const o=n.dataset.severity,a=n.dataset.title,i=n.dataset.message,r=parseInt(n.dataset.duration,10),c="1"===n.dataset.includeActions;t[o](a,i,r,this.createActions(c))})).delegateTo(document,'button[data-action="trigger-notification"]')}createActions(t){return t?[{label:"Immediate action",action:new e((function(){alert("Immediate action done")}))},{label:"Deferred action",action:new n((function(){return new Promise((t=>setTimeout((()=>{alert("Deferred action done after 3000 ms"),t()}),3e3)))}))}]:[]}};