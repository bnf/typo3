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
var __decorate=function(t,e,i,n){var o,s=arguments.length,r=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(s<3?o(r):s>3?o(e,i,r):o(e,i))||r);return s>3&&r&&Object.defineProperty(e,i,r),r};import{html,LitElement,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import{until}from"lit/directives/until.js";import"@typo3/backend/element/spinner-element.js";import"@typo3/backend/element/icon-element.js";import{copyToClipboard}from"@typo3/backend/copy-to-clipboard.js";import Notification from"@typo3/backend/notification.js";import{lll}from"@typo3/core/lit-helper.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";let EditableSettingElement=class extends LitElement{constructor(){super(...arguments),this.typeElement=null}createRenderRoot(){return this}render(){const{value:t,valueFromSets:e,definition:i}=this.setting;return html`
      <div
        class=${`settings-item settings-item-${i.type}`}
        id=${`setting-${i.key}`}
        tabindex="0"
        data-status=${t===e?"none":"modified"}
      >
        <!-- data-status=modified|error|none-->
        <div class="settings-item-indicator"></div>
        <div class="settings-item-title">
          <div class="settings-item-label">${i.label}</div>
          <div class="settings-item-description">${i.description}</div>
          <div class="settings-item-key">${i.key}</div>
        </div>
        <div class="settings-item-control">
          ${until(this.renderField(),html`<typo3-backend-spinner></typo3-backend-spinner>`)}
        </div>
        <div class="settings-item-message"></div>
        <div class="settings-item-actions">
          ${this.renderActions()}
        </div>
      </div>
    `}async renderField(){const{definition:t,value:e,typeImplementation:i}=this.setting;let n=this.typeElement;if(!n){const t=await import(i);if(!("componentName"in t))throw new Error(`module ${i} is missing the "componentName" export`);n=document.createElement(t.componentName),this.typeElement=n}return n.setAttribute("key",t.key),n.setAttribute("name",`settings[${t.key}]`),n.setAttribute("value",Array.isArray(e)?JSON.stringify(e):String(e)),n.setAttribute("default",Array.isArray(t.default)?JSON.stringify(t.default):String(t.default)),n}renderActions(){const{definition:t}=this.setting;return html`
      <div class="dropdown">
        <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon>
          <span class="visually-hidden">More actions</span>
        </button>
        <ul class="dropdown-menu">
          <li>
            <button class="dropdown-item dropdown-item-spaced"
              type="button"
              @click="${()=>this.setToDefaultValue()}">
              <typo3-backend-icon identifier="actions-undo" size="small"></typo3-backend-icon> Reset Setting
            </button>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <typo3-copy-to-clipboard
              text=${t.key}
              class="dropdown-item dropdown-item-spaced"
            >
              <typo3-backend-icon identifier="actions-clipboard" size="small"></typo3-backend-icon> Copy Settings Identifier
            </typo3-copy-to-clipboard>
          </li>
          ${this.dumpuri?html`
            <li>
              <button class="dropdown-item dropdown-item-spaced"
                type="button"
                @click="${()=>this.copyAsYaml()}">
                <typo3-backend-icon identifier="actions-clipboard-paste" size="small"></typo3-backend-icon> Copy as YAML
              </a>
            </li>
          `:nothing}
        </ul>
      </div>
    `}setToDefaultValue(){this.typeElement&&(this.typeElement.value=this.setting.valueFromSets)}async copyAsYaml(){const t=new FormData(this.typeElement.form),e=`settings[${this.setting.definition.key}]`,i=t.get(e),n=new FormData;n.append("specificSetting",this.setting.definition.key),n.append(e,i);const o=await new AjaxRequest(this.dumpuri).post(n),s=await o.resolve();"string"==typeof s.yaml?copyToClipboard(s.yaml):(console.warn("Value can not be copied to clipboard.",typeof s.yaml),Notification.error(lll("copyToClipboard.error")))}};__decorate([property({type:Object})],EditableSettingElement.prototype,"setting",void 0),__decorate([property({type:String})],EditableSettingElement.prototype,"dumpuri",void 0),EditableSettingElement=__decorate([customElement("typo3-backend-editable-setting")],EditableSettingElement);export{EditableSettingElement};