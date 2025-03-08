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
var e=function(e,t,i,n){var r,o=arguments.length,s=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n)
else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(s=(o<3?r(s):o>3?r(t,i,s):r(t,i))||s)
return o>3&&s&&Object.defineProperty(t,i,s),s}
import t from"@typo3/backend/live-search/live-search-configurator.js"
import i from"@typo3/backend/viewport.js"
import{customElement as n,property as r,query as o}from"lit/decorators.js"
import{html as s,LitElement as l,nothing as c}from"lit"
import{lll as a}from"@typo3/core/lit-helper.js"
import"@typo3/backend/live-search/element/result/item/item-container.js"
import"@typo3/backend/live-search/element/result/result-detail-container.js"
export const componentName="typo3-backend-live-search-result-container"
let d=class extends l{constructor(){super(...arguments),this.results=null,this.loading=!1}connectedCallback(){super.connectedCallback(),this.addEventListener("livesearch:request-actions",this.onActionsRequested),this.addEventListener("livesearch:invoke-action",this.onActionInvoked)}disconnectedCallback(){this.removeEventListener("livesearch:request-actions",this.onActionsRequested),this.removeEventListener("livesearch:invoke-action",this.onActionInvoked),super.disconnectedCallback()}createRenderRoot(){return this}render(){return this.loading?s`<div class="d-flex flex-fill align-items-center justify-content-center"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`:null===this.results?c:0===this.results.length?s`<div class="alert alert-info">${a("liveSearch_listEmptyText")}</div>`:s`<typo3-backend-live-search-result-item-container .results="${this.results}"></typo3-backend-live-search-result-item-container><typo3-backend-live-search-result-item-detail-container></typo3-backend-live-search-result-item-detail-container>`}onActionsRequested(e){this.resultDetailContainer.resultItem=e.detail.resultItem}onActionInvoked(e){const n=t.getInvokeHandlers(),r=e.detail.resultItem,o=e.detail.action
void 0!==o&&("function"==typeof n[r.provider+"_"+o.identifier]?n[r.provider+"_"+o.identifier](r,o):i.ContentContainer.setUrl(o.url),this.dispatchEvent(new CustomEvent("live-search:item-chosen",{detail:{resultItem:r}})))}}
e([r({type:Object})],d.prototype,"results",void 0),e([r({type:Boolean,attribute:!1})],d.prototype,"loading",void 0),e([o("typo3-backend-live-search-result-item-container")],d.prototype,"itemContainer",void 0),e([o("typo3-backend-live-search-result-item-detail-container")],d.prototype,"resultDetailContainer",void 0),d=e([n("typo3-backend-live-search-result-container")],d)
export{d as ResultContainer}
