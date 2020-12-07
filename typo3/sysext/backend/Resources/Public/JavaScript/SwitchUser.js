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
define(["lit","lit/decorators","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Notification"],(function(t,e,r,s){"use strict";var i,o=this&&this.__decorate||function(t,e,r,s){var i,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,s);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(n=(o<3?i(n):o>3?i(e,r,n):i(e,r))||n);return o>3&&n&&Object.defineProperty(e,r,n),n};!function(t){t.switch="switch",t.exit="exit"}(i||(i={}));let n=class extends t.LitElement{constructor(){super(),this.mode=i.switch,this.addEventListener("click",t=>{t.preventDefault(),this.mode===i.switch?this.handleSwitchUser():this.mode===i.exit&&this.handleExitSwitchUser()})}render(){return t.html`<slot></slot>`}handleSwitchUser(){this.targetUser?new r(TYPO3.settings.ajaxUrls.switch_user).post({targetUser:this.targetUser}).then(async t=>{const e=await t.resolve();!0===e.success&&e.url?top.window.location.href=e.url:s.error("Switching to user went wrong.")}):s.error("Switching to user went wrong.")}handleExitSwitchUser(){new r(TYPO3.settings.ajaxUrls.switch_user_exit).post({}).then(async t=>{const e=await t.resolve();!0===e.success&&e.url?top.window.location.href=e.url:s.error("Exiting current user went wrong.")})}};o([e.property({type:String})],n.prototype,"targetUser",void 0),o([e.property({type:i})],n.prototype,"mode",void 0),n=o([e.customElement("typo3-backend-switch-user")],n)}));