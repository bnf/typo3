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
import{BroadcastMessage as e}from"@typo3/backend/broadcast-message.js";import o from"@typo3/backend/broadcast-service.js";import t from"@typo3/backend/modal.js";import r from"@typo3/backend/hotkeys.js";import s from"@typo3/core/document-service.js";export default new class{constructor(){s.ready().then((()=>{r.register([r.normalizedCtrlModifierKey,"k"],(r=>{t.currentModal||(r.preventDefault(),document.dispatchEvent(new CustomEvent("typo3:live-search:trigger-open")),o.post(new e("live-search","trigger-open",{})))}),{allowOnEditables:!0})}))}};