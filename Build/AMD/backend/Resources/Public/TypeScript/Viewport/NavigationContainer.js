define(['../Enum/Viewport/ScaffoldIdentifier', '../Enum/Viewport/TopbarIdentifiers', 'jquery', '../Event/TriggerRequest', '../Icons', './AbstractContainer', './PageTree'], function (ScaffoldIdentifier, TopbarIdentifiers, $, TriggerRequest, Icons, AbstractContainer, PageTree) { 'use strict';

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
    class NavigationContainer extends AbstractContainer.AbstractContainer {
        constructor() {
            super(...arguments);
            this.PageTree = null;
            this.instance = null;
        }
        /**
         * Public method used by Navigation components to register themselves.
         * See TYPO3/CMS/Backend/PageTree/PageTreeElement->initialize
         *
         * @param {NavigationComponentInterface} component
         */
        setComponentInstance(component) {
            this.instance = component;
            this.PageTree = new PageTree(component);
        }
        toggle() {
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.scaffold).toggleClass('scaffold-content-navigation-expanded');
        }
        cleanup() {
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.moduleMenu).removeAttr('style');
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.content).removeAttr('style');
        }
        hide() {
            $__default['default'](TopbarIdentifiers.TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', true);
            Icons.getIcon('actions-pagetree', Icons.sizes.small, 'overlay-readonly', null, Icons.markupIdentifiers.inline).then((icon) => {
                $__default['default'](TopbarIdentifiers.TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
            });
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.scaffold).removeClass('scaffold-content-navigation-expanded');
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModule).removeAttr('style');
        }
        show(component) {
            $__default['default'](TopbarIdentifiers.TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', false);
            Icons.getIcon('actions-pagetree', Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                $__default['default'](TopbarIdentifiers.TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
            });
            $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentNavigationDataComponent).hide();
            if (typeof component !== undefined) {
                $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
                $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentNavigation + ' [data-component="' + component + '"]').show();
            }
        }
        /**
         * @param {string} urlToLoad
         * @param {InteractionRequest} interactionRequest
         * @returns {JQueryDeferred<TriggerRequest>}
         */
        setUrl(urlToLoad, interactionRequest) {
            const deferred = this.consumerScope.invoke(new TriggerRequest('typo3.setUrl', interactionRequest));
            deferred.then(() => {
                $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
                $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentNavigationIframe).attr('src', urlToLoad);
            });
            return deferred;
        }
        /**
         * @returns {string}
         */
        getUrl() {
            return $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentNavigationIframe).attr('src');
        }
        refresh() {
            return $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.contentNavigationIframe)[0].contentWindow.location.reload();
        }
        calculateScrollbar() {
            this.cleanup();
            const $scaffold = $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.scaffold);
            const $moduleMenuContainer = $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.moduleMenu);
            const $contentContainer = $__default['default'](ScaffoldIdentifier.ScaffoldIdentifierEnum.content);
            const $moduleMenu = $__default['default']('.t3js-modulemenu');
            $moduleMenuContainer.css('overflow', 'auto');
            const moduleMenuContainerWidth = $moduleMenuContainer.outerWidth();
            const moduleMenuWidth = $moduleMenu.outerWidth();
            $moduleMenuContainer.removeAttr('style').css('overflow', 'hidden');
            if ($scaffold.hasClass('scaffold-modulemenu-expanded') === false) {
                $moduleMenuContainer.width(moduleMenuContainerWidth + (moduleMenuContainerWidth - moduleMenuWidth));
                $contentContainer.css('left', moduleMenuContainerWidth + (moduleMenuContainerWidth - moduleMenuWidth));
            }
            else {
                $moduleMenuContainer.removeAttr('style');
                $contentContainer.removeAttr('style');
            }
            $moduleMenuContainer.css('overflow', 'auto');
        }
    }

    return NavigationContainer;

});
