define(['jquery', './Event/ConsumerScope', '../../../../core/Resources/Public/TypeScript/Event/ThrottleEvent', './Viewport/Loader', './Viewport/ContentContainer', './Viewport/NavigationContainer', './Viewport/Topbar'], function ($, ConsumerScope, ThrottleEvent, Loader, ContentContainer, NavigationContainer, Topbar) { 'use strict';

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
    class Viewport {
        constructor() {
            // The attributes are uppercase for compatibility reasons
            this.Loader = Loader;
            this.NavigationContainer = null;
            this.ContentContainer = null;
            this.consumerScope = ConsumerScope;
            $__default['default'](() => this.initialize());
            this.Topbar = new Topbar();
            this.NavigationContainer = new NavigationContainer(this.consumerScope);
            this.ContentContainer = new ContentContainer(this.consumerScope);
        }
        doLayout() {
            this.NavigationContainer.cleanup();
            this.NavigationContainer.calculateScrollbar();
            $__default['default']('.t3js-topbar-header').css('padding-right', $__default['default']('.t3js-scaffold-toolbar').outerWidth());
        }
        initialize() {
            this.doLayout();
            new ThrottleEvent('resize', () => {
                this.doLayout();
            }, 100).bindTo(window);
        }
    }
    let viewportObject;
    if (!top.TYPO3.Backend) {
        viewportObject = new Viewport();
        top.TYPO3.Backend = viewportObject;
    }
    else {
        viewportObject = top.TYPO3.Backend;
    }
    var Viewport$1 = viewportObject;

    return Viewport$1;

});
