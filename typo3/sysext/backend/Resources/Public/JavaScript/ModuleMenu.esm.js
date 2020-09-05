import { ScaffoldIdentifierEnum } from './Enum/Viewport/ScaffoldIdentifier.esm.js';
import ClientRequest from './Event/ClientRequest.esm.js';
import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import TriggerRequest from './Event/TriggerRequest.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import Viewport from './Viewport.esm.js';
import Persistent from './Storage/Persistent.esm.js';

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
 * Class to render the module menu and handle the BE navigation
 */
class ModuleMenu {
    constructor() {
        this.loadedModule = null;
        this.loadedNavigationComponentId = '';
        $(() => this.initialize());
    }
    /**
     * Fetches all module menu elements in the local storage that should be collapsed
     *
     * @returns {Object}
     */
    static getCollapsedMainMenuItems() {
        if (Persistent.isset('modulemenu')) {
            return JSON.parse(Persistent.get('modulemenu'));
        }
        else {
            return {};
        }
    }
    /**
     * Adds a module menu item to the local storage
     *
     * @param {string} item
     */
    static addCollapsedMainMenuItem(item) {
        const existingItems = ModuleMenu.getCollapsedMainMenuItems();
        existingItems[item] = true;
        Persistent.set('modulemenu', JSON.stringify(existingItems));
    }
    /**
     * Removes a module menu item from the local storage
     *
     * @param {string} item
     */
    static removeCollapseMainMenuItem(item) {
        const existingItems = this.getCollapsedMainMenuItems();
        delete existingItems[item];
        Persistent.set('modulemenu', JSON.stringify(existingItems));
    }
    /**
     * Prepends previously saved record id to the url params
     *
     * @param {Object} moduleData
     * @param {string} params query string parameters for module url
     * @return {string}
     */
    static includeId(moduleData, params) {
        if (!moduleData.navigationComponentId && !moduleData.navigationFrameScript) {
            return params;
        }
        // get id
        let section = '';
        if (moduleData.navigationComponentId === 'TYPO3/CMS/Backend/PageTree/PageTreeElement') {
            section = 'web';
        }
        else {
            section = moduleData.name.split('_')[0];
        }
        if (top.fsMod.recentIds[section]) {
            params = 'id=' + top.fsMod.recentIds[section] + '&' + params;
        }
        return params;
    }
    /**
     * @param {boolean} collapse
     */
    static toggleMenu(collapse) {
        Viewport.NavigationContainer.cleanup();
        const $mainContainer = $(ScaffoldIdentifierEnum.scaffold);
        const expandedClass = 'scaffold-modulemenu-expanded';
        if (typeof collapse === 'undefined') {
            collapse = $mainContainer.hasClass(expandedClass);
        }
        $mainContainer.toggleClass(expandedClass, !collapse);
        if (!collapse) {
            $('.scaffold')
                .removeClass('scaffold-search-expanded')
                .removeClass('scaffold-toolbar-expanded');
        }
        // Persist collapsed state in the UC of the current user
        Persistent.set('BackendComponents.States.typo3-module-menu', {
            collapsed: collapse,
        });
        Viewport.doLayout();
    }
    /**
     * Gets the module properties from module menu markup (data attributes)
     *
     * @param {string} name
     * @returns {Module}
     */
    static getRecordFromName(name) {
        const $subModuleElement = $('#' + name);
        return {
            name: name,
            navigationComponentId: $subModuleElement.data('navigationcomponentid'),
            navigationFrameScript: $subModuleElement.data('navigationframescript'),
            navigationFrameScriptParam: $subModuleElement.data('navigationframescriptparameters'),
            link: $subModuleElement.data('link'),
        };
    }
    /**
     * @param {string} module
     */
    static highlightModuleMenuItem(module) {
        $('.modulemenu-action.modulemenu-action-active').removeClass('modulemenu-action-active');
        $('#' + module).addClass('modulemenu-action-active');
    }
    /**
     * Refresh the HTML by fetching the menu again
     */
    refreshMenu() {
        new AjaxRequest(TYPO3.settings.ajaxUrls.modulemenu).get().then(async (response) => {
            const result = await response.resolve();
            document.getElementById('modulemenu').outerHTML = result.menu;
            if (top.currentModuleLoaded) {
                ModuleMenu.highlightModuleMenuItem(top.currentModuleLoaded);
            }
            Viewport.doLayout();
        });
    }
    /**
     * Reloads the frames
     *
     * Hint: This method can't be static (yet), as this must be bound to the ModuleMenu instance.
     */
    reloadFrames() {
        Viewport.NavigationContainer.refresh();
        Viewport.ContentContainer.refresh();
    }
    /**
     * Event handler called after clicking on the module menu item
     *
     * @param {string} name
     * @param {string} params
     * @param {Event} event
     * @returns {JQueryDeferred<TriggerRequest>}
     */
    showModule(name, params, event = null) {
        params = params || '';
        const moduleData = ModuleMenu.getRecordFromName(name);
        return this.loadModuleComponents(moduleData, params, new ClientRequest('typo3.showModule', event));
    }
    initialize() {
        const me = this;
        let deferred = $.Deferred();
        deferred.resolve();
        // load the start module
        if (top.startInModule && top.startInModule[0] && $('#' + top.startInModule[0]).length > 0) {
            deferred = this.showModule(top.startInModule[0], top.startInModule[1]);
        }
        else {
            // fetch first module
            const $firstModule = $('.t3js-modulemenu-action[data-link]:first');
            if ($firstModule.attr('id')) {
                deferred = this.showModule($firstModule.attr('id'));
            }
            // else case: the main module has no entries, this is probably a backend
            // user with very little access rights, maybe only the logout button and
            // a user settings module in topbar.
        }
        deferred.then(() => {
            me.initializeEvents();
        });
    }
    initializeEvents() {
        new RegularEvent('click', (e, target) => {
            const moduleGroup = target.closest('.modulemenu-group');
            const moduleGroupContainer = moduleGroup.querySelector('.modulemenu-group-container');
            const ariaExpanded = target.attributes.getNamedItem('aria-expanded').value === 'true';
            if (ariaExpanded) {
                ModuleMenu.addCollapsedMainMenuItem(target.id);
            }
            else {
                ModuleMenu.removeCollapseMainMenuItem(target.id);
            }
            moduleGroup.classList.toggle('.modulemenu-group-collapsed', ariaExpanded);
            moduleGroup.classList.toggle('.modulemenu-group-expanded', !ariaExpanded);
            moduleGroupContainer.attributes.getNamedItem('aria-visible').value = (!ariaExpanded).toString();
            target.attributes.getNamedItem('aria-expanded').value = (!ariaExpanded).toString();
            $(moduleGroupContainer).stop().slideToggle({
                'complete': function () {
                    Viewport.doLayout();
                }
            });
        }).delegateTo(document.querySelector('.t3js-modulemenu'), '.t3js-modulemenu-collapsible');
        new RegularEvent('click', (e, target) => {
            if (typeof target.dataset.link !== 'undefined') {
                e.preventDefault();
                this.showModule(target.id, '', e);
            }
        }).delegateTo(document, '.t3js-modulemenu-action');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            ModuleMenu.toggleMenu();
        }).bindTo(document.querySelector('.t3js-topbar-button-modulemenu'));
        new RegularEvent('click', (e) => {
            e.preventDefault();
            ModuleMenu.toggleMenu(true);
        }).bindTo(document.querySelector('.t3js-scaffold-content-overlay'));
        new RegularEvent('click', (e) => {
            e.preventDefault();
            Viewport.NavigationContainer.toggle();
        }).bindTo(document.querySelector('.t3js-topbar-button-navigationcomponent'));
    }
    /**
     * Shows requested module (e.g. list/page)
     *
     * @param {Object} moduleData
     * @param {string} params
     * @param {InteractionRequest} [interactionRequest]
     * @return {jQuery.Deferred}
     */
    loadModuleComponents(moduleData, params, interactionRequest) {
        const moduleName = moduleData.name;
        // Allow other components e.g. Formengine to cancel switching between modules
        // (e.g. you have unsaved changes in the form)
        const deferred = Viewport.ContentContainer.beforeSetUrl(interactionRequest);
        deferred.then($.proxy(() => {
            if (moduleData.navigationComponentId) {
                this.loadNavigationComponent(moduleData.navigationComponentId);
            }
            else if (moduleData.navigationFrameScript) {
                Viewport.NavigationContainer.show('typo3-navigationIframe');
                this.openInNavFrame(moduleData.navigationFrameScript, moduleData.navigationFrameScriptParam, new TriggerRequest('typo3.loadModuleComponents', interactionRequest));
            }
            else {
                Viewport.NavigationContainer.hide();
            }
            ModuleMenu.highlightModuleMenuItem(moduleName);
            this.loadedModule = moduleName;
            params = ModuleMenu.includeId(moduleData, params);
            this.openInContentFrame(moduleData.link, params, new TriggerRequest('typo3.loadModuleComponents', interactionRequest));
            // compatibility
            top.currentSubScript = moduleData.link;
            top.currentModuleLoaded = moduleName;
            Viewport.doLayout();
        }, this));
        return deferred;
    }
    /**
     * Renders registered (non-iframe) navigation component e.g. a page tree
     *
     * @param {string} navigationComponentId
     */
    loadNavigationComponent(navigationComponentId) {
        const me = this;
        Viewport.NavigationContainer.show(navigationComponentId);
        if (navigationComponentId === this.loadedNavigationComponentId) {
            return;
        }
        const componentCssName = navigationComponentId.replace(/[/]/g, '_');
        if (this.loadedNavigationComponentId !== '') {
            $('#navigationComponent-' + this.loadedNavigationComponentId.replace(/[/]/g, '_')).hide();
        }
        if ($('.t3js-scaffold-content-navigation [data-component="' + navigationComponentId + '"]').length < 1) {
            $('.t3js-scaffold-content-navigation')
                .append($('<div />', {
                'class': 'scaffold-content-navigation-component',
                'data-component': navigationComponentId,
                id: 'navigationComponent-' + componentCssName,
            }));
        }
        //import(navigationComponentId).then(({default: NavigationComponent}: {default: NavigationComponentInterface}): void => {
        window.require([navigationComponentId], (NavigationComponent) => {
            NavigationComponent.initialize('#navigationComponent-' + componentCssName);
            Viewport.NavigationContainer.show(navigationComponentId);
            me.loadedNavigationComponentId = navigationComponentId;
        });
    }
    /**
     * @param {string} url
     * @param {string} params
     * @param {InteractionRequest} interactionRequest
     * @returns {JQueryDeferred<TriggerRequest>}
     */
    openInNavFrame(url, params, interactionRequest) {
        const navUrl = url + (params ? (url.includes('?') ? '&' : '?') + params : '');
        const currentUrl = Viewport.NavigationContainer.getUrl();
        const deferred = Viewport.NavigationContainer.setUrl(url, new TriggerRequest('typo3.openInNavFrame', interactionRequest));
        if (currentUrl !== navUrl) {
            // if deferred is already resolved, execute directly
            if (deferred.state() === 'resolved') {
                Viewport.NavigationContainer.refresh();
                // otherwise hand in future callback
            }
            else {
                deferred.then(Viewport.NavigationContainer.refresh);
            }
        }
        return deferred;
    }
    /**
     * @param {string} url
     * @param {string} params
     * @param {InteractionRequest} interactionRequest
     * @returns {JQueryDeferred<TriggerRequest>}
     */
    openInContentFrame(url, params, interactionRequest) {
        let deferred;
        if (top.nextLoadModuleUrl) {
            deferred = Viewport.ContentContainer.setUrl(top.nextLoadModuleUrl, new TriggerRequest('typo3.openInContentFrame', interactionRequest));
            top.nextLoadModuleUrl = '';
        }
        else {
            const urlToLoad = url + (params ? (url.includes('?') ? '&' : '?') + params : '');
            deferred = Viewport.ContentContainer.setUrl(urlToLoad, new TriggerRequest('typo3.openInContentFrame', interactionRequest));
        }
        return deferred;
    }
}
if (!top.TYPO3.ModuleMenu) {
    top.TYPO3.ModuleMenu = {
        App: new ModuleMenu(),
    };
}
const moduleMenuApp = top.TYPO3.ModuleMenu;

export default moduleMenuApp;
