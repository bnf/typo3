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
define(["lit","lit/decorators"],(function(e,t){"use strict";var r,o=this&&this.__decorate||function(e,t,r,o){var s,n=arguments.length,c=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,o);else for(var i=e.length-1;i>=0;i--)(s=e[i])&&(c=(n<3?s(c):n>3?s(t,r,c):s(t,r))||c);return n>3&&c&&Object.defineProperty(t,r,c),c};!function(e){e.dashboardItem=".dashboard-item"}(r||(r={}));let s=class extends e.LitElement{constructor(){super(),this.addEventListener("click",e=>{e.preventDefault(),this.closest(r.dashboardItem).dispatchEvent(new Event("widgetRefresh",{bubbles:!0})),this.querySelector("button").blur()})}render(){return e.html`<slot></slot>`}};s=o([t.customElement("typo3-dashboard-widget-refresh")],s)}));