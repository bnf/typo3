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
var e=function(e,t,i,n){var o,s=arguments.length,a=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,n)
else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(a=(s<3?o(a):s>3?o(t,i,a):o(t,i))||a)
return s>3&&a&&Object.defineProperty(t,i,a),a}
import{html as t,LitElement as i,nothing as n}from"lit"
import{customElement as o,property as s,state as a}from"lit/decorators.js"
import{until as r}from"lit/directives/until.js"
import"@typo3/backend/element/spinner-element.js"
import"@typo3/backend/element/icon-element.js"
import{copyToClipboard as d}from"@typo3/backend/copy-to-clipboard.js"
import l from"@typo3/backend/notification.js"
import{lll as p}from"@typo3/core/lit-helper.js"
import{markdown as c}from"@typo3/core/directive/markdown.js"
import y from"@typo3/core/ajax/ajax-request.js"
let m=class extends i{constructor(){super(...arguments),this.debug=!1,this.hasChange=!1,this.typeElement=null}createRenderRoot(){return this}render(){const{value,systemDefault,definition}=this.setting
return t`<div class="${`settings-item settings-item-${definition.type} ${this.hasChange?"has-change":""}`}" tabindex="0" data-status="${JSON.stringify(value)===JSON.stringify(systemDefault)?"none":"modified"}"><div class="settings-item-indicator"></div><div class="settings-item-title"><label for="${`setting-${definition.key}`}" class="settings-item-label">${definition.label}</label><div class="settings-item-description">${c(definition.description??"","minimal")}</div>${this.debug?t`<div class="settings-item-key">${definition.key}</div>`:n}</div><div class="settings-item-control">${r(this.renderField(),t`<typo3-backend-spinner></typo3-backend-spinner>`)}</div><div class="settings-item-message"></div><div class="settings-item-actions">${this.renderActions()}</div></div>`}async renderField(){const{definition,value,typeImplementation}=this.setting
let e=this.typeElement
if(!e){const t=await import(typeImplementation)
if(!("componentName"in t))throw new Error(`module ${typeImplementation} is missing the "componentName" export`)
e=document.createElement(t.componentName),this.typeElement=e,e.addEventListener("typo3:setting:changed",(e=>{this.hasChange=JSON.stringify(this.setting.value)!==JSON.stringify(e.detail.value)}))}const i=Object.entries(definition.enum||{}),n={key:definition.key,formid:`setting-${definition.key}`,name:`settings[${definition.key}]`,value:Array.isArray(value)?JSON.stringify(value):String(value),debug:this.debug,readonly:definition.readonly,enum:i.length>0&&JSON.stringify(Object.fromEntries(i)),default:Array.isArray(definition.default)?JSON.stringify(definition.default):String(definition.default)}
for(const[key,value]of Object.entries(n))"boolean"!=typeof value?e.getAttribute(key)!==value&&e.setAttribute(key,value):(value&&!e.hasAttribute(key)&&e.setAttribute(key,""),!value&&e.hasAttribute(key)&&e.removeAttribute(key))
return e}renderActions(){const{definition}=this.setting
return t`<div class="dropdown"><button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon><span class="visually-hidden">More actions</span></button><ul class="dropdown-menu"><li><button class="dropdown-item dropdown-item-spaced" type="button" ?disabled="${definition.readonly}" @click="${()=>this.setToDefaultValue()}"><typo3-backend-icon identifier="actions-undo" size="small"></typo3-backend-icon>${p("edit.resetSetting")}</button></li><li><hr class="dropdown-divider"></li><li><typo3-copy-to-clipboard text="${definition.key}" class="dropdown-item dropdown-item-spaced"><typo3-backend-icon identifier="actions-clipboard" size="small"></typo3-backend-icon>${p("edit.copySettingsIdentifier")}</typo3-copy-to-clipboard></li>${this.dumpuri?t`<li><button class="dropdown-item dropdown-item-spaced" type="button" @click="${()=>this.copyAsYaml()}"><typo3-backend-icon identifier="actions-clipboard-paste" size="small"></typo3-backend-icon>${p("edit.copyAsYaml")}</button></li>`:n}</ul></div>`}setToDefaultValue(){this.typeElement&&(this.typeElement.value=this.setting.systemDefault)}async copyAsYaml(){const e=new FormData(this.typeElement.form),t=`settings[${this.setting.definition.key}]`,i=e.get(t),n=new FormData
n.append("specificSetting",this.setting.definition.key),n.append(t,i)
const o=await new y(this.dumpuri).post(n),s=await o.resolve()
"string"==typeof s.yaml?d(s.yaml):(console.warn("Value can not be copied to clipboard.",typeof s.yaml),l.error(p("copyToClipboard.error")))}}
e([s({type:Object})],m.prototype,"setting",void 0),e([s({type:String})],m.prototype,"dumpuri",void 0),e([s({type:Boolean})],m.prototype,"debug",void 0),e([a()],m.prototype,"hasChange",void 0),m=e([o("typo3-backend-editable-setting")],m)
export{m as EditableSettingElement}
