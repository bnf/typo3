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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as r,nothing as i,html as l}from"lit";import"@typo3/backend/live-search/element/result/item/action/action-container.js";var o=function(e,t,r,i){var l,o=arguments.length,c=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,r,i);else for(var n=e.length-1;n>=0;n--)(l=e[n])&&(c=(o<3?l(c):o>3?l(t,r,c):l(t,r))||c);return o>3&&c&&Object.defineProperty(t,r,c),c};const c="typo3-backend-live-search-result-item-detail-container";let n=class extends r{constructor(){super(...arguments),this.resultItem=null}createRenderRoot(){return this}render(){return null===this.resultItem?i:l`<div class=livesearch-detail-preamble><typo3-backend-icon identifier=${this.resultItem.icon.identifier} overlay=${this.resultItem.icon.overlay} size=large></typo3-backend-icon><h3>${this.resultItem.itemTitle}</h3><p class=livesearch-detail-preamble-type>${this.resultItem.typeLabel}</p></div><typo3-backend-live-search-result-item-action-container .resultItem=${this.resultItem}></typo3-backend-live-search-result-item-action-container>`}};o([e({type:Object,attribute:!1})],n.prototype,"resultItem",void 0),n=o([t("typo3-backend-live-search-result-item-detail-container")],n);export{n as ResultDetailContainer,c as componentName};