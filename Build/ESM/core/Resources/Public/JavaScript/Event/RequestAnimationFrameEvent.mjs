import RegularEvent from './RegularEvent.mjs';

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
/**
 * Creates a event aimed for high performance visual operations
 */
class RequestAnimationFrameEvent extends RegularEvent {
    constructor(eventName, callback) {
        super(eventName, callback);
        this.callback = this.req(this.callback);
    }
    req(callback) {
        let timeout = null;
        return () => {
            const context = this;
            const args = arguments;
            if (timeout) {
                window.cancelAnimationFrame(timeout);
            }
            timeout = window.requestAnimationFrame(function () {
                // Run our scroll functions
                callback.apply(context, args);
            });
        };
    }
}

export default RequestAnimationFrameEvent;
