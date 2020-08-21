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
define(["TYPO3/CMS/Backend/BroadcastMessage","TYPO3/CMS/Backend/Utility/MessageUtility","broadcastchannel"],(function(e,t){"use strict";return new class{constructor(){this.channel=new BroadcastChannel("typo3")}listen(){this.channel.onmessage=s=>{if(!t.MessageUtility.verifyOrigin(s.origin))throw"Denied message sent by "+s.origin;const n=e.BroadcastMessage.fromData(s.data);document.dispatchEvent(n.createCustomEvent("typo3"))}}post(e){this.channel.postMessage(e)}}}));