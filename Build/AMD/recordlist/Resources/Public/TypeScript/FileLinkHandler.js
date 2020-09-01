define(['jquery', 'TYPO3/CMS/Backend/LegacyTree', './LinkBrowser'], function ($, Tree, LinkBrowser) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
    var Tree__default = /*#__PURE__*/_interopDefaultLegacy(Tree);

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
     * Module: TYPO3/CMS/Recordlist/FileLinkHandler
     * File link interaction
     * @exports TYPO3/CMS/Recordlist/FileLinkHandler
     */
    class FileLinkHandler {
        constructor() {
            this.currentLink = '';
            this.linkFile = (event) => {
                event.preventDefault();
                LinkBrowser.finalizeFunction($__default['default'](event.currentTarget).attr('href'));
            };
            this.linkCurrent = (event) => {
                event.preventDefault();
                LinkBrowser.finalizeFunction(this.currentLink);
            };
            // until we use onclick attributes, we need the Tree component
            Tree__default['default'].noop();
            $__default['default'](() => {
                this.currentLink = $__default['default']('body').data('currentLink');
                $__default['default']('a.t3js-fileLink').on('click', this.linkFile);
                $__default['default']('input.t3js-linkCurrent').on('click', this.linkCurrent);
            });
        }
    }
    new FileLinkHandler();

});
