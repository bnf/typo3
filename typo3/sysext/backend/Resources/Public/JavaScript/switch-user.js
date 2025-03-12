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
var t,e=function(t,e,r,s){var i,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,s);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(n=(o<3?i(n):o>3?i(e,r,n):i(e,r))||n);return o>3&&n&&Object.defineProperty(e,r,n),n};import{html as r,css as s,LitElement as i}from"lit";import{customElement as o,property as n}from"lit/decorators.js";import c from"@typo3/core/ajax/ajax-request.js";import a from"@typo3/backend/notification.js";!function(t){t.switch="switch",t.exit="exit"}(t||(t={}));let h=class extends i{static{this.styles=[s`:host{appearance:button;cursor:pointer}`]}constructor(){super(),this.mode=t.switch,this.addEventListener("click",(e=>{e.preventDefault(),this.mode===t.switch?this.handleSwitchUser():this.mode===t.exit&&this.handleExitSwitchUser()})),this.addEventListener("keydown",(e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this.mode===t.switch?this.handleSwitchUser():this.mode===t.exit&&this.handleExitSwitchUser())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return r`<slot></slot>`}handleSwitchUser(){this.targetUser?new c(TYPO3.settings.ajaxUrls.switch_user).post({targetUser:this.targetUser}).then((async t=>{const e=await t.resolve();!0===e.success&&e.url?top.window.location.href=e.url:a.error("Switching to user went wrong.")})):a.error("Switching to user went wrong.")}handleExitSwitchUser(){new c(TYPO3.settings.ajaxUrls.switch_user_exit).post({}).then((async t=>{const e=await t.resolve();!0===e.success&&e.url?top.window.location.href=e.url:a.error("Exiting current user went wrong.")}))}};e([n({type:String})],h.prototype,"targetUser",void 0),e([n({type:t})],h.prototype,"mode",void 0),h=e([o("typo3-backend-switch-user")],h);export{h as SwitchUser};