define(['jquery', './Login'], function ($, Login) { 'use strict';

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
    /**
     * Module: TYPO3/CMS/Backend/UserPassLogin
     * JavaScript module for the UsernamePasswordLoginProvider
     * @exports TYPO3/CMS/Backend/UserPassLogin
     */
    class UserPassLogin {
        constructor() {
            /**
             * Reset user password field to prevent it from being submitted
             */
            this.resetPassword = () => {
                const $passwordField = $__default['default'](this.options.passwordField);
                if ($passwordField.val()) {
                    $__default['default'](Login.options.useridentField).val($passwordField.val());
                    $passwordField.val('');
                }
            };
            this.showCapsLockWarning = (event) => {
                $__default['default'](event.target)
                    .parent()
                    .parent()
                    .find('.t3js-login-alert-capslock')
                    .toggleClass('hidden', !UserPassLogin.isCapslockEnabled(event));
            };
            this.options = {
                passwordField: '.t3js-login-password-field',
                usernameField: '.t3js-login-username-field',
            };
            // register submit handler
            Login.options.submitHandler = this.resetPassword;
            const $usernameField = $__default['default'](this.options.usernameField);
            const $passwordField = $__default['default'](this.options.passwordField);
            $usernameField.on('keypress', this.showCapsLockWarning);
            $passwordField.on('keypress', this.showCapsLockWarning);
            // if the login screen is shown in the login_frameset window for re-login,
            // then try to get the username of the current/former login from opening windows main frame:
            try {
                if (parent.opener
                    && parent.opener.TYPO3
                    && parent.opener.TYPO3.configuration
                    && parent.opener.TYPO3.configuration.username) {
                    $usernameField.val(parent.opener.TYPO3.configuration.username);
                }
            }
            catch (error) {
                // continue
            }
            if ($usernameField.val() === '') {
                $usernameField.focus();
            }
            else {
                $passwordField.focus();
            }
        }
        /**
         * Checks whether capslock is enabled (returns TRUE if enabled, false otherwise)
         * thanks to http://24ways.org/2007/capturing-caps-lock
         *
         * @param {Event} e
         * @returns {boolean}
         */
        static isCapslockEnabled(e) {
            const ev = e ? e : window.event;
            if (!ev) {
                return false;
            }
            // get key pressed
            let pressedKeyAsciiCode = -1;
            if (ev.which) {
                pressedKeyAsciiCode = ev.which;
            }
            else if (ev.keyCode) {
                pressedKeyAsciiCode = ev.keyCode;
            }
            // get shift status
            let shiftPressed = false;
            if (ev.shiftKey) {
                shiftPressed = ev.shiftKey;
            }
            else if (ev.modifiers) {
                /* tslint:disable:no-bitwise */
                shiftPressed = !!(ev.modifiers & 4);
            }
            return (pressedKeyAsciiCode >= 65 && pressedKeyAsciiCode <= 90 && !shiftPressed)
                || (pressedKeyAsciiCode >= 97 && pressedKeyAsciiCode <= 122 && shiftPressed);
        }
    }
    new UserPassLogin();

});
