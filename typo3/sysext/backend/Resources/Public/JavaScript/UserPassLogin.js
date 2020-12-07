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
define(["jquery","./Login"],(function(e,s){"use strict";class t{constructor(){this.resetPassword=()=>{const t=e(this.options.passwordField);t.val()&&(e(s.options.useridentField).val(t.val()),t.val(""))},this.showCapsLockWarning=s=>{e(s.target).parent().parent().find(".t3js-login-alert-capslock").toggleClass("hidden",!t.isCapslockEnabled(s))},this.toggleCopyright=e=>{" "===e.key&&e.target.click()},this.options={passwordField:".t3js-login-password-field",usernameField:".t3js-login-username-field",copyrightLink:"t3js-login-copyright-link"},s.options.submitHandler=this.resetPassword;const i=e(this.options.usernameField),n=e(this.options.passwordField),o=document.getElementsByClassName(this.options.copyrightLink)[0];i.on("keypress",this.showCapsLockWarning),n.on("keypress",this.showCapsLockWarning),o.addEventListener("keydown",this.toggleCopyright);try{parent.opener&&parent.opener.TYPO3&&parent.opener.TYPO3.configuration&&parent.opener.TYPO3.configuration.username&&i.val(parent.opener.TYPO3.configuration.username)}catch(e){}""===i.val()?i.focus():n.focus()}static isCapslockEnabled(e){const s=e||window.event;if(!s)return!1;let t=-1;s.which?t=s.which:s.keyCode&&(t=s.keyCode);let i=!1;return s.shiftKey?i=s.shiftKey:s.modifiers&&(i=!!(4&s.modifiers)),t>=65&&t<=90&&!i||t>=97&&t<=122&&i}}return new t}));