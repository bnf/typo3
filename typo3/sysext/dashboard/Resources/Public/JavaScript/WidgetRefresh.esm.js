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
var Selectors,__decorate=this&&this.__decorate||function(e,t,r,o){var s,c=arguments.length,l=c<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(l=(c<3?s(l):c>3?s(t,r,l):s(t,r))||l);return c>3&&l&&Object.defineProperty(t,r,l),l};import{html,LitElement}from"lit.esm.js";import{customElement}from"lit/decorators.esm.js";!function(e){e.dashboardItem=".dashboard-item"}(Selectors||(Selectors={}));let WidgetRefresh=class extends LitElement{constructor(){super(),this.addEventListener("click",e=>{e.preventDefault(),this.closest(Selectors.dashboardItem).dispatchEvent(new Event("widgetRefresh",{bubbles:!0})),this.querySelector("button").blur()})}render(){return html`<slot></slot>`}};WidgetRefresh=__decorate([customElement("typo3-dashboard-widget-refresh")],WidgetRefresh);