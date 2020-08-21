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
define(["jquery","./Login"],(function(e,s){"use strict";class n{constructor(){this.resetPassword=()=>{const n=e(this.options.passwordField);n.val()&&(e(s.options.useridentField).val(n.val()),n.val(""))},this.showCapsLockWarning=s=>{e(s.target).parent().parent().find(".t3js-login-alert-capslock").toggleClass("hidden",!n.isCapslockEnabled(s))},this.options={passwordField:".t3js-login-password-field",usernameField:".t3js-login-username-field"},s.options.submitHandler=this.resetPassword;const o=e(this.options.usernameField),i=e(this.options.passwordField);o.on("keypress",this.showCapsLockWarning),i.on("keypress",this.showCapsLockWarning);try{parent.opener&&parent.opener.TYPO3&&parent.opener.TYPO3.configuration&&parent.opener.TYPO3.configuration.username&&o.val(parent.opener.TYPO3.configuration.username)}catch(e){}""===o.val()?o.focus():i.focus()}static isCapslockEnabled(e){const s=e||window.event;if(!s)return!1;let n=-1;s.which?n=s.which:s.keyCode&&(n=s.keyCode);let o=!1;return s.shiftKey?o=s.shiftKey:s.modifiers&&(o=!!(4&s.modifiers)),n>=65&&n<=90&&!o||n>=97&&n<=122&&o}}return new n}));