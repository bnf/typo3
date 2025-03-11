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
var e=function(e,t,i,r){var s,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r)
else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(o=(a<3?s(o):a>3?s(t,i,o):s(t,i))||o)
return a>3&&o&&Object.defineProperty(t,i,o),o}
import{html as t,LitElement as i,nothing as r}from"lit"
import{customElement as s,property as a,state as o}from"lit/decorators.js"
import{live as n}from"lit/directives/live.js"
import"@typo3/backend/element/spinner-element.js"
import"@typo3/backend/element/icon-element.js"
import c from"@typo3/backend/notification.js"
import l from"@typo3/core/ajax/ajax-request.js"
import{copyToClipboard as d}from"@typo3/backend/copy-to-clipboard.js"
import{lll as h}from"@typo3/core/lit-helper.js"
import{markdown as p}from"@typo3/core/directive/markdown.js"
import"@typo3/backend/settings/editor/editable-setting.js"
import"@typo3/backend/element/icon-element.js"
import"@typo3/backend/settings/type/bool.js"
import"@typo3/backend/settings/type/int.js"
import"@typo3/backend/settings/type/number.js"
import"@typo3/backend/settings/type/string.js"
import"@typo3/backend/settings/type/stringlist.js"
let m=class extends i{constructor(){super(...arguments),this.customFormData={},this.debug=!1,this.searchTerm="",this.activeCategory="",this.visibleCategories={},this.observer=null}createRenderRoot(){return this}firstUpdated(){this.observer=new IntersectionObserver((e=>{e.forEach((e=>{const t=e.target.dataset.key
this.visibleCategories[t]=e.isIntersecting}))
const t=e=>e.reduce(((e,i)=>[...e,i.key,...t(i.categories)]),[]),i=t(this.categories).filter((e=>this.visibleCategories[e]))[0]||""
i&&(this.activeCategory=i)}),{root:document.querySelector(".module"),threshold:.1,rootMargin:`-${getComputedStyle(document.querySelector(".module-docheader")).getPropertyValue("min-height")} 0px 0px 0px`})}updated(){[...this.renderRoot.querySelectorAll(".settings-category")].map((e=>this.observer?.observe(e)))}renderCategoryTree(e,i){return t`<ul data-level="${i}">${e.map((e=>t`<li ?hidden="${e.__hidden}"><a href="${`#category-headline-${e.key}`}" @click="${()=>this.activeCategory=e.key}" class="settings-navigation-item ${this.activeCategory===e.key?"active":""}"><span class="settings-navigation-item-icon"><typo3-backend-icon identifier="${e.icon?e.icon:"actions-dot"}" size="small"></typo3-backend-icon></span><span class="settings-navigation-item-label">${e.label}</span> </a>${0===e.categories.length?r:t`${this.renderCategoryTree(e.categories,i+1)}`}</li>`))}</ul>`}renderSettings(e,i){return e.map((e=>t`<div class="settings-category-list" data-key="${e.key}"><div class="settings-category" data-key="${e.key}" ?hidden="${e.__hidden}">${this.renderHeadline(Math.min(i+1,6),`category-headline-${e.key}`,t`${e.label}`)}<div class="settings-category-description">${e.description?p(e.description,"minimal"):r}</div></div>${e.settings.map((e=>t`<typo3-backend-editable-setting ?hidden="${e.__hidden}" .setting="${e}" .dumpuri="${this.dumpUrl}" ?debug="${this.debug}"></typo3-backend-editable-setting>`))}</div>${0===e.categories.length?r:t`${this.renderSettings(e.categories,i+1)}`}`))}renderHeadline(e,i,r){switch(e){case 1:return t`<h1 id="${i}">${r}</h1>`
case 2:return t`<h2 id="${i}">${r}</h2>`
case 3:return t`<h3 id="${i}">${r}</h3>`
case 4:return t`<h4 id="${i}">${r}</h4>`
case 5:return t`<h5 id="${i}">${r}</h5>`
case 6:return t`<h6 id="${i}">${r}</h6>`
default:throw new Error(`Invalid header level: ${e}`)}}async onSubmit(e){const t=e.target
if("export"===e.submitter?.value){e.preventDefault()
const i=new FormData(t),r=await new l(this.dumpUrl).post(i),s=await r.resolve()
"string"==typeof s.yaml?d(s.yaml):(console.warn("Value can not be copied to clipboard.",typeof s.yaml),c.error(h("copyToClipboard.error")))}}async onSearch(e){e.preventDefault(),this.searchTerm=e.currentTarget.value}render(){const e=this.filterCategories(),i=e.filter((e=>!e.__hidden)).length>0
return t`<form class="settings-container" id="sitesettings_form" name="sitesettings_form" action="${this.actionUrl}" method="post" @submit="${e=>this.onSubmit(e)}">${Object.entries(this.customFormData).map((([name,value])=>t`<input type="hidden" name="${name}" value="${value}">`))}<div class="settings-search form-group"><label for="settings-search" class="visually-hidden">${h("edit.searchTermVisuallyHiddenLabel")}</label> <input type="search" id="settings-search" class="form-control" placeholder="${h("edit.searchTermPlaceholder")}" .value="${n(this.searchTerm)}" @change="${e=>this.onSearch(e)}" @input="${e=>this.onSearch(e)}"></div>${i?r:t`<div class="callout callout-info"><div class="callout-icon"><span class="icon-emphasized"><typo3-backend-icon identifier="actions-info" size="small"></typo3-backend-icon></span></div><div class="callout-content"><div class="callout-title">${h("edit.search.noResultsTitle")}</div><div class="callout-body"><p>${h("edit.search.noResultsMessage")}</p><button type="button" class="btn btn-default" @click="${()=>this.searchTerm=""}">${h("edit.search.noResultsResetButtonLabel")}</button></div></div></div>`}<div class="settings" ?hidden="${!i}"><div class="settings-navigation">${this.renderCategoryTree(e??[],1)}</div><div class="settings-body">${this.renderSettings(e??[],1)}</div></div></form>`}filterCategories(categories=null){return categories??=this.categories,categories.map((e=>{const t=this.filterSettings(e.settings),i=this.filterCategories(e.categories),r=t.filter((e=>!e.__hidden)).length>0,s=i.filter((e=>!e.__hidden)).length>0
return{...e,settings:t,categories:i,__hidden:!r&&!s}}))}filterSettings(e){return e.map((e=>({...e,__hidden:!(this.matchesSearchTerm(e.definition.key)||this.matchesSearchTerm(e.definition.label)||this.matchesSearchTerm(e.definition.description??"")||this.valueMatchesSearchTerm(e.value)||e.definition.tags.filter((e=>this.matchesSearchTerm(e))).length>0)})))}matchesSearchTerm(e){return""===this.searchTerm||this.matchesSubstring(e,this.searchTerm)}valueMatchesSearchTerm(e){return"string"==typeof e?this.matchesSearchTerm(e):!!Array.isArray(e)&&e.filter((e=>"string"==typeof e&&this.matchesSearchTerm(e))).length>0}matchesSubstring(e,t){return e.toLowerCase().includes(t.toLowerCase())}}
e([a({type:Array})],m.prototype,"categories",void 0),e([a({type:String,attribute:"action-url"})],m.prototype,"actionUrl",void 0),e([a({type:String,attribute:"dump-url"})],m.prototype,"dumpUrl",void 0),e([a({type:Object,attribute:"custom-form-data"})],m.prototype,"customFormData",void 0),e([a({type:Boolean})],m.prototype,"debug",void 0),e([o()],m.prototype,"searchTerm",void 0),e([o()],m.prototype,"activeCategory",void 0),m=e([s("typo3-backend-settings-editor")],m)
export{m as SettingsEditorElement}
