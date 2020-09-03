define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest'], function (jquery, AjaxRequest) { 'use strict';

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
            this.initializeEvents();
        }
        /**
         * Changes the value of the permissions in the form
         */
        setCheck(checknames, varname) {
            if (document.editform[varname]) {
                let res = document.editform[varname].value;
                for (let a = 1; a <= 5; a++) {
                    document.editform[checknames + '[' + a + ']'].checked = (res & Math.pow(2, a - 1));
                }
            }
        }
        /**
         * checks for a change of the permissions in the form
         */
        checkChange(checknames, varname) {
            let res = 0;
            for (let a = 1; a <= 5; a++) {
                if (document.editform[checknames + '[' + a + ']'].checked) {
                    res |= Math.pow(2, a - 1);
                }
            }
            document.editform[varname].value = res | (checknames === 'tx_beuser_system_beusertxpermission[check][perms_user]' ? 1 : 0);
            this.setCheck(checknames, varname);
        }
        /**
         * Changes permissions by sending an AJAX request to the server
         */
        setPermissions($element) {
            let page = $element.data('page');
            let who = $element.data('who');
            let elementSelector = '#' + page + '_' + who;
            (new AjaxRequest(this.ajaxUrl)).post({
                page: page,
                who: who,
                permissions: $element.data('permissions'),
                mode: $element.data('mode'),
                bits: $element.data('bits'),
            }).then(async (response) => {
                const data = await response.resolve();
                // Replace content
                jquery(elementSelector).replaceWith(data);
                // Reinitialize tooltip
                jquery(elementSelector).find('button').tooltip();
            });
        }
        /**
         * changes the flag to lock the editing on a page by sending an AJAX request
         */
        toggleEditLock($element) {
            let page = $element.data('page');
            (new AjaxRequest(this.ajaxUrl)).post({
                action: 'toggle_edit_lock',
                page: page,
                editLockState: $element.data('lockstate'),
            }).then(async (response) => {
                // Replace content
                jquery('#el_' + page).replaceWith(await response.resolve());
            });
        }
        /**
         * Owner-related: Set the new owner of a page by executing an ajax call
         */
        changeOwner($element) {
            let page = $element.data('page');
            (new AjaxRequest(this.ajaxUrl)).post({
                action: 'change_owner',
                page: page,
                ownerUid: $element.data('owner'),
                newOwnerUid: jquery('#new_page_owner').val(),
            }).then(async (response) => {
                // Replace content
                jquery('#o_' + page).replaceWith(await response.resolve());
            });
        }
        /**
         * Owner-related: load the selector for selecting
         * the owner of a page by executing an ajax call
         */
        showChangeOwnerSelector($element) {
            let page = $element.data('page');
            (new AjaxRequest(this.ajaxUrl)).post({
                action: 'show_change_owner_selector',
                page: page,
                ownerUid: $element.data('owner'),
                username: $element.data('username'),
            }).then(async (response) => {
                // Replace content
                jquery('#o_' + page).replaceWith(await response.resolve());
            });
        }
        /**
         * Owner-related: Update the HTML view and show the original owner
         */
        restoreOwner($element) {
            let page = $element.data('page');
            let username = $element.data('username');
            let usernameHtml = username;
            if (typeof username === 'undefined') {
                username = jquery('<span>', {
                    'class': 'not_set',
                    'text': '[not set]',
                });
                usernameHtml = username.html();
                username = username.text();
            }
            let html = jquery('<span/>', {
                'id': 'o_' + page,
            });
            let aSelector = jquery('<a/>', {
                'class': 'ug_selector changeowner',
                'data-page': page,
                'data-owner': $element.data('owner'),
                'data-username': usernameHtml,
                'text': username,
            });
            html.append(aSelector);
            // Replace content
            jquery('#o_' + page).replaceWith(html);
        }
        /**
         * Group-related: Set the new group by executing an ajax call
         */
        changeGroup($element) {
            let page = $element.data('page');
            (new AjaxRequest(this.ajaxUrl)).post({
                action: 'change_group',
                page: page,
                groupUid: $element.data('groupId'),
                newGroupUid: jquery('#new_page_group').val(),
            }).then(async (response) => {
                // Replace content
                jquery('#g_' + page).replaceWith(await response.resolve());
            });
        }
        /**
         * Group-related: Load the selector by executing an ajax call
         */
        showChangeGroupSelector($element) {
            let page = $element.data('page');
            (new AjaxRequest(this.ajaxUrl)).post({
                action: 'show_change_group_selector',
                page: page,
                groupUid: $element.data('groupId'),
                groupname: $element.data('groupname'),
            }).then(async (response) => {
                // Replace content
                jquery('#g_' + page).replaceWith(await response.resolve());
            });
        }
        /**
         * Group-related: Update the HTML view and show the original group
         */
        restoreGroup($element) {
            let page = $element.data('page');
            let groupname = $element.data('groupname');
            let groupnameHtml = groupname;
            if (typeof groupname === 'undefined') {
                groupname = jquery('<span>', {
                    'class': 'not_set',
                    'text': '[not set]',
                });
                groupnameHtml = groupname.html();
                groupname = groupname.text();
            }
            let html = jquery('<span/>', {
                'id': 'g_' + page,
            });
            let aSelector = jquery('<a/>', {
                'class': 'ug_selector changegroup',
                'data-page': page,
                'data-group': $element.data('groupId'),
                'data-groupname': groupnameHtml,
                'text': groupname,
            });
            html.append(aSelector);
            // Replace content
            jquery('#g_' + page).replaceWith(html);
        }
        /**
         * initializes events using deferred bound to document
         * so AJAX reloads are no problem
         */
        initializeEvents() {
            // Click events to change permissions (in template Index.html)
            jquery(this.options.containerSelector).on('click', '.change-permission', (evt) => {
                evt.preventDefault();
                this.setPermissions(jquery(evt.currentTarget));
            }).on('click', '.editlock', (evt) => {
                // Click event for lock state
                evt.preventDefault();
                this.toggleEditLock(jquery(evt.currentTarget));
            }).on('click', '.changeowner', (evt) => {
                // Click event to change owner
                evt.preventDefault();
                this.showChangeOwnerSelector(jquery(evt.currentTarget));
            }).on('click', '.changegroup', (evt) => {
                // click event to change group
                evt.preventDefault();
                this.showChangeGroupSelector(jquery(evt.currentTarget));
            }).on('click', '.restoreowner', (evt) => {
                // Add click handler for restoring previous owner
                evt.preventDefault();
                this.restoreOwner(jquery(evt.currentTarget));
            }).on('click', '.saveowner', (evt) => {
                // Add click handler for saving owner
                evt.preventDefault();
                this.changeOwner(jquery(evt.currentTarget));
            }).on('click', '.restoregroup', (evt) => {
                // Add click handler for restoring previous group
                evt.preventDefault();
                this.restoreGroup(jquery(evt.currentTarget));
            }).on('click', '.savegroup', (evt) => {
                // Add click handler for saving group
                evt.preventDefault();
                this.changeGroup(jquery(evt.currentTarget));
            });
            // Click events to change permissions (in template Edit.html)
            jquery(this.options.editControllerSelector).on('click', '[data-check-change-permissions]', (evt) => {
                const $target = jquery(evt.currentTarget);
                const args = $target.data('checkChangePermissions').split(',').map((item) => item.trim());
                this.checkChange.apply(this, args);
            });
        }
    }
    let permissionObject = new Permissions();
    // expose to global
    TYPO3.Permissions = permissionObject;

    return permissionObject;

});
