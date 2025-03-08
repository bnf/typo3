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
var t=function(t,e,i,n){var o,a=arguments.length,s=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,n)
else for(var r=t.length-1;r>=0;r--)(o=t[r])&&(s=(a<3?o(s):a>3?o(e,i,s):o(e,i))||s)
return a>3&&s&&Object.defineProperty(e,i,s),s}
import{html as e,LitElement as i}from"lit"
import{customElement as n,property as o,state as a}from"lit/decorators.js"
import{lll as s}from"@typo3/core/lit-helper.js"
import r from"@typo3/backend/storage/persistent.js"
import"@typo3/backend/element/icon-element.js"
const c={fromAttribute:t=>document.querySelector(t)}
var d
!function(t){t.ltr="ltr",t.rtl="rtl"}(d||(d={}))
class h{static get(){return"rtl"===document.querySelector("html").dir?d.rtl:d.ltr}}let v=class extends i{constructor(){super(...arguments),this.minimumWidth=250,this.resizing=!1,this.toggleNavigation=t=>{if(t.stopPropagation(),this.parentContainer.classList.toggle("scaffold-content-navigation-expanded"),t.currentTarget instanceof HTMLElement){(t.currentTarget.nextElementSibling??t.currentTarget.previousElementSibling).focus()}},this.fallbackNavigationSizeIfNeeded=t=>{const e=t.currentTarget
0!==this.getNavigationWidth()&&e.outerWidth<this.getNavigationWidth()+this.getNavigationPosition().left+this.minimumWidth&&this.autoNavigationWidth()},this.handleMouseMove=t=>{this.resizeNavigation(t.clientX)},this.handleTouchMove=t=>{this.resizeNavigation(t.changedTouches[0].clientX)},this.resizeNavigation=t=>{let e=0
e=h.get()===d.ltr?Math.round(t)-Math.round(this.getNavigationPosition().left):Math.round(this.getNavigationPosition().right)-Math.round(t),this.setNavigationWidth(e)},this.startResizeNavigation=t=>{t instanceof MouseEvent&&2===t.button||(t.stopPropagation(),this.resizing=!0,document.addEventListener("mousemove",this.handleMouseMove,!1),document.addEventListener("mouseup",this.stopResizeNavigation,!1),document.addEventListener("touchmove",this.handleTouchMove,!1),document.addEventListener("touchend",this.stopResizeNavigation,!1))},this.stopResizeNavigation=()=>{this.resizing=!1,document.removeEventListener("mousemove",this.handleMouseMove,!1),document.removeEventListener("mouseup",this.stopResizeNavigation,!1),document.removeEventListener("touchmove",this.handleTouchMove,!1),document.removeEventListener("touchend",this.stopResizeNavigation,!1),r.set(this.persistenceIdentifier,this.getNavigationWidth()),document.dispatchEvent(new CustomEvent("typo3:navigation:resized"))}}connectedCallback(){super.connectedCallback()
const t=this.initialWidth||parseInt(r.get(this.persistenceIdentifier),10)
this.setNavigationWidth(t),window.addEventListener("resize",this.fallbackNavigationSizeIfNeeded,{passive:!0})}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this.fallbackNavigationSizeIfNeeded)}createRenderRoot(){return this}async firstUpdated(){await new Promise((t=>setTimeout(t,0))),this.querySelector(".scaffold-content-navigation-switcher-btn").addEventListener("touchstart",this.toggleNavigation,{passive:!0}),this.querySelector(".scaffold-content-navigation-drag").addEventListener("touchstart",this.startResizeNavigation,{passive:!0})}render(){return e`<div class="scaffold-content-navigation-switcher"><button @click="${this.toggleNavigation}" class="btn btn-sm btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-open" role="button" title="${s("viewport_navigation_show")}"><typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon></button> <button @click="${this.toggleNavigation}" class="btn btn-sm btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-close" role="button" title="${s("viewport_navigation_hide")}"><typo3-backend-icon identifier="actions-chevron-left" size="small"></typo3-backend-icon></button></div><div @mousedown="${this.startResizeNavigation}" class="scaffold-content-navigation-drag ${this.resizing?"resizing":""}"></div>`}getNavigationPosition(){return this.navigationContainer.getBoundingClientRect()}getNavigationWidth(){return this.navigationContainer.offsetWidth}autoNavigationWidth(){this.navigationContainer.style.width="auto"}setNavigationWidth(t){const e=Math.round(this.parentContainer.getBoundingClientRect().width/2)
t>e&&(t=e),t=t>this.minimumWidth?t:this.minimumWidth,this.navigationContainer.style.width=t+"px"}}
t([o({type:Number,attribute:"minimum-width"})],v.prototype,"minimumWidth",void 0),t([o({type:Number,attribute:"initial-width"})],v.prototype,"initialWidth",void 0),t([o({type:String,attribute:"persistence-identifier"})],v.prototype,"persistenceIdentifier",void 0),t([o({attribute:"parent",converter:c})],v.prototype,"parentContainer",void 0),t([o({attribute:"navigation",converter:c})],v.prototype,"navigationContainer",void 0),t([a()],v.prototype,"resizing",void 0),v=t([n("typo3-backend-navigation-switcher")],v)
export{v as ResizableNavigation}
