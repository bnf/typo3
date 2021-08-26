import { ScaffoldIdentifierEnum } from '../Enum/Viewport/ScaffoldIdentifier.esm.js';
import { AbstractContainer } from './AbstractContainer.esm.js';
import TriggerRequest from '../Event/TriggerRequest.esm.js';

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
    constructor(consumerScope) {
        super(consumerScope);
        this.switcher = null;
        this.activeComponentId = '';
        this.parent = document.querySelector(ScaffoldIdentifierEnum.scaffold);
        this.container = document.querySelector(ScaffoldIdentifierEnum.contentNavigation);
        this.switcher = document.querySelector(ScaffoldIdentifierEnum.contentNavigationSwitcher);
    }
    /**
     * Renders registered (non-iframe) navigation component e.g. a page tree
     *
     * @param {string} navigationComponentId
     */
    showComponent(navigationComponentId) {
        this.show(navigationComponentId);
        // Component is already loaded and active, nothing to do
        if (navigationComponentId === this.activeComponentId) {
            return;
        }
        if (this.activeComponentId !== '') {
            let activeComponentElement = this.container.querySelector('#navigationComponent-' + this.activeComponentId.replace(/[/]/g, '_'));
            if (activeComponentElement) {
                activeComponentElement.style.display = 'none';
            }
        }
        const componentCssName = navigationComponentId.replace(/[/]/g, '_');
        const navigationComponentElement = 'navigationComponent-' + componentCssName;
        // The component was already set up, so requiring the module again can be excluded.
        if (this.container.querySelectorAll('[data-component="' + navigationComponentId + '"]').length === 1) {
            this.show(navigationComponentId);
            this.activeComponentId = navigationComponentId;
            return;
        }
        //import(navigationComponentId).then(({default: __esModule}: {default: any}): void => {
        window.require([navigationComponentId], (__esModule) => {
            if (typeof __esModule.navigationComponentName === 'string') {
                const tagName = __esModule.navigationComponentName;
                const element = document.createElement(tagName);
                element.setAttribute('id', navigationComponentElement);
                element.classList.add('scaffold-content-navigation-component');
                element.dataset.component = navigationComponentId;
                this.container.append(element);
            }
            else {
                // Because the component does not exist, let's create the div as wrapper
                this.container.insertAdjacentHTML('beforeend', '<div class="scaffold-content-navigation-component" data-component="' + navigationComponentId + '" id="' + navigationComponentElement + '"></div>');
                // manual static initialize method, unused but kept for backwards-compatibility until TYPO3 v12
                // @ts-ignore
                const navigationComponent = Object.values(__esModule)[0];
                // @ts-ignore
                navigationComponent.initialize('#' + navigationComponentElement);
            }
            this.show(navigationComponentId);
            this.activeComponentId = navigationComponentId;
        });
    }
    hide(hideSwitcher) {
        this.parent.classList.remove('scaffold-content-navigation-expanded');
        this.parent.classList.remove('scaffold-content-navigation-available');
        if (hideSwitcher && this.switcher) {
            this.switcher.style.display = 'none';
        }
    }
    show(component) {
        this.container.querySelectorAll(ScaffoldIdentifierEnum.contentNavigationDataComponent).forEach((el) => el.style.display = 'none');
        if (typeof component !== undefined) {
            this.parent.classList.add('scaffold-content-navigation-expanded');
            this.parent.classList.add('scaffold-content-navigation-available');
            const selectedElement = this.container.querySelector('[data-component="' + component + '"]');
            if (selectedElement) {
                // Re-set to the display setting from CSS
                selectedElement.style.display = null;
            }
        }
        if (this.switcher) {
            // Re-set to the display setting from CSS
            this.switcher.style.display = null;
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
            this.parent.classList.add('scaffold-content-navigation-expanded');
            const iFrameElement = this.getIFrameElement();
            if (iFrameElement) {
                iFrameElement.setAttribute('src', urlToLoad);
            }
        });
        return deferred;
    }
    getUrl() {
        const iFrameElement = this.getIFrameElement();
        if (iFrameElement) {
            return iFrameElement.getAttribute('src');
        }
        return '';
    }
    refresh() {
        const iFrameElement = this.getIFrameElement();
        if (iFrameElement) {
            return iFrameElement.contentWindow.location.reload();
        }
        return undefined;
    }
    getIFrameElement() {
        return this.container.querySelector(ScaffoldIdentifierEnum.contentNavigationIframe);
    }
}

export default NavigationContainer;
