define(['jquery', './LinkBrowser'], function ($, LinkBrowser) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/PageLinkHandler
     * @exports TYPO3/CMS/Recordlist/PageLinkHandler
     * Page link interaction
     */
    class PageLinkHandler {
        constructor() {
            this.currentLink = '';
            /**
             * @param {JQueryEventObject} event
             */
            this.linkPage = (event) => {
                event.preventDefault();
                LinkBrowser.finalizeFunction($__default['default'](event.currentTarget).attr('href'));
            };
            /**
             * @param {JQueryEventObject} event
             */
            this.linkPageByTextfield = (event) => {
                event.preventDefault();
                let value = $__default['default']('#luid').val();
                if (!value) {
                    return;
                }
                // make sure we use proper link syntax if this is an integer only
                const valueAsNumber = parseInt(value, 10);
                if (!isNaN(valueAsNumber)) {
                    value = 't3://page?uid=' + valueAsNumber;
                }
                LinkBrowser.finalizeFunction(value);
            };
            /**
             * @param {JQueryEventObject} event
             */
            this.linkCurrent = (event) => {
                event.preventDefault();
                LinkBrowser.finalizeFunction(this.currentLink);
            };
            $__default['default'](() => {
                this.currentLink = $__default['default']('body').data('currentLink');
                $__default['default']('a.t3js-pageLink').on('click', this.linkPage);
                $__default['default']('input.t3js-linkCurrent').on('click', this.linkCurrent);
                $__default['default']('input.t3js-pageLink').on('click', this.linkPageByTextfield);
            });
        }
    }
    new PageLinkHandler();

});
