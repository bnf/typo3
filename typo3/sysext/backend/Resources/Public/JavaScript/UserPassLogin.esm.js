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
import $ from"jquery";import Login from"TYPO3/CMS/Backend/Login";class UserPassLogin{constructor(){this.resetPassword=()=>{const e=$(this.options.passwordField);e.val()&&($(Login.options.useridentField).val(e.val()),e.val(""))},this.showCapsLockWarning=e=>{$(e.target).parent().parent().find(".t3js-login-alert-capslock").toggleClass("hidden",!UserPassLogin.isCapslockEnabled(e))},this.toggleCopyright=e=>{" "===e.key&&e.target.click()},this.options={passwordField:".t3js-login-password-field",usernameField:".t3js-login-username-field",copyrightLink:"t3js-login-copyright-link"},Login.options.submitHandler=this.resetPassword;const e=$(this.options.usernameField),s=$(this.options.passwordField),o=document.getElementsByClassName(this.options.copyrightLink)[0];e.on("keypress",this.showCapsLockWarning),s.on("keypress",this.showCapsLockWarning),o.addEventListener("keydown",this.toggleCopyright);try{parent.opener&&parent.opener.TYPO3&&parent.opener.TYPO3.configuration&&parent.opener.TYPO3.configuration.username&&e.val(parent.opener.TYPO3.configuration.username)}catch(e){}""===e.val()?e.focus():s.focus()}static isCapslockEnabled(e){const s=e||window.event;if(!s)return!1;let o=-1;s.which?o=s.which:s.keyCode&&(o=s.keyCode);let i=!1;return s.shiftKey?i=s.shiftKey:s.modifiers&&(i=!!(4&s.modifiers)),o>=65&&o<=90&&!i||o>=97&&o<=122&&i}}export default new UserPassLogin;