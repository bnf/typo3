define(function () { 'use strict';

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
    class RegularEvent {
        constructor(eventName, callback) {
            this.eventName = eventName;
            this.callback = callback;
        }
        bindTo(element) {
            this.boundElement = element;
            element.addEventListener(this.eventName, this.callback);
        }
        delegateTo(element, selector) {
            this.boundElement = element;
            element.addEventListener(this.eventName, (e) => {
                for (let targetElement = e.target; targetElement && targetElement !== this.boundElement; targetElement = targetElement.parentNode) {
                    if (targetElement.matches(selector)) {
                        this.callback.call(targetElement, e, targetElement);
                        break;
                    }
                }
            }, false);
        }
        release() {
            this.boundElement.removeEventListener(this.eventName, this.callback);
        }
    }

    return RegularEvent;

});
