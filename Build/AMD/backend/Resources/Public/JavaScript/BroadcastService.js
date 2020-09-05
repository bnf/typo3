define(['./BroadcastMessage', '../../../../core/Resources/Public/JavaScript/Contrib/broadcastchannel-polyfill', './Utility/MessageUtility'], function (BroadcastMessage, broadcastchannelPolyfill, MessageUtility) { 'use strict';

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
    class BroadcastService {
        constructor() {
            this.channel = new BroadcastChannel('typo3');
        }
        listen() {
            this.channel.onmessage = (evt) => {
                if (!MessageUtility.MessageUtility.verifyOrigin(evt.origin)) {
                    throw 'Denied message sent by ' + evt.origin;
                }
                const message = BroadcastMessage.BroadcastMessage.fromData(evt.data);
                document.dispatchEvent(message.createCustomEvent('typo3'));
            };
        }
        post(message) {
            this.channel.postMessage(message);
        }
    }
    var broadcastService = new BroadcastService();

    return broadcastService;

});
