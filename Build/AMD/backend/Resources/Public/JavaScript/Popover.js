define(['jquery', 'bootstrap'], function ($, bootstrap) { 'use strict';

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
    /**
     * Module: TYPO3/CMS/Backend/Popover
     * API for popover windows powered by Twitter Bootstrap.
     * @exports TYPO3/CMS/Backend/Popover
     */
    class Popover {
        constructor() {
            /**
             * Default selector string.
             *
             * @return {string}
             */
            this.DEFAULT_SELECTOR = '[data-toggle="popover"]';
            this.initialize();
        }
        /**
         * Initialize
         */
        initialize(selector) {
            selector = selector || this.DEFAULT_SELECTOR;
            $__default['default'](selector).popover();
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Popover wrapper function
         *
         * @param {JQuery} $element
         */
        popover($element) {
            $element.popover();
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Set popover options on $element
         *
         * @param {JQuery} $element
         * @param {PopoverOptions} options
         */
        setOptions($element, options) {
            options = options || {};
            const title = options.title || $element.data('title') || '';
            const content = options.content || $element.data('content') || '';
            $element
                .attr('data-original-title', title)
                .attr('data-content', content)
                .attr('data-placement', 'auto')
                .popover(options);
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Set popover option on $element
         *
         * @param {JQuery} $element
         * @param {String} key
         * @param {String} value
         */
        setOption($element, key, value) {
            $element.data('bs.popover').options[key] = value;
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Show popover with title and content on $element
         *
         * @param {JQuery} $element
         */
        show($element) {
            $element.popover('show');
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Hide popover on $element
         *
         * @param {JQuery} $element
         */
        hide($element) {
            $element.popover('hide');
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Destroy popover on $element
         *
         * @param {Object} $element
         */
        destroy($element) {
            $element.popover('destroy');
        }
        // noinspection JSMethodCanBeStatic
        /**
         * Toggle popover on $element
         *
         * @param {Object} $element
         */
        toggle($element) {
            $element.popover('toggle');
        }
    }
    var Popover$1 = new Popover();

    return Popover$1;

});
