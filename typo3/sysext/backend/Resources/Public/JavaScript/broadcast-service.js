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
import{BroadcastMessage as t}from"@typo3/backend/broadcast-message.js";import{MessageUtility as e}from"@typo3/backend/utility/message-utility.js";class s{constructor(){this.channel=new BroadcastChannel("typo3")}get isListening(){return"function"==typeof this.channel.onmessage}static onMessage(s){if(!e.verifyOrigin(s.origin))throw"Denied message sent by "+s.origin;const n=t.fromData(s.data);document.dispatchEvent(n.createCustomEvent("typo3"))}listen(){this.isListening||(this.channel.onmessage=s.onMessage)}post(t){this.channel.postMessage(t)}}export default new s;