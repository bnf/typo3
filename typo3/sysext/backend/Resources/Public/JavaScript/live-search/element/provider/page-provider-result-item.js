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
var t=function(t,e,i,r){var o,a=arguments.length,l=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,i,r);else for(var n=t.length-1;n>=0;n--)(o=t[n])&&(l=(a<3?o(l):a>3?o(e,i,l):o(e,i))||l);return a>3&&l&&Object.defineProperty(e,i,l),l};import{customElement as e,property as i}from"lit/decorators.js";import{html as r,LitElement as o}from"lit";import"@typo3/backend/element/icon-element.js";let a=class extends o{createRenderRoot(){return this}render(){return r`<div class="livesearch-result-item-icon"><typo3-backend-icon title="${this.icon.title}" identifier="${this.icon.identifier}" overlay="${this.icon.overlay}" size="small"></typo3-backend-icon><typo3-backend-icon title="${this.extraData.flagIcon.title}" identifier="${this.extraData.flagIcon.identifier}" size="small"></typo3-backend-icon></div><div class="livesearch-result-item-title">${this.itemTitle}<br><small>${this.extraData.breadcrumb}</small></div>`}};t([i({type:Object,attribute:!1})],a.prototype,"icon",void 0),t([i({type:String,attribute:!1})],a.prototype,"itemTitle",void 0),t([i({type:String,attribute:!1})],a.prototype,"typeLabel",void 0),t([i({type:Object,attribute:!1})],a.prototype,"extraData",void 0),a=t([e("typo3-backend-live-search-result-item-page-provider")],a);export default a;