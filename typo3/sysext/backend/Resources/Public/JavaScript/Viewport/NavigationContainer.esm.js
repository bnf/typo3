import Icons from '../Icons.esm.js';
import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import { ScaffoldIdentifierEnum } from '../Enum/Viewport/ScaffoldIdentifier.esm.js';
import { AbstractContainer } from './AbstractContainer.esm.js';
import TriggerRequest from '../Event/TriggerRequest.esm.js';
import { TopbarIdentifiersEnum } from '../Enum/Viewport/TopbarIdentifiers.esm.js';
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
        jQuery(ScaffoldIdentifierEnum.scaffold).toggleClass('scaffold-content-navigation-expanded');
    }
    cleanup() {
        jQuery(ScaffoldIdentifierEnum.moduleMenu).removeAttr('style');
        jQuery(ScaffoldIdentifierEnum.content).removeAttr('style');
    }
    hide() {
        jQuery(TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', true);
        Icons.getIcon('actions-pagetree', Icons.sizes.small, 'overlay-readonly', null, Icons.markupIdentifiers.inline).then((icon) => {
            jQuery(TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
        });
        jQuery(ScaffoldIdentifierEnum.scaffold).removeClass('scaffold-content-navigation-expanded');
        jQuery(ScaffoldIdentifierEnum.contentModule).removeAttr('style');
    }
    show(component) {
        jQuery(TopbarIdentifiersEnum.buttonNavigationComponent).prop('disabled', false);
        Icons.getIcon('actions-pagetree', Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
            jQuery(TopbarIdentifiersEnum.buttonNavigationComponent).html(icon);
        });
        jQuery(ScaffoldIdentifierEnum.contentNavigationDataComponent).hide();
        if (typeof component !== undefined) {
            jQuery(ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
            jQuery(ScaffoldIdentifierEnum.contentNavigation + ' [data-component="' + component + '"]').show();
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
            jQuery(ScaffoldIdentifierEnum.scaffold).addClass('scaffold-content-navigation-expanded');
            jQuery(ScaffoldIdentifierEnum.contentNavigationIframe).attr('src', urlToLoad);
        });
        return deferred;
    }
    /**
     * @returns {string}
     */
    getUrl() {
        return jQuery(ScaffoldIdentifierEnum.contentNavigationIframe).attr('src');
    }
    refresh() {
        return jQuery(ScaffoldIdentifierEnum.contentNavigationIframe)[0].contentWindow.location.reload();
    }
    calculateScrollbar() {
        this.cleanup();
        const $scaffold = jQuery(ScaffoldIdentifierEnum.scaffold);
        const $moduleMenuContainer = jQuery(ScaffoldIdentifierEnum.moduleMenu);
        const $contentContainer = jQuery(ScaffoldIdentifierEnum.content);
        const $moduleMenu = jQuery('.t3js-modulemenu');
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
