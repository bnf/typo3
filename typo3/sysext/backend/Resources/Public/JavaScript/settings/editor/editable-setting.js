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
var __decorate=function(t,e,i,n){var o,s=arguments.length,d=s<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(o=t[r])&&(d=(s<3?o(d):s>3?o(e,i,d):o(e,i))||d);return s>3&&d&&Object.defineProperty(e,i,d),d};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import{until}from"lit/directives/until.js";import"@typo3/backend/element/spinner-element.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/copy-to-clipboard.js";let EditableSettingElement=class extends LitElement{constructor(){super(...arguments),this.typeElement=null}createRenderRoot(){return this}render(){const{value:t,definition:e}=this.setting;return html`
      <div
        class=${`settings-item settings-item-${e.type}`}
        id=${`setting-${e.key}`}
        tabindex="0"
        data-status=${t===e.default?"none":"modified"}
      >
        <!-- data-status=modified|error|none-->
        <div class="settings-item-indicator"></div>
        <div class="settings-item-title">
          <div class="settings-item-label">${e.label}</div>
          <div class="settings-item-description">${e.description}</div>
          <div class="settings-item-key">${e.key}</div>
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
                  <button class="dropdown-item dropdown-item-spaced" data-default-value=${t.default} type="button">
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
              <li>
                  <a class="dropdown-item dropdown-item-spaced" href="#">
                    <typo3-backend-icon identifier="actions-clipboard-paste" size="small"></typo3-backend-icon> Copy as YAML
                  </a>
              </li>
          </ul>
      </div>
    `}};__decorate([property({type:String})],EditableSettingElement.prototype,"key",void 0),__decorate([property({type:Object})],EditableSettingElement.prototype,"setting",void 0),EditableSettingElement=__decorate([customElement("typo3-backend-editable-setting")],EditableSettingElement);export{EditableSettingElement};