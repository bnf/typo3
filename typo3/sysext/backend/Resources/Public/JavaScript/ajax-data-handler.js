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
import{BroadcastMessage as r}from"@typo3/backend/broadcast-message.js";import s from"@typo3/core/ajax/ajax-request.js";import e from"@typo3/backend/broadcast-service.js";import t from"@typo3/backend/notification.js";class a{static call(r){return new s(TYPO3.settings.ajaxUrls.record_process).withQueryArguments(r).get().then((async r=>await r.resolve()))}async process(s,t){return a.call(s).then((s=>{if(s.hasErrors&&this.handleErrors(s),t){const a={...t,hasErrors:s.hasErrors},o=new r("datahandler","process",a);e.post(o);const n=new CustomEvent("typo3:datahandler:process",{detail:{payload:a}});document.dispatchEvent(n)}return s}))}handleErrors(r){for(const s of r.messages)t.error(s.title,s.message)}}var o=new a;export{o as default};