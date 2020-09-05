import { ScaffoldIdentifierEnum } from '../Enum/Viewport/ScaffoldIdentifier.esm.js';
import { TopbarIdentifiersEnum } from '../Enum/Viewport/TopbarIdentifiers.esm.js';
import $ from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import TriggerRequest from '../Event/TriggerRequest.esm.js';
import Icons from '../Icons.esm.js';
import { AbstractContainer } from './AbstractContainer.esm.js';
import PageTree from './PageTree.esm.js';

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
class NavigationContainer extends AbstractContainer {
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
        $(ScaffoldIdentifierEnum.scaffold).toggleClass('scaffold-content-navigation-expanded');
    }
    cleanup() {
        $(ScaffoldIdentifierEnum.moduleMenu).removeAttr('style');
        $(ScaffoldIdentifierEnum.content).removeAttr('style');
    }
    hide() {
        $(TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', true);
        Icons.getIcon('actions-pagetree', Icons.sizes.small, 'overlay-readonly', null, Icons.markupIdentifiers.inline).then((icon) => {
            $(TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
        });
        $(ScaffoldIdentifierEnum.scaffold).removeClass('scaffold-content-navigation-expanded');
        $(ScaffoldIdentifierEnum.contentModule).removeAttr('style');
    }
    show(component) {
        $(TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', false);
        Icons.getIcon('actions-pagetree', Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
            $(TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
        });
        $(ScaffoldIdentifierEnum.contentNavigationDataComponent).hide();
        if (typeof component !== undefined) {
            $(ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
            $(ScaffoldIdentifierEnum.contentNavigation + ' [data-component="' + component + '"]').show();
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
            $(ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
            $(ScaffoldIdentifierEnum.contentNavigationIframe).attr('src', urlToLoad);
        });
        return deferred;
    }
    /**
     * @returns {string}
     */
    getUrl() {
        return $(ScaffoldIdentifierEnum.contentNavigationIframe).attr('src');
    }
    refresh() {
        return $(ScaffoldIdentifierEnum.contentNavigationIframe)[0].contentWindow.location.reload();
    }
    calculateScrollbar() {
        this.cleanup();
        const $scaffold = $(ScaffoldIdentifierEnum.scaffold);
        const $moduleMenuContainer = $(ScaffoldIdentifierEnum.moduleMenu);
        const $contentContainer = $(ScaffoldIdentifierEnum.content);
        const $moduleMenu = $('.t3js-modulemenu');
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

export default NavigationContainer;
