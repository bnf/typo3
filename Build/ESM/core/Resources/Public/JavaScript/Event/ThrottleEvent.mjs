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
 * Throttles the event listener to be called only after a defined time during the event's execution over time.
 */
class ThrottleEvent extends RegularEvent {
    constructor(eventName, callback, limit) {
        super(eventName, callback);
        this.callback = this.throttle(callback, limit);
    }
    throttle(callback, limit) {
        let wait = false;
        return function (...args) {
            if (wait) {
                return;
            }
            callback.apply(this, args);
            wait = true;
            setTimeout(() => {
                wait = false;
                // Wait time is over, execute callback again to have final state
                callback.apply(this, args);
            }, limit);
        };
    }
}

export default ThrottleEvent;
