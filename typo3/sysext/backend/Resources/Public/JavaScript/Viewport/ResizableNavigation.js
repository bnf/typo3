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
var __decorate=function(t,e,i,n){var o,a=arguments.length,s=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(o=t[r])&&(s=(a<3?o(s):a>3?o(e,i,s):o(e,i))||s);return a>3&&s&&Object.defineProperty(e,i,s),s};import{html,LitElement}from"lit";import{customElement,property,state}from"lit/decorators.js";import{lll}from"@typo3/core/lit-helper.js";import Persistent from"@typo3/Backend/Storage/Persistent.js";import"@typo3/backend/Element/IconElement.js";const selectorConverter={fromAttribute:t=>document.querySelector(t)};let ResizableNavigation=class extends LitElement{constructor(){super(...arguments),this.minimumWidth=250,this.resizing=!1,this.toggleNavigation=t=>{t instanceof MouseEvent&&2===t.button||(t.stopPropagation(),this.parentContainer.classList.toggle("scaffold-content-navigation-expanded"))},this.fallbackNavigationSizeIfNeeded=t=>{let e=t.currentTarget;0!==this.getNavigationWidth()&&e.outerWidth<this.getNavigationWidth()+this.getNavigationPosition().left+this.minimumWidth&&this.autoNavigationWidth()},this.handleMouseMove=t=>{this.resizeNavigation(t.clientX)},this.handleTouchMove=t=>{this.resizeNavigation(t.changedTouches[0].clientX)},this.resizeNavigation=t=>{let e=Math.round(t)-Math.round(this.getNavigationPosition().left);this.setNavigationWidth(e)},this.startResizeNavigation=t=>{t instanceof MouseEvent&&2===t.button||(t.stopPropagation(),this.resizing=!0,document.addEventListener("mousemove",this.handleMouseMove,!1),document.addEventListener("mouseup",this.stopResizeNavigation,!1),document.addEventListener("touchmove",this.handleTouchMove,!1),document.addEventListener("touchend",this.stopResizeNavigation,!1))},this.stopResizeNavigation=()=>{this.resizing=!1,document.removeEventListener("mousemove",this.handleMouseMove,!1),document.removeEventListener("mouseup",this.stopResizeNavigation,!1),document.removeEventListener("touchmove",this.handleTouchMove,!1),document.removeEventListener("touchend",this.stopResizeNavigation,!1),Persistent.set(this.persistenceIdentifier,this.getNavigationWidth()),document.dispatchEvent(new CustomEvent("typo3:navigation:resized"))}}connectedCallback(){super.connectedCallback();const t=this.initialWidth||parseInt(Persistent.get(this.persistenceIdentifier),10);this.setNavigationWidth(t),window.addEventListener("resize",this.fallbackNavigationSizeIfNeeded,{passive:!0})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this.fallbackNavigationSizeIfNeeded)}createRenderRoot(){return this}async firstUpdated(){await new Promise(t=>setTimeout(t,0)),this.querySelector(".scaffold-content-navigation-switcher-btn").addEventListener("touchstart",this.toggleNavigation,{passive:!0}),this.querySelector(".scaffold-content-navigation-drag").addEventListener("touchstart",this.startResizeNavigation,{passive:!0})}render(){return html`
      <div class="scaffold-content-navigation-switcher">
        <button @mouseup="${this.toggleNavigation}" class="btn btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-open" role="button" title="${lll("viewport_navigation_show")}">
          <typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon>
        </button>
        <button @mouseup="${this.toggleNavigation}" class="btn btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-close" role="button" title="${lll("viewport_navigation_hide")}">
          <typo3-backend-icon identifier="actions-chevron-left" size="small"></typo3-backend-icon>
        </button>
      </div>
      <div @mousedown="${this.startResizeNavigation}" class="scaffold-content-navigation-drag ${this.resizing?"resizing":""}"></div>
    `}getNavigationPosition(){return this.navigationContainer.getBoundingClientRect()}getNavigationWidth(){return this.navigationContainer.offsetWidth}autoNavigationWidth(){this.navigationContainer.style.width="auto"}setNavigationWidth(t){const e=Math.round(this.parentContainer.getBoundingClientRect().width/2);t>e&&(t=e),t=t>this.minimumWidth?t:this.minimumWidth,this.navigationContainer.style.width=t+"px"}};__decorate([property({type:Number,attribute:"minimum-width"})],ResizableNavigation.prototype,"minimumWidth",void 0),__decorate([property({type:Number,attribute:"initial-width"})],ResizableNavigation.prototype,"initialWidth",void 0),__decorate([property({type:String,attribute:"persistence-identifier"})],ResizableNavigation.prototype,"persistenceIdentifier",void 0),__decorate([property({attribute:"parent",converter:selectorConverter})],ResizableNavigation.prototype,"parentContainer",void 0),__decorate([property({attribute:"navigation",converter:selectorConverter})],ResizableNavigation.prototype,"navigationContainer",void 0),__decorate([state()],ResizableNavigation.prototype,"resizing",void 0),ResizableNavigation=__decorate([customElement("typo3-backend-navigation-switcher")],ResizableNavigation);