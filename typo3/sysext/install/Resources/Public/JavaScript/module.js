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
var __decorate=function(t,e,o,l){var r,a=arguments.length,s=a<3?e:null===l?l=Object.getOwnPropertyDescriptor(e,o):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,l);else for(var i=t.length-1;i>=0;i--)(r=t[i])&&(s=(a<3?r(s):a>3?r(e,o,s):r(e,o))||s);return a>3&&s&&Object.defineProperty(e,o,s),s};import{html,LitElement,nothing}from"lit";import{customElement,property,state}from"lit/decorators.js";import{ifDefined}from"lit-html/directives/if-defined.js";import{unsafeHTML}from"lit/directives/unsafe-html.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import"@typo3/install/card-button.js";let InstallModule=class extends LitElement{constructor(){super(...arguments),this.standalone=!1,this.cards=null,this.label="Loading cards…",this.iconPath=null,this.error=!1}createRenderRoot(){return this}render(){return this.standalone?html`
        ${this.renderContent()}
      `:html`
        <typo3-backend-module>
          ${this.renderContent()}
        </typo3-backend-module>
      `}renderContent(){return null===this.cards&&new AjaxRequest(this.endpoint).get({cache:"no-cache"}).then((async t=>{const e=await t.resolve();!0===e.success&&"undefined"!==e.cards&&e.cards.length>0?(this.cards=e.cards,this.iconPath=e.iconPath,this.label=e.label,this.error=!1):this.error=!0}),(t=>{this.error=!0,this.dispatchEvent(new CustomEvent("install-tool:ajax-error",{composed:!0,bubbles:!0,detail:{error:t}}))})),this.error?html`
        <div class="t3js-infobox callout callout-sm callout-error">
          <h4 class="callout-title">Something went wrong</h4>
        </div>
      `:html`
      <h1>${this.label}</h1>
      <div class="card-container">
        ${this.renderCards(this.cards||[])}
      </div>
    `}renderCards(t){return t.map((t=>html`
      <div class="card card-size-fixed-small ${"disabled"in t&&t.disabled?"card-disabled":""}">
        <div class="card-header">
          ${t.icon?html`
            <div class="card-icon">
              <img src="${this.iconPath}/${t.icon}.svg" width="64" height="64" class="card-header-icon-image" />
            </div>
          `:nothing}
          <div class="card-header-body">
            <h1 class="card-title">${t.title}</h1>
            <span class="card-subtitle">${t.subtitle}</span>
          </div>
        </div>
        <div class="card-content">
          <p class="card-text">${unsafeHTML(t.description)}</p>
        </div>
        <div class="card-footer">
          ${"disabled"in t&&t.disabled?html`${unsafeHTML(t.disabledInfo)}`:html`
            <typo3-install-card-button
              label="${t.button.label}"
              inline="${ifDefined(t.button.inline)}"
              module="TYPO3/CMS/Install/Module/${t.button.module}"
              modal-title="${t.title}"
              modal-size="${ifDefined(t.button.modalSize)}"
            ></typo3-install-card-button>
          `}
        </div>
      </div>
    `))}};__decorate([property({type:String})],InstallModule.prototype,"endpoint",void 0),__decorate([property({type:Boolean})],InstallModule.prototype,"standalone",void 0),__decorate([state()],InstallModule.prototype,"cards",void 0),__decorate([state()],InstallModule.prototype,"label",void 0),__decorate([state()],InstallModule.prototype,"iconPath",void 0),__decorate([state()],InstallModule.prototype,"error",void 0),InstallModule=__decorate([customElement("typo3-install-module")],InstallModule);export{InstallModule};