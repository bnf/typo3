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
import{PseudoButtonLitElement as p}from"@typo3/backend/element/pseudo-button.js";import{property as u,customElement as d}from"lit/decorators.js";import f from"@typo3/core/ajax/ajax-request.js";import w from"@typo3/backend/notification.js";var l=function(i,e,t,n){var c=arguments.length,r=c<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,n);else for(var h=i.length-1;h>=0;h--)(a=i[h])&&(r=(c<3?a(r):c>3?a(e,t,r):a(e,t))||r);return c>3&&r&&Object.defineProperty(e,t,r),r},o;(function(i){i.switch="switch",i.exit="exit"})(o||(o={}));let s=class extends p{targetUser;mode=o.switch;buttonActivated(){this.mode===o.switch?this.handleSwitchUser():this.mode===o.exit&&this.handleExitSwitchUser()}handleSwitchUser(){if(!this.targetUser){w.error("Switching to user went wrong.");return}new f(TYPO3.settings.ajaxUrls.switch_user).post({targetUser:this.targetUser}).then(async e=>{const t=await e.resolve();t.success===!0&&t.url?top.window.location.href=t.url:w.error("Switching to user went wrong.")})}handleExitSwitchUser(){new f(TYPO3.settings.ajaxUrls.switch_user_exit).post({}).then(async e=>{const t=await e.resolve();t.success===!0&&t.url?top.window.location.href=t.url:w.error("Exiting current user went wrong.")})}};l([u({type:String})],s.prototype,"targetUser",void 0),l([u({type:o})],s.prototype,"mode",void 0),s=l([d("typo3-backend-switch-user")],s);export{s as SwitchUser};
