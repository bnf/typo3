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
var e=function(e,t,r,n){var l,s=arguments.length,i=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,n)
else for(var o=e.length-1;o>=0;o--)(l=e[o])&&(i=(s<3?l(i):s>3?l(t,r,i):l(t,r))||i)
return s>3&&i&&Object.defineProperty(t,r,i),i}
import"@typo3/backend/element/spinner-element.js"
import t from"@typo3/backend/live-search/live-search-configurator.js"
import{css as r,html as n,LitElement as l}from"lit"
import{customElement as s,property as i}from"lit/decorators.js"
import{until as o}from"lit/directives/until.js"
import"@typo3/backend/live-search/element/provider/default-result-item.js"
import"@typo3/backend/live-search/element/result/item/item.js"
export const componentName="typo3-backend-live-search-result-item-container"
let a=class extends l{constructor(){super(...arguments),this.results=null}connectedCallback(){super.connectedCallback(),this.addEventListener("scroll",this.onScroll)}disconnectedCallback(){this.removeEventListener("scroll",this.onScroll),super.disconnectedCallback()}createRenderRoot(){return this}render(){const e={},t=this.results.filter((e=>null!==e))
return t.length!==this.results.length&&console.warn('The result set contained "null" values, indicating something went wrong while building the search results. Affected values were removed to no break the user interface.'),t.forEach((t=>{t.typeLabel in e?e[t.typeLabel].push(t):e[t.typeLabel]=[t]})),n`<typo3-backend-live-search-result-list>${this.renderGroupedResults(e)}</typo3-backend-live-search-result-list>`}renderGroupedResults(e){const t=[]
for(const[type,results]of Object.entries(e)){const r=results.length
t.push(n`<h6 class="livesearch-result-item-group-label">${type} (${r})</h6>`),t.push(...results.map((e=>n`${o(this.renderResultItem(e),n`<typo3-backend-spinner></typo3-backend-spinner>`)}`)))}return n`${t}`}async renderResultItem(e){const r=t.getRenderers()
let l
return void 0!==r[e.provider]?(await import(r[e.provider].module),l=r[e.provider].callback(e)):l=n`<typo3-backend-live-search-result-item-default title="${e.typeLabel}: ${e.itemTitle}" .icon="${e.icon}" .itemTitle="${e.itemTitle}" .typeLabel="${e.typeLabel}" .extraData="${e.extraData}"></typo3-backend-live-search-result-item-default>`,n`<typo3-backend-live-search-result-item .resultItem="${e}" @click="${()=>this.invokeAction(e,e.actions[0])}" @focus="${()=>this.requestActions(e)}">${l}</typo3-backend-live-search-result-item>`}requestActions(e){this.parentElement.dispatchEvent(new CustomEvent("livesearch:request-actions",{detail:{resultItem:e}}))}invokeAction(e,t){this.parentElement.dispatchEvent(new CustomEvent("livesearch:invoke-action",{detail:{resultItem:e,action:t}}))}onScroll(e){this.querySelectorAll(".livesearch-result-item-group-label").forEach((t=>{t.classList.toggle("sticky",t.offsetTop<=e.target.scrollTop)}))}}
e([i({type:Object,attribute:!1})],a.prototype,"results",void 0),a=e([s("typo3-backend-live-search-result-item-container")],a)
export{a as ItemContainer}
let c=class extends l{static{this.styles=r`:host{display:block}`}connectedCallback(){this.parentContainer=this.closest("typo3-backend-live-search-result-container"),this.resultItemDetailContainer=this.parentContainer.querySelector("typo3-backend-live-search-result-item-detail-container"),super.connectedCallback(),this.addEventListener("keydown",this.handleKeyDown),this.addEventListener("keyup",this.handleKeyUp)}disconnectedCallback(){this.removeEventListener("keydown",this.handleKeyDown),this.removeEventListener("keyup",this.handleKeyUp),super.disconnectedCallback()}render(){return n`<slot></slot>`}handleKeyDown(e){if(!["ArrowDown","ArrowUp","ArrowRight"].includes(e.key))return
const t="typo3-backend-live-search-result-item"
if(document.activeElement.tagName.toLowerCase()!==t)return
let r
if(e.preventDefault(),"ArrowDown"===e.key){let n=document.activeElement.nextElementSibling
for(;null!==n&&n.tagName.toLowerCase()!==t;)n=n.nextElementSibling
r=n}else if("ArrowUp"===e.key){let l=document.activeElement.previousElementSibling
for(;null!==l&&l.tagName.toLowerCase()!==t;)l=l.previousElementSibling
null===(r=l)&&(r=document.querySelector("typo3-backend-live-search").querySelector('input[type="search"]'))}else"ArrowRight"===e.key&&(r=this.resultItemDetailContainer.querySelector("typo3-backend-live-search-result-item-action"))
null!==r&&r.focus()}handleKeyUp(e){if(!["Enter"," "].includes(e.key))return
e.preventDefault()
const t=e.target.resultItem
this.invokeAction(t)}invokeAction(e){this.parentContainer.dispatchEvent(new CustomEvent("livesearch:invoke-action",{detail:{resultItem:e,action:e.actions[0]}}))}}
c=e([s("typo3-backend-live-search-result-list")],c)
export{c as ResultList}
