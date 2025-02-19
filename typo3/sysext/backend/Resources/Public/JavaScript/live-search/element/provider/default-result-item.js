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
import{property as t,customElement as e}from"lit/decorators.js";import{LitElement as i,html as r}from"lit";import"@typo3/backend/element/icon-element.js";var o=function(t,e,i,r){var o,a=arguments.length,l=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,i,r);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(l=(a<3?o(l):a>3?o(e,i,l):o(e,i))||l);return a>3&&l&&Object.defineProperty(e,i,l),l};let a=class extends i{createRenderRoot(){return this}render(){return r`<div class=livesearch-result-item-icon><typo3-backend-icon title=${this.icon.title} identifier=${this.icon.identifier} overlay=${this.icon.overlay} size=small></typo3-backend-icon></div><div class=livesearch-result-item-title>${this.itemTitle}${void 0!==this.extraData.breadcrumb?r`<br><small>${this.extraData.breadcrumb}</small>`:""}</div>`}};o([t({type:Object,attribute:!1})],a.prototype,"icon",void 0),o([t({type:String,attribute:!1})],a.prototype,"itemTitle",void 0),o([t({type:String,attribute:!1})],a.prototype,"typeLabel",void 0),o([t({type:Object,attribute:!1})],a.prototype,"extraData",void 0),a=o([e("typo3-backend-live-search-result-item-default")],a);export{a as DefaultProviderResultItem};