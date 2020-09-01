define(['jquery', '../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', '../../../../../core/Resources/Public/TypeScript/Event/RegularEvent', '../../../../../backend/Resources/Public/TypeScript/Viewport', '../../../../../backend/Resources/Public/TypeScript/ModuleMenu'], function ($, AjaxRequest, RegularEvent, Viewport, ModuleMenu) { 'use strict';

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
    var Identifiers;
    (function (Identifiers) {
        Identifiers["containerSelector"] = "#typo3-cms-workspaces-backend-toolbaritems-workspaceselectortoolbaritem";
        Identifiers["activeMenuItemLinkSelector"] = ".dropdown-menu .selected";
        Identifiers["menuItemSelector"] = ".t3js-workspace-item";
        Identifiers["menuItemLinkSelector"] = ".t3js-workspaces-switchlink";
        Identifiers["toolbarItemSelector"] = ".dropdown-toggle";
        Identifiers["workspaceModuleLinkSelector"] = ".t3js-workspaces-modulelink";
    })(Identifiers || (Identifiers = {}));
    var Classes;
    (function (Classes) {
        Classes["workspaceBodyClass"] = "typo3-in-workspace";
        Classes["workspacesTitleInToolbarClass"] = "toolbar-item-name";
    })(Classes || (Classes = {}));
    /**
     * Module: TYPO3/CMS/Workspaces/Toolbar/WorkspacesMenu
     * toolbar menu for the workspaces functionality to switch between the workspaces
     * and jump to the workspaces module
     */
    class WorkspacesMenu {
        /**
         * Refresh the page tree
         */
        static refreshPageTree() {
            if (Viewport.NavigationContainer && Viewport.NavigationContainer.PageTree) {
                Viewport.NavigationContainer.PageTree.refreshTree();
            }
        }
        static updateWorkspaceState() {
            // This is a poor-mans state update in case the current active workspace has been renamed
            const selectedWorkspaceLink = document.querySelector(Identifiers.containerSelector + ' .t3js-workspace-item.selected .t3js-workspaces-switchlink');
            if (selectedWorkspaceLink !== null) {
                const workspaceId = parseInt(selectedWorkspaceLink.dataset.workspaceid, 10);
                const title = selectedWorkspaceLink.innerText.trim();
                top.TYPO3.configuration.inWorkspace = workspaceId !== 0;
                top.TYPO3.Backend.workspaceTitle = top.TYPO3.configuration.inWorkspace ? title : '';
            }
        }
        /**
         * adds the workspace title to the toolbar next to the username
         *
         * @param {String} workspaceTitle
         */
        static updateTopBar(workspaceTitle) {
            $__default['default']('.' + Classes.workspacesTitleInToolbarClass, Identifiers.containerSelector).remove();
            if (workspaceTitle && workspaceTitle.length) {
                let title = $__default['default']('<span>', {
                    'class': Classes.workspacesTitleInToolbarClass,
                }).text(workspaceTitle);
                $__default['default'](Identifiers.toolbarItemSelector, Identifiers.containerSelector).append(title);
            }
        }
        static updateBackendContext() {
            let topBarTitle = '';
            WorkspacesMenu.updateWorkspaceState();
            if (TYPO3.configuration.inWorkspace) {
                $__default['default']('body').addClass(Classes.workspaceBodyClass);
                topBarTitle = top.TYPO3.Backend.workspaceTitle || TYPO3.lang['Workspaces.workspaceTitle'];
            }
            else {
                $__default['default']('body').removeClass(Classes.workspaceBodyClass);
            }
            WorkspacesMenu.updateTopBar(topBarTitle);
        }
        constructor() {
            Viewport.Topbar.Toolbar.registerEvent(() => {
                this.initializeEvents();
                WorkspacesMenu.updateBackendContext();
            });
            new RegularEvent('typo3:datahandler:process', (e) => {
                const payload = e.detail.payload;
                if (payload.table === 'sys_workspace' && payload.action === 'delete' && payload.hasErrors === false) {
                    Viewport.Topbar.refresh();
                }
            }).bindTo(document);
        }
        /**
         * Changes the data in the module menu and the updates the backend context
         * This method is also used in the workspaces backend module.
         *
         * @param {Number} id the workspace ID
         */
        performWorkspaceSwitch(id) {
            // first remove all checks, then set the check in front of the selected workspace
            const stateActiveClass = 'fa fa-check';
            const stateInactiveClass = 'fa fa-empty-empty';
            // remove "selected" class and checkmark
            $__default['default'](Identifiers.activeMenuItemLinkSelector + ' i', Identifiers.containerSelector)
                .removeClass(stateActiveClass)
                .addClass(stateInactiveClass);
            $__default['default'](Identifiers.activeMenuItemLinkSelector, Identifiers.containerSelector).removeClass('selected');
            // add "selected" class and checkmark
            const $activeElement = $__default['default'](Identifiers.menuItemLinkSelector + '[data-workspaceid=' + id + ']', Identifiers.containerSelector);
            const $menuItem = $activeElement.closest(Identifiers.menuItemSelector);
            $menuItem.find('i')
                .removeClass(stateInactiveClass)
                .addClass(stateActiveClass);
            $menuItem.addClass('selected');
            WorkspacesMenu.updateBackendContext();
        }
        initializeEvents() {
            $__default['default'](Identifiers.containerSelector).on('click', Identifiers.workspaceModuleLinkSelector, (evt) => {
                evt.preventDefault();
                ModuleMenu.App.showModule(evt.currentTarget.dataset.module);
            });
            $__default['default'](Identifiers.containerSelector).on('click', Identifiers.menuItemLinkSelector, (evt) => {
                evt.preventDefault();
                this.switchWorkspace(parseInt(evt.currentTarget.dataset.workspaceid, 10));
            });
        }
        switchWorkspace(workspaceId) {
            (new AjaxRequest(TYPO3.settings.ajaxUrls.workspace_switch)).post({
                workspaceId: workspaceId,
                pageId: top.fsMod.recentIds.web
            }).then(async (response) => {
                const data = await response.resolve();
                if (!data.workspaceId) {
                    data.workspaceId = 0;
                }
                this.performWorkspaceSwitch(parseInt(data.workspaceId, 10));
                // append the returned page ID to the current module URL
                if (data.pageId) {
                    top.fsMod.recentIds.web = data.pageId;
                    let url = TYPO3.Backend.ContentContainer.getUrl();
                    url += (!url.includes('?') ? '?' : '&') + '&id=' + data.pageId;
                    WorkspacesMenu.refreshPageTree();
                    Viewport.ContentContainer.setUrl(url);
                    // when in web module reload, otherwise send the user to the web module
                }
                else if (top.currentModuleLoaded.startsWith('web_')) {
                    WorkspacesMenu.refreshPageTree();
                    if (top.currentModuleLoaded === 'web_WorkspacesWorkspaces') {
                        // Reload the workspace module and override the workspace id
                        ModuleMenu.App.showModule(top.currentModuleLoaded, 'workspace=' + workspaceId);
                    }
                    else {
                        ModuleMenu.App.reloadFrames();
                    }
                }
                else if (TYPO3.configuration.pageModule) {
                    ModuleMenu.App.showModule(TYPO3.configuration.pageModule);
                }
                // reload the module menu
                ModuleMenu.App.refreshMenu();
            });
        }
    }
    const workspacesMenu = new WorkspacesMenu();
    // expose the module in a global object
    TYPO3.WorkspacesMenu = workspacesMenu;

    return workspacesMenu;

});
