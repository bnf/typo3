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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as c,html as o}from"lit";import"@typo3/backend/element/icon-element.js";var r=function(e,t,c,o){var r,i=arguments.length,n=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,c):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,c,o);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(n=(i<3?r(n):i>3?r(t,c,n):r(t,c))||n);return i>3&&n&&Object.defineProperty(t,c,n),n};let i=class extends c{connectedCallback(){super.connectedCallback(),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("focus",this.onFocus)}disconnectedCallback(){this.removeEventListener("focus",this.onFocus),super.disconnectedCallback()}createRenderRoot(){return this}render(){return o`<div class=livesearch-expand-action @click=${e=>{e.stopPropagation(),this.focus()}}><typo3-backend-icon identifier=actions-chevron-right size=small></typo3-backend-icon></div>`}onFocus(e){const t=e.target;t.parentElement.querySelector(".active")?.classList.remove("active"),t.classList.add("active")}};r([e({type:Object,attribute:!1})],i.prototype,"resultItem",void 0),i=r([t("typo3-backend-live-search-result-item")],i);export{i as Item};