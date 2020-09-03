define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', './Event/ConsumerScope', './Viewport/Loader', './Viewport/ContentContainer', './Viewport/NavigationContainer', './Viewport/Topbar', '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent'], function (jquery, ConsumerScope, Loader, ContentContainer, NavigationContainer, Topbar, ThrottleEvent) { 'use strict';

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
            jquery(() => this.initialize());
            this.Topbar = new Topbar();
            this.NavigationContainer = new NavigationContainer(this.consumerScope);
            this.ContentContainer = new ContentContainer(this.consumerScope);
        }
        doLayout() {
            this.NavigationContainer.cleanup();
            this.NavigationContainer.calculateScrollbar();
            jquery('.t3js-topbar-header').css('padding-right', jquery('.t3js-scaffold-toolbar').outerWidth());
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
