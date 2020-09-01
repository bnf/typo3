define(['jquery'], function ($) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
    class ConsumerScope {
        constructor() {
            this.consumers = [];
        }
        getConsumers() {
            return this.consumers;
        }
        hasConsumer(consumer) {
            return this.consumers.includes(consumer);
        }
        attach(consumer) {
            if (!this.hasConsumer(consumer)) {
                this.consumers.push(consumer);
            }
        }
        detach(consumer) {
            this.consumers = this.consumers.filter((currentConsumer) => currentConsumer !== consumer);
        }
        invoke(request) {
            const deferreds = [];
            this.consumers.forEach((consumer) => {
                const deferred = consumer.consume.call(consumer, request);
                if (deferred) {
                    deferreds.push(deferred);
                }
            });
            return $__default['default'].when.apply($__default['default'], deferreds);
        }
    }
    var ConsumerScope$1 = new ConsumerScope();

    return ConsumerScope$1;

});
