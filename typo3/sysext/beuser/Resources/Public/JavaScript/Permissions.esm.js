import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import tooltipObject from '../../../../backend/Resources/Public/JavaScript/Tooltip.esm.js';

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
 * Module: TYPO3/CMS/Beuser/Permissions
 * Javascript functions regarding the permissions module
 */
class Permissions {
    constructor() {
        this.options = {
            containerSelector: '#typo3-permissionList',
            editControllerSelector: '#PermissionControllerEdit',
        };
        this.ajaxUrl = TYPO3.settings.ajaxUrls.user_access_permissions;
        this.initializeCheckboxGroups();
        this.initializeEvents();
    }
    /**
     * Changes the value of the permissions in the form
     */
    static setPermissionCheckboxes(checknames, permissionValue) {
        const permissionCheckboxes = document.querySelectorAll(`input[type="checkbox"][name^="${checknames}"]`);
        for (let permissionCheckbox of permissionCheckboxes) {
            const value = parseInt(permissionCheckbox.value, 10);
            permissionCheckbox.checked = (permissionValue & value) === value;
        }
    }
    /**
     * checks for a change of the permissions in the form
     */
    static updatePermissionValue(checknames, varname) {
        let permissionValue = 0;
        const checkedPermissionCheckboxes = document.querySelectorAll(`input[type="checkbox"][name^="${checknames}"]:checked`);
        for (let permissionCheckbox of checkedPermissionCheckboxes) {
            permissionValue |= parseInt(permissionCheckbox.value, 10);
        }
        document.forms.namedItem('editform')[varname].value = permissionValue | (checknames === 'check[perms_user]' ? 1 : 0);
    }
    /**
     * Changes permissions by sending an AJAX request to the server
     */
    setPermissions(element) {
        let page = element.dataset.page;
        let who = element.dataset.who;
        // Hide all Tooltips to avoid permanent visible/never hidden Tooltips
        tooltipObject.hide(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        (new AjaxRequest(this.ajaxUrl)).post({
            page: page,
            who: who,
            permissions: element.dataset.permissions,
            mode: element.dataset.mode,
            bits: element.dataset.bits,
        }).then(async (response) => {
            const data = await response.resolve();
            const element = document.getElementById(page + '_' + who);
            // Replace content
            element.outerHTML = data;
            // Reinitialize tooltip
            tooltipObject.initialize('[data-bs-toggle="tooltip"]');
        });
    }
    /**
     * changes the flag to lock the editing on a page by sending an AJAX request
     */
    toggleEditLock(element) {
        let page = element.dataset.page;
        (new AjaxRequest(this.ajaxUrl)).post({
            action: 'toggle_edit_lock',
            page: page,
            editLockState: element.dataset.lockstate,
        }).then(async (response) => {
            // Replace content
            document.getElementById('el_' + page).outerHTML = await response.resolve();
        });
    }
    /**
     * Owner-related: Set the new owner of a page by executing an ajax call
     */
    changeOwner(element) {
        let page = element.dataset.page;
        const container = document.getElementById('o_' + page);
        (new AjaxRequest(this.ajaxUrl)).post({
            action: 'change_owner',
            page: page,
            ownerUid: element.dataset.owner,
            newOwnerUid: container.getElementsByTagName('select')[0].value,
        }).then(async (response) => {
            // Replace content
            container.outerHTML = await response.resolve();
        });
    }
    /**
     * Owner-related: load the selector for selecting
     * the owner of a page by executing an ajax call
     */
    showChangeOwnerSelector(element) {
        let page = element.dataset.page;
        (new AjaxRequest(this.ajaxUrl)).post({
            action: 'show_change_owner_selector',
            page: page,
            ownerUid: element.dataset.owner,
            username: element.dataset.username,
        }).then(async (response) => {
            // Replace content
            document.getElementById('o_' + page).outerHTML = await response.resolve();
        });
    }
    /**
     * Owner-related: Update the HTML view and show the original owner
     */
    restoreOwner(element) {
        var _a;
        const page = element.dataset.page;
        const username = (_a = element.dataset.username) !== null && _a !== void 0 ? _a : element.dataset.ifNotSet;
        const span = document.createElement('span');
        span.setAttribute('id', `o_${page}`);
        const buttonSelector = document.createElement('button');
        buttonSelector.classList.add('ug_selector', 'changeowner', 'btn', 'btn-link');
        buttonSelector.setAttribute('type', 'button');
        buttonSelector.setAttribute('data-page', page);
        buttonSelector.setAttribute('data-owner', element.dataset.owner);
        buttonSelector.setAttribute('data-username', username);
        buttonSelector.innerText = username;
        span.appendChild(buttonSelector);
        // Replace content
        const container = document.getElementById('o_' + page);
        container.parentNode.replaceChild(span, container);
    }
    /**
     * Group-related: Update the HTML view and show the original group
     */
    restoreGroup(element) {
        var _a;
        const page = element.dataset.page;
        const groupname = (_a = element.dataset.groupname) !== null && _a !== void 0 ? _a : element.dataset.ifNotSet;
        const span = document.createElement('span');
        span.setAttribute('id', `g_${page}`);
        const buttonSelector = document.createElement('button');
        buttonSelector.classList.add('ug_selector', 'changegroup', 'btn', 'btn-link');
        buttonSelector.setAttribute('type', 'button');
        buttonSelector.setAttribute('data-page', page);
        buttonSelector.setAttribute('data-group-id', element.dataset.groupId);
        buttonSelector.setAttribute('data-groupname', groupname);
        buttonSelector.innerText = groupname;
        span.appendChild(buttonSelector);
        // Replace content
        const container = document.getElementById('g_' + page);
        container.parentNode.replaceChild(span, container);
    }
    /**
     * Group-related: Set the new group by executing an ajax call
     */
    changeGroup(element) {
        let page = element.dataset.page;
        const container = document.getElementById('g_' + page);
        (new AjaxRequest(this.ajaxUrl)).post({
            action: 'change_group',
            page: page,
            groupUid: element.dataset.groupId,
            newGroupUid: container.getElementsByTagName('select')[0].value,
        }).then(async (response) => {
            // Replace content
            container.outerHTML = await response.resolve();
        });
    }
    /**
     * Group-related: Load the selector by executing an ajax call
     */
    showChangeGroupSelector(element) {
        let page = element.dataset.page;
        (new AjaxRequest(this.ajaxUrl)).post({
            action: 'show_change_group_selector',
            page: page,
            groupUid: element.dataset.groupId,
            groupname: element.dataset.groupname,
        }).then(async (response) => {
            // Replace content
            document.getElementById('g_' + page).outerHTML = await response.resolve();
        });
    }
    initializeCheckboxGroups() {
        const checkboxGroups = document.querySelectorAll('[data-checkbox-group]');
        checkboxGroups.forEach((checkboxGroupCheckbox) => {
            const permissionGroup = checkboxGroupCheckbox.dataset.checkboxGroup;
            const permissionValue = parseInt(checkboxGroupCheckbox.value, 10);
            Permissions.setPermissionCheckboxes(permissionGroup, permissionValue);
        });
    }
    /**
     * initializes events using deferred bound to document
     * so AJAX reloads are no problem
     */
    initializeEvents() {
        const containerSelector = document.querySelector(this.options.containerSelector);
        const editControllerSelector = document.querySelector(this.options.editControllerSelector);
        if (containerSelector !== null) {
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.setPermissions(currentTarget);
            }).delegateTo(containerSelector, '.change-permission');
            // Click event for lock state
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.toggleEditLock(currentTarget);
            }).delegateTo(containerSelector, '.editlock');
            // Click event to change owner
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.showChangeOwnerSelector(currentTarget);
            }).delegateTo(containerSelector, '.changeowner');
            // Click event to change group
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.showChangeGroupSelector(currentTarget);
            }).delegateTo(containerSelector, '.changegroup');
            // Add click handler for restoring previous owner
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.restoreOwner(currentTarget);
            }).delegateTo(containerSelector, '.restoreowner');
            // Add click handler for saving owner
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.changeOwner(currentTarget);
            }).delegateTo(containerSelector, '.saveowner');
            // Add click handler for restoring previous group
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.restoreGroup(currentTarget);
            }).delegateTo(containerSelector, '.restoregroup');
            // Add click handler for saving group
            new RegularEvent('click', (e, currentTarget) => {
                e.preventDefault();
                this.changeGroup(currentTarget);
            }).delegateTo(containerSelector, '.savegroup');
        }
        if (editControllerSelector !== null) {
            // Click events to change permissions (in template Edit.html)
            new RegularEvent('click', (e, currentTarget) => {
                const args = currentTarget.dataset.checkChangePermissions.split(',').map((item) => item.trim());
                Permissions.updatePermissionValue.apply(this, args);
            }).delegateTo(editControllerSelector, '[data-check-change-permissions]');
        }
    }
}
var Permissions$1 = new Permissions();

export default Permissions$1;
