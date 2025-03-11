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
var t=function(t,e,a,n){var i,s=arguments.length,o=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,a):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,a,n)
else for(var d=t.length-1;d>=0;d--)(i=t[d])&&(o=(s<3?i(o):s>3?i(e,a,o):i(e,a))||o)
return s>3&&o&&Object.defineProperty(e,a,o),o}
import{customElement as e,property as a,state as n}from"lit/decorators.js"
import{LitElement as i,html as s,nothing as o}from"lit"
import{classMap as d}from"lit/directives/class-map.js"
let l=class extends i{constructor(){super(...arguments),this.configurationIsWritable=!1,this.data=null,this.addLanguagesActive=!1}createRenderRoot(){return this}render(){return s`<div><h2>Active languages</h2><div class="table-fit"><table class="table table-striped"><thead><tr><th><div class="btn-group">${this.globalActions()}</div></th><th>Locale</th><th>Dependencies</th><th>Last update</th></tr></thead><tbody>${this.renderLanguages()}</tbody></table></div></div>`}globalActions(){const t={btn:!0,"btn-default":!0,"update-all":!0,disabled:!this.hasActiveLanguages()}
return s`${this.configurationIsWritable?s`<button class="btn btn-default t3js-languagePacks-addLanguage-toggle" @click="${()=>this.addLanguagesActive=!this.addLanguagesActive}"><typo3-backend-icon identifier="${this.addLanguagesActive?"actions-minus":"actions-plus"}" size="small"></typo3-backend-icon>Add language</button>`:o} <button class="${d(t)}" ?disabled="${!this.hasActiveLanguages()}" @click="${()=>this.dispatchEvent(new CustomEvent("download-packs"))}"><typo3-backend-icon identifier="actions-download" size="small"></typo3-backend-icon>Update all</button>`}renderLanguageActions(t){const e=[],{iso}=t,a={detail:{iso}}
return t.active?(this.configurationIsWritable&&e.push(s`<button class="btn btn-default" title="Deactivate" @click="${()=>this.dispatchEvent(new CustomEvent("deactivate-language",a))}"><typo3-backend-icon identifier="actions-minus" size="small"></typo3-backend-icon></button>`),e.push(s`<button class="btn btn-default" title="Download language packs" @click="${()=>this.dispatchEvent(new CustomEvent("download-packs",a))}"><typo3-backend-icon identifier="actions-download" size="small"></typo3-backend-icon></button>`)):this.configurationIsWritable&&e.push(s`<button class="btn btn-default" title="Activate" @click="${()=>this.dispatchEvent(new CustomEvent("activate-language",a))}"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon></button>`),e}renderLanguages(){return this.data.languages.filter((t=>this.addLanguagesActive?!t.active:t.active)).map((t=>s`<tr class="${d({"t3-languagePacks-inactive":!t.active})}"><td><div class="btn-group">${this.renderLanguageActions(t)}</div>${t.name}</td><td>${t.iso}</td><td>${t.dependencies.join(", ")}</td><td>${null===t.lastUpdate?"":t.lastUpdate}</td></tr>`))}hasActiveLanguages(){return Array.isArray(this.data.activeLanguages)&&this.data.activeLanguages.length}}
t([a({type:Boolean})],l.prototype,"configurationIsWritable",void 0),t([a({type:Object})],l.prototype,"data",void 0),t([n()],l.prototype,"addLanguagesActive",void 0),l=t([e("typo3-install-language-matrix")],l)
export{l as LanguageMatrixElement}
let c=class extends i{constructor(){super(...arguments),this.data=null}createRenderRoot(){return this}render(){return 0===this.data.extensions.length?s`<typo3-install-infobox severity="0" subject="Language packs have been found for every installed extension." content="To download the latest changes, use the refresh button in the list above."></typo3-install-infobox>`:s`<div><h2>Translation status</h2><div class="table-fit"><table class="table table-striped"><thead><tr><th>Extension</th><th>Key</th>${this.headerActions()}</tr></thead><tbody>${this.renderExtensions()}</tbody></table></div></div>`}headerActions(){return this.data.activeLanguages.map((t=>s`<th><button class="btn btn-default" title="Download and update all language packs" @click="${()=>this.dispatchEvent(new CustomEvent("download-packs",{detail:{iso:t}}))}"><typo3-backend-icon identifier="actions-download" size="small"></typo3-backend-icon>${t}</button></th>`))}renderExtensions(){return this.data.extensions.map((t=>s`<tr><td>${t.icon?s`<img src="${t.icon}" alt="${t.title}" style="max-height:16px;max-width:16px">`:o} ${t.title}</td><td>${t.key}</td>${this.renderExtensionActions(t)}</tr>`))}renderExtensionActions(t){const e=[]
return this.data.activeLanguages.forEach((a=>{let n=o
t.packs.forEach((e=>{if(e.iso!==a)return
let i
i=!0!==e.exists?null!==e.lastUpdate?"No language pack available for "+e.iso+" when tried at "+e.lastUpdate+". Click to re-try.":"Language pack not downloaded. Click to download":null===e.lastUpdate?"Downloaded. Click to renew":"Language pack downloaded at "+e.lastUpdate+". Click to renew"
const o={detail:{iso:e.iso,extension:t.key}}
n=s`<td><button class="btn btn-default" title="${i}" @click="${()=>this.dispatchEvent(new CustomEvent("download-packs",o))}"><typo3-backend-icon identifier="actions-download" size="small"></typo3-backend-icon></button></td>`})),n===o&&(n=s`<td></td>`),e.push(n)})),e}}
t([a({type:Object})],c.prototype,"data",void 0),c=t([e("typo3-install-extension-matrix")],c)
export{c as ExtensionMatrixElement}
