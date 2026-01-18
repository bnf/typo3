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
import{property as m,customElement as p}from"lit/decorators.js";import{LitElement as u,nothing as h,html as d}from"lit";import"@typo3/backend/live-search/element/result/item/action/action-container.js";var s=function(i,t,r,l){var n=arguments.length,e=n<3?t:l===null?l=Object.getOwnPropertyDescriptor(t,r):l,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(i,t,r,l);else for(var c=i.length-1;c>=0;c--)(o=i[c])&&(e=(n<3?o(e):n>3?o(t,r,e):o(t,r))||e);return n>3&&e&&Object.defineProperty(t,r,e),e};const f="typo3-backend-live-search-result-item-detail-container";let a=class extends u{resultItem=null;createRenderRoot(){return this}render(){return this.resultItem===null?h:d`<div class=livesearch-detail-preamble><typo3-backend-icon identifier=${this.resultItem.icon.identifier} overlay=${this.resultItem.icon.overlay} size=large></typo3-backend-icon><h3>${this.resultItem.itemTitle}</h3><p class=livesearch-detail-preamble-type>${this.resultItem.typeLabel}</p></div><typo3-backend-live-search-result-item-action-container .resultItem=${this.resultItem}></typo3-backend-live-search-result-item-action-container>`}};s([m({type:Object,attribute:!1})],a.prototype,"resultItem",void 0),a=s([p("typo3-backend-live-search-result-item-detail-container")],a);export{a as ResultDetailContainer,f as componentName};
