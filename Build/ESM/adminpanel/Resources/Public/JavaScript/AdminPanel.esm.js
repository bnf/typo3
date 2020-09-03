"use strict";
var TYPO3;
(function (TYPO3) {
    TYPO3.AdminPanelSelectors = {
        adminPanelRole: 'form[data-typo3-role=typo3-adminPanel]',
        moduleTriggerRole: '[data-typo3-role=typo3-adminPanel-module-trigger]',
        moduleParentClass: '.typo3-adminPanel-module',
        contentTabRole: '[data-typo3-role=typo3-adminPanel-content-tab]',
        saveButtonRole: '[data-typo3-role=typo3-adminPanel-saveButton]',
        triggerRole: '[data-typo3-role=typo3-adminPanel-trigger]',
        popupTriggerRole: '[data-typo3-role=typo3-adminPanel-popup-trigger]',
        panelTriggerRole: '[data-typo3-role=typo3-adminPanel-panel-trigger]',
        panelParentClass: '.typo3-adminPanel-panel',
        contentSettingsTriggerRole: '[data-typo3-role=typo3-adminPanel-content-settings]',
        contentSettingsParentClass: '.typo3-adminPanel-content-settings',
        contentParentClass: '.typo3-adminPanel-content',
        zoomTarget: '[data-typo3-zoom-target]',
        zoomClose: '[data-typo3-zoom-close]',
        currentContentRole: '[data-typo3-role=typo3-adminPanel-content]',
        contentPaneRole: '[data-typo3-role=typo3-adminPanel-content-pane]',
    };
    TYPO3.AdminPanelClasses = {
        active: 'active',
        activeModule: 'typo3-adminPanel-module-active',
        activeContentSetting: 'typo3-adminPanel-content-settings-active',
        backdrop: 'typo3-adminPanel-backdrop',
        activeTab: 'typo3-adminPanel-content-header-item-active',
        activePane: 'typo3-adminPanel-content-panes-item-active',
        noScroll: 'typo3-adminPanel-noscroll',
        zoomShow: 'typo3-adminPanel-zoom-show',
    };
    class AdminPanel {
        constructor() {
            this.adminPanel = document.querySelector(TYPO3.AdminPanelSelectors.adminPanelRole);
            this.modules = this.querySelectorAll(TYPO3.AdminPanelSelectors.moduleTriggerRole).map((moduleTrigger) => {
                const moduleParent = moduleTrigger.closest(TYPO3.AdminPanelSelectors.moduleParentClass);
                return new AdminPanelModule(this, moduleParent, moduleTrigger);
            });
            this.popups = this.querySelectorAll(TYPO3.AdminPanelSelectors.popupTriggerRole).map((popupTrigger) => new AdminPanelPopup(this, popupTrigger));
            this.panels = this.querySelectorAll(TYPO3.AdminPanelSelectors.panelTriggerRole).map((panelTrigger) => {
                const panelParent = panelTrigger.closest(TYPO3.AdminPanelSelectors.panelParentClass);
                return new AdminPanelPanel(panelParent, panelTrigger);
            });
            this.contentSettings = this.querySelectorAll(TYPO3.AdminPanelSelectors.contentSettingsTriggerRole).map((contentSettingTrigger) => {
                const contentSettingElement = contentSettingTrigger
                    .closest(TYPO3.AdminPanelSelectors.contentParentClass)
                    .querySelector(TYPO3.AdminPanelSelectors.contentSettingsParentClass);
                return new AdminPanelContentSetting(contentSettingElement, contentSettingTrigger);
            });
            this.trigger = document.querySelector(TYPO3.AdminPanelSelectors.triggerRole);
            this.initializeEvents();
            this.addBackdropListener();
        }
        disableModules() {
            this.modules.forEach((module) => module.disable());
        }
        disablePopups() {
            this.popups.forEach((popup) => popup.disable());
        }
        renderBackdrop() {
            const adminPanel = document.getElementById('TSFE_ADMIN_PANEL_FORM');
            const backdrop = document.createElement('div');
            const body = document.querySelector('body');
            body.classList.add(TYPO3.AdminPanelClasses.noScroll);
            backdrop.classList.add(TYPO3.AdminPanelClasses.backdrop);
            adminPanel.appendChild(backdrop);
            this.addBackdropListener();
        }
        removeBackdrop() {
            const backdrop = document.querySelector('.' + TYPO3.AdminPanelClasses.backdrop);
            const body = document.querySelector('body');
            body.classList.remove(TYPO3.AdminPanelClasses.noScroll);
            if (backdrop !== null) {
                backdrop.remove();
            }
        }
        querySelectorAll(selectors, subject = null) {
            if (subject === null) {
                return Array.from(document.querySelectorAll(selectors));
            }
            return Array.from(subject.querySelectorAll(selectors));
        }
        initializeEvents() {
            this
                .querySelectorAll(TYPO3.AdminPanelSelectors.contentTabRole)
                .forEach((tab) => tab.addEventListener('click', this.switchTab.bind(this)));
            this
                .querySelectorAll(TYPO3.AdminPanelSelectors.zoomTarget)
                .forEach((zoomTrigger) => zoomTrigger.addEventListener('click', this.openZoom.bind(this)));
            this
                .querySelectorAll(TYPO3.AdminPanelSelectors.zoomClose)
                .forEach((zoomTrigger) => zoomTrigger.addEventListener('click', this.closeZoom.bind(this)));
            this
                .querySelectorAll(TYPO3.AdminPanelSelectors.triggerRole)
                .forEach((trigger) => trigger.addEventListener('click', this.toggleAdminPanelState.bind(this)));
            this
                .querySelectorAll(TYPO3.AdminPanelSelectors.saveButtonRole)
                .forEach((elm) => elm.addEventListener('click', this.sendAdminPanelForm.bind(this)));
            this
                .querySelectorAll('[data-typo3-role=typo3-adminPanel-content-close]')
                .forEach((elm) => {
                elm.addEventListener('click', () => {
                    this.disableModules();
                    this.removeBackdrop();
                });
            });
            this
                .querySelectorAll('.typo3-adminPanel-table th, .typo3-adminPanel-table td')
                .forEach((elm) => {
                elm.addEventListener('click', () => {
                    elm.focus();
                    try {
                        document.execCommand('copy');
                    }
                    catch (err) {
                        // nothing here
                    }
                });
            });
        }
        switchTab(event) {
            event.preventDefault();
            const activeTabClass = TYPO3.AdminPanelClasses.activeTab;
            const activePaneClass = TYPO3.AdminPanelClasses.activePane;
            const currentTab = event.currentTarget;
            const currentContent = currentTab.closest(TYPO3.AdminPanelSelectors.currentContentRole);
            const contentTabs = this.querySelectorAll(TYPO3.AdminPanelSelectors.contentTabRole, currentContent);
            const contentPanes = this.querySelectorAll(TYPO3.AdminPanelSelectors.contentPaneRole, currentContent);
            contentTabs.forEach((element) => element.classList.remove(activeTabClass));
            currentTab.classList.add(activeTabClass);
            contentPanes.forEach((element) => element.classList.remove(activePaneClass));
            const activePane = document.querySelector('[data-typo3-tab-id=' + currentTab.dataset.typo3TabTarget + ']');
            activePane.classList.add(activePaneClass);
        }
        openZoom(event) {
            event.preventDefault();
            const trigger = event.currentTarget;
            const targetId = trigger.getAttribute('data-typo3-zoom-target');
            const target = document.querySelector('[data-typo3-zoom-id=' + targetId + ']');
            target.classList.add(TYPO3.AdminPanelClasses.zoomShow);
        }
        closeZoom(event) {
            event.preventDefault();
            const trigger = event.currentTarget;
            const target = trigger.closest('[data-typo3-zoom-id]');
            target.classList.remove(TYPO3.AdminPanelClasses.zoomShow);
        }
        sendAdminPanelForm(event) {
            event.preventDefault();
            const formData = new FormData(this.adminPanel);
            const request = new XMLHttpRequest();
            request.open('POST', this.adminPanel.dataset.typo3AjaxUrl);
            request.send(formData);
            request.onload = () => location.assign(this.getCleanReloadUrl());
        }
        toggleAdminPanelState() {
            const request = new XMLHttpRequest();
            request.open('GET', this.trigger.dataset.typo3AjaxUrl);
            request.send();
            request.onload = () => location.reload();
        }
        /**
         * When previewing access/time restricted packs from the backend, "ADMCMD_" parameters are attached to the URL
         * - their settings will be saved in the admin panel. To make sure that the user is able to change those settings
         * via the Admin Panel User Interface the $_GET parameters are removed from the URL after saving and the page is
         * reloaded
         */
        getCleanReloadUrl() {
            let urlParams = [];
            location.search.substr(1).split('&').forEach((item) => {
                if (item && !item.includes('ADMCMD_')) {
                    urlParams.push(item);
                }
            });
            const queryString = urlParams ? '?' + urlParams.join('&') : '';
            return location.origin + location.pathname + queryString;
        }
        addBackdropListener() {
            this.querySelectorAll('.' + TYPO3.AdminPanelClasses.backdrop)
                .forEach((elm) => {
                elm.addEventListener('click', () => {
                    this.removeBackdrop();
                    this
                        .querySelectorAll(TYPO3.AdminPanelSelectors.moduleTriggerRole)
                        .forEach((innerElm) => {
                        innerElm.closest(TYPO3.AdminPanelSelectors.moduleParentClass)
                            .classList.remove(TYPO3.AdminPanelClasses.activeModule);
                    });
                });
            });
        }
    }
    TYPO3.AdminPanel = AdminPanel;
    class AdminPanelPopup {
        constructor(adminPanel, element) {
            this.adminPanel = adminPanel;
            this.element = element;
            this.initializeEvents();
        }
        isActive() {
            return this.element.classList.contains(TYPO3.AdminPanelClasses.active);
        }
        enable() {
            this.element.classList.add(TYPO3.AdminPanelClasses.active);
        }
        disable() {
            this.element.classList.remove(TYPO3.AdminPanelClasses.active);
        }
        initializeEvents() {
            this.element.addEventListener('click', () => {
                if (this.isActive()) {
                    this.disable();
                }
                else {
                    this.adminPanel.disablePopups();
                    this.enable();
                }
            });
        }
    }
    class AdminPanelPanel {
        constructor(element, trigger) {
            this.element = element;
            this.trigger = trigger;
            this.initializeEvents();
        }
        isActive() {
            return this.element.classList.contains(TYPO3.AdminPanelClasses.active);
        }
        enable() {
            this.element.classList.add(TYPO3.AdminPanelClasses.active);
        }
        disable() {
            this.element.classList.remove(TYPO3.AdminPanelClasses.active);
        }
        initializeEvents() {
            this.trigger.addEventListener('click', () => {
                if (this.isActive()) {
                    this.disable();
                }
                else {
                    this.enable();
                }
            });
        }
    }
    class AdminPanelContentSetting {
        constructor(element, trigger) {
            this.element = element;
            this.trigger = trigger;
            this.initializeEvents();
        }
        isActive() {
            return this.element.classList.contains(TYPO3.AdminPanelClasses.activeContentSetting);
        }
        enable() {
            this.element.classList.add(TYPO3.AdminPanelClasses.activeContentSetting);
        }
        disable() {
            this.element.classList.remove(TYPO3.AdminPanelClasses.activeContentSetting);
        }
        initializeEvents() {
            this.trigger.addEventListener('click', () => {
                if (this.isActive()) {
                    this.disable();
                }
                else {
                    this.enable();
                }
            });
        }
    }
    class AdminPanelModule {
        constructor(adminPanel, element, trigger) {
            this.adminPanel = adminPanel;
            this.element = element;
            this.trigger = trigger;
            this.initializeEvents();
        }
        isActive() {
            return this.element.classList.contains(TYPO3.AdminPanelClasses.activeModule);
        }
        enable() {
            this.element.classList.add(TYPO3.AdminPanelClasses.activeModule);
        }
        disable() {
            this.element.classList.remove(TYPO3.AdminPanelClasses.activeModule);
        }
        initializeEvents() {
            this.trigger.addEventListener('click', () => {
                this.adminPanel.removeBackdrop();
                if (this.isActive()) {
                    this.disable();
                }
                else {
                    this.adminPanel.disableModules();
                    this.adminPanel.renderBackdrop();
                    this.enable();
                }
            });
        }
    }
})(TYPO3 || (TYPO3 = {}));
(function () {
    window.addEventListener('load', () => new TYPO3.AdminPanel(), false);
})();
