import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Client from './Storage/Client.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Severity from './Severity.esm.js';
import Modal from './Modal.esm.js';
import NotificationService from './Notification.esm.js';

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
var MarkupIdentifiers;
(function (MarkupIdentifiers) {
    MarkupIdentifiers["loginrefresh"] = "t3js-modal-loginrefresh";
    MarkupIdentifiers["lockedModal"] = "t3js-modal-backendlocked";
    MarkupIdentifiers["loginFormModal"] = "t3js-modal-backendloginform";
})(MarkupIdentifiers || (MarkupIdentifiers = {}));
/**
 * Module: TYPO3/CMS/Backend/LoginRefresh
 * @exports TYPO3/CMS/Backend/LoginRefresh
 */
class LoginRefresh {
    constructor() {
        this.options = {
            modalConfig: {
                backdrop: 'static',
            },
        };
        this.webNotification = null;
        this.intervalTime = 60;
        this.intervalId = null;
        this.backendIsLocked = false;
        this.isTimingOut = false;
        this.$timeoutModal = null;
        this.$backendLockedModal = null;
        this.$loginForm = null;
        this.loginFramesetUrl = '';
        this.logoutUrl = '';
        /**
         * Creates additional data based on the security level and "submits" the form
         * via an AJAX request.
         *
         * @param {JQueryEventObject} event
         */
        this.submitForm = (event) => {
            event.preventDefault();
            const $form = this.$loginForm.find('form');
            const $passwordField = $form.find('input[name=p_field]');
            const $useridentField = $form.find('input[name=userident]');
            const passwordFieldValue = $passwordField.val();
            if (passwordFieldValue === '' && $useridentField.val() === '') {
                NotificationService.error(TYPO3.lang['mess.refresh_login_failed'], TYPO3.lang['mess.refresh_login_emptyPassword']);
                $passwordField.focus();
                return;
            }
            if (passwordFieldValue) {
                $useridentField.val(passwordFieldValue);
                $passwordField.val('');
            }
            const postData = {
                login_status: 'login',
            };
            jQuery.each($form.serializeArray(), function (i, field) {
                postData[field.name] = field.value;
            });
            new AjaxRequest($form.attr('action')).post(postData).then(async (response) => {
                const data = await response.resolve();
                if (data.login.success) {
                    // User is logged in
                    this.hideLoginForm();
                }
                else {
                    NotificationService.error(TYPO3.lang['mess.refresh_login_failed'], TYPO3.lang['mess.refresh_login_failed_message']);
                    $passwordField.focus();
                }
            });
        };
        /**
         * Periodically called task that checks if
         *
         * - the user's backend session is about to expire
         * - the user's backend session has expired
         * - the backend got locked
         *
         * and opens a dialog.
         */
        this.checkActiveSession = () => {
            new AjaxRequest(TYPO3.settings.ajaxUrls.login_timedout).get().then(async (response) => {
                const data = await response.resolve();
                if (data.login.locked) {
                    if (!this.backendIsLocked) {
                        this.backendIsLocked = true;
                        this.showBackendLockedModal();
                    }
                }
                else {
                    if (this.backendIsLocked) {
                        this.backendIsLocked = false;
                        this.hideBackendLockedModal();
                    }
                }
                if (!this.backendIsLocked) {
                    if (data.login.timed_out || data.login.will_time_out) {
                        data.login.timed_out
                            ? this.showLoginForm()
                            : this.showTimeoutModal();
                    }
                }
            });
        };
    }
    /**
     * Initialize login refresh
     */
    initialize() {
        this.initializeTimeoutModal();
        this.initializeBackendLockedModal();
        this.initializeLoginForm();
        this.startTask();
        const askForNotifications = !(Client.isset('notifications.asked') && Client.get('notifications.asked') === 'yes');
        const isDefaultNotificationLevel = typeof Notification !== 'undefined' && Notification.permission === 'default';
        if (askForNotifications
            && document.location.protocol === 'https:'
            && isDefaultNotificationLevel) {
            Modal.confirm(TYPO3.lang['notification.request.title'], TYPO3.lang['notification.request.description'], Severity.info, [{
                    text: TYPO3.lang['button.yes'] || 'Yes',
                    btnClass: 'btn-' + Severity.getCssClass(Severity.info),
                    name: 'ok',
                    active: true,
                }, {
                    text: TYPO3.lang['button.no'] || 'No',
                    btnClass: 'btn-' + Severity.getCssClass(Severity.notice),
                    name: 'cancel'
                }]).on('confirm.button.ok', () => {
                Notification.requestPermission();
                Modal.dismiss();
            }).on('confirm.button.cancel', () => {
                Modal.dismiss();
            }).on('hide.bs.modal', () => {
                Client.set('notifications.asked', 'yes');
            });
        }
    }
    /**
     * Start the task
     */
    startTask() {
        if (this.intervalId !== null) {
            return;
        }
        // set interval to 60 seconds
        let interval = this.intervalTime * 1000;
        this.intervalId = window.setInterval(this.checkActiveSession, interval);
    }
    /**
     * Stop the task
     */
    stopTask() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    /**
     * Set interval time
     *
     * @param {number} intervalTime
     */
    setIntervalTime(intervalTime) {
        // To avoid the integer overflow in setInterval, we limit the interval time to be one request per day
        this.intervalTime = Math.min(intervalTime, 86400);
    }
    /**
     * Set the logout URL
     *
     * @param {string} logoutUrl
     */
    setLogoutUrl(logoutUrl) {
        this.logoutUrl = logoutUrl;
    }
    /**
     * Set login frameset url
     */
    setLoginFramesetUrl(loginFramesetUrl) {
        this.loginFramesetUrl = loginFramesetUrl;
    }
    /**
     * Shows the timeout dialog. If the backend is not focused, a Web Notification
     * is displayed, too.
     */
    showTimeoutModal() {
        this.isTimingOut = true;
        this.$timeoutModal.modal(this.options.modalConfig);
        this.fillProgressbar(this.$timeoutModal);
        if (document.location.protocol === 'https:' && typeof Notification !== 'undefined'
            && Notification.permission === 'granted' && document.hidden) {
            this.webNotification = new Notification(TYPO3.lang['mess.login_about_to_expire_title'], {
                body: TYPO3.lang['mess.login_about_to_expire'],
                icon: '/typo3/sysext/backend/Resources/Public/Images/Logo.png',
            });
            this.webNotification.onclick = () => {
                window.focus();
            };
        }
    }
    /**
     * Hides the timeout dialog. If a Web Notification is displayed, close it too.
     */
    hideTimeoutModal() {
        this.isTimingOut = false;
        this.$timeoutModal.modal('hide');
        if (typeof Notification !== 'undefined' && this.webNotification !== null) {
            this.webNotification.close();
        }
    }
    /**
     * Shows the "backend locked" dialog.
     */
    showBackendLockedModal() {
        this.$backendLockedModal.modal(this.options.modalConfig);
    }
    /**
     * Hides the "backend locked" dialog.
     */
    hideBackendLockedModal() {
        this.$backendLockedModal.modal('hide');
    }
    /**
     * Shows the login form.
     */
    showLoginForm() {
        // log off for sure
        new AjaxRequest(TYPO3.settings.ajaxUrls.logout).get().then(() => {
            TYPO3.configuration.showRefreshLoginPopup
                ? this.showLoginPopup()
                : this.$loginForm.modal(this.options.modalConfig);
        });
    }
    /**
     * Opens the login form in a new window.
     */
    showLoginPopup() {
        const vHWin = window.open(this.loginFramesetUrl, 'relogin_' + Math.random().toString(16).slice(2), 'height=450,width=700,status=0,menubar=0,location=1');
        if (vHWin) {
            vHWin.focus();
        }
    }
    /**
     * Hides the login form.
     */
    hideLoginForm() {
        this.$loginForm.modal('hide');
    }
    /**
     * Generates the modal displayed if the backend is locked.
     */
    initializeBackendLockedModal() {
        this.$backendLockedModal = this.generateModal(MarkupIdentifiers.lockedModal);
        this.$backendLockedModal.find('.modal-header h4').text(TYPO3.lang['mess.please_wait']);
        this.$backendLockedModal.find('.modal-body').append(jQuery('<p />').text(TYPO3.lang['mess.be_locked']));
        this.$backendLockedModal.find('.modal-footer').remove();
        jQuery('body').append(this.$backendLockedModal);
    }
    /**
     * Generates the modal displayed on near session time outs
     */
    initializeTimeoutModal() {
        this.$timeoutModal = this.generateModal(MarkupIdentifiers.loginrefresh);
        this.$timeoutModal.addClass('modal-severity-notice');
        this.$timeoutModal.find('.modal-header h4').text(TYPO3.lang['mess.login_about_to_expire_title']);
        this.$timeoutModal.find('.modal-body').append(jQuery('<p />').text(TYPO3.lang['mess.login_about_to_expire']), jQuery('<div />', { class: 'progress' }).append(jQuery('<div />', {
            class: 'progress-bar progress-bar-warning progress-bar-striped active',
            role: 'progressbar',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
        }).append(jQuery('<span />', { class: 'sr-only' }))));
        this.$timeoutModal.find('.modal-footer').append(jQuery('<button />', {
            class: 'btn btn-default',
            'data-action': 'logout',
        }).text(TYPO3.lang['mess.refresh_login_logout_button']).on('click', () => {
            top.location.href = this.logoutUrl;
        }), jQuery('<button />', {
            class: 'btn btn-primary t3js-active',
            'data-action': 'refreshSession',
        }).text(TYPO3.lang['mess.refresh_login_refresh_button']).on('click', () => {
            new AjaxRequest(TYPO3.settings.ajaxUrls.login_timedout).get().then(() => {
                this.hideTimeoutModal();
            });
        }));
        this.registerDefaultModalEvents(this.$timeoutModal);
        jQuery('body').append(this.$timeoutModal);
    }
    /**
     * Generates the login form displayed if the session has timed out.
     */
    initializeLoginForm() {
        if (TYPO3.configuration.showRefreshLoginPopup) {
            // dialog is not required if "showRefreshLoginPopup" is enabled
            return;
        }
        this.$loginForm = this.generateModal(MarkupIdentifiers.loginFormModal);
        this.$loginForm.addClass('modal-notice');
        let refresh_login_title = String(TYPO3.lang['mess.refresh_login_title']).replace('%s', TYPO3.configuration.username);
        this.$loginForm.find('.modal-header h4').text(refresh_login_title);
        this.$loginForm.find('.modal-body').append(jQuery('<p />').text(TYPO3.lang['mess.login_expired']), jQuery('<form />', {
            id: 'beLoginRefresh',
            method: 'POST',
            action: TYPO3.settings.ajaxUrls.login,
        }).append(jQuery('<div />', { class: 'form-group' }).append(jQuery('<input />', {
            type: 'password',
            name: 'p_field',
            autofocus: 'autofocus',
            class: 'form-control',
            placeholder: TYPO3.lang['mess.refresh_login_password'],
            'data-rsa-encryption': 't3-loginrefres-userident',
        })), jQuery('<input />', { type: 'hidden', name: 'username', value: TYPO3.configuration.username }), jQuery('<input />', { type: 'hidden', name: 'userident', id: 't3-loginrefres-userident' })));
        this.$loginForm.find('.modal-footer').append(jQuery('<a />', {
            href: this.logoutUrl,
            class: 'btn btn-default',
        }).text(TYPO3.lang['mess.refresh_exit_button']), jQuery('<button />', { type: 'button', class: 'btn btn-primary', 'data-action': 'refreshSession' })
            .text(TYPO3.lang['mess.refresh_login_button'])
            .on('click', () => {
            this.$loginForm.find('form').trigger('submit');
        }));
        this.registerDefaultModalEvents(this.$loginForm).on('submit', this.submitForm);
        jQuery('body').append(this.$loginForm);
        if (window.require.specified('TYPO3/CMS/Rsaauth/RsaEncryptionModule')) {
            window.require(['TYPO3/CMS/Rsaauth/RsaEncryptionModule'], function (RsaEncryption) {
                RsaEncryption.registerForm(jQuery('#beLoginRefresh').get(0));
            });
        }
    }
    /**
     * Generates a modal dialog as template.
     *
     * @param {string} identifier
     * @returns {JQuery}
     */
    generateModal(identifier) {
        return jQuery('<div />', {
            id: identifier,
            class: 't3js-modal ' + identifier + ' modal modal-type-default modal-severity-notice modal-style-light modal-size-small fade',
        }).append(jQuery('<div />', { class: 'modal-dialog' }).append(jQuery('<div />', { class: 'modal-content' }).append(jQuery('<div />', { class: 'modal-header' }).append(jQuery('<h4 />', { class: 'modal-title' })), jQuery('<div />', { class: 'modal-body' }), jQuery('<div />', { class: 'modal-footer' }))));
    }
    /**
     * Fills the progressbar attached to the given modal.
     */
    fillProgressbar($activeModal) {
        if (!this.isTimingOut) {
            return;
        }
        const max = 100;
        let current = 0;
        const $progressBar = $activeModal.find('.progress-bar');
        const $srText = $progressBar.children('.sr-only');
        const progress = window.setInterval(() => {
            const isOverdue = (current >= max);
            if (!this.isTimingOut || isOverdue) {
                clearInterval(progress);
                if (isOverdue) {
                    // show login form
                    this.hideTimeoutModal();
                    this.showLoginForm();
                }
                // reset current
                current = 0;
            }
            else {
                current += 1;
            }
            const percentText = (current) + '%';
            $progressBar.css('width', percentText);
            $srText.text(percentText);
        }, 300);
    }
    /**
     * Registers the (shown|hidden).bs.modal events.
     * If a modal is shown, the interval check is stopped. If the modal hides,
     * the interval check starts again.
     * This method is not invoked for the backend locked modal, because we still
     * need to check if the backend gets unlocked again.
     *
     * @param {JQuery} $modal
     * @returns {JQuery}
     */
    registerDefaultModalEvents($modal) {
        $modal.on('hidden.bs.modal', () => {
            this.startTask();
        }).on('shown.bs.modal', () => {
            this.stopTask();
            // focus the button which was configured as active button
            this.$timeoutModal.find('.modal-footer .t3js-active').first().focus();
        });
        return $modal;
    }
}
let loginRefreshObject;
try {
    // fetch from opening window
    if (window.opener && window.opener.TYPO3 && window.opener.TYPO3.LoginRefresh) {
        loginRefreshObject = window.opener.TYPO3.LoginRefresh;
    }
    // fetch from parent
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.LoginRefresh) {
        loginRefreshObject = parent.window.TYPO3.LoginRefresh;
    }
    // fetch object from outer frame
    if (top && top.TYPO3 && top.TYPO3.LoginRefresh) {
        loginRefreshObject = top.TYPO3.LoginRefresh;
    }
}
catch (_a) {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!loginRefreshObject) {
    loginRefreshObject = new LoginRefresh();
    // attach to global frame
    if (typeof TYPO3 !== 'undefined') {
        TYPO3.LoginRefresh = loginRefreshObject;
    }
}
var loginRefreshObject$1 = loginRefreshObject;

export default loginRefreshObject$1;
