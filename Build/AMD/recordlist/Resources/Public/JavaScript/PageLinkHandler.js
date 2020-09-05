define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', './LinkBrowser'], function (jquery, LinkBrowser) { 'use strict';

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
                LinkBrowser.finalizeFunction(jquery(event.currentTarget).attr('href'));
            };
            /**
             * @param {JQueryEventObject} event
             */
            this.linkPageByTextfield = (event) => {
                event.preventDefault();
                let value = jquery('#luid').val();
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
            jquery(() => {
                this.currentLink = jquery('body').data('currentLink');
                jquery('a.t3js-pageLink').on('click', this.linkPage);
                jquery('input.t3js-linkCurrent').on('click', this.linkCurrent);
                jquery('input.t3js-pageLink').on('click', this.linkPageByTextfield);
            });
        }
    }
    var PageLinkHandler$1 = new PageLinkHandler();

    return PageLinkHandler$1;

});
