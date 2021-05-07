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
var __decorate=this&&this.__decorate||function(e,t,r,s){var o,i=arguments.length,l=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,s);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(i<3?o(l):i>3?o(t,r,l):o(t,r))||l);return i>3&&l&&Object.defineProperty(t,r,l),l};define(["require","exports","lit","lit/decorators","lit-html/directives/if-defined","lit/directives/unsafe-html","TYPO3/CMS/Core/Ajax/AjaxRequest","./CardButton"],(function(e,t,r,s,o,i,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.InstallModule=void 0;let a=class extends r.LitElement{constructor(){super(...arguments),this.standalone=!1,this.cards=null,this.label="Loading cards…",this.error=!1}createRenderRoot(){return this}render(){return this.standalone?r.html`
        ${this.renderContent()}
      `:r.html`
        <typo3-backend-module>
          ${this.renderContent()}
        </typo3-backend-module>
      `}renderContent(){return null===this.cards&&new l(this.endpoint).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();console.log(t),!0===t.success&&"undefined"!==t.cards&&t.cards.length>0?(this.cards=t.cards,this.label=t.label,this.error=!1):this.error=!0},e=>{this.error=!0,this.dispatchEvent(new CustomEvent("install-tool:ajax-error",{composed:!0,bubbles:!0,detail:{error:e}}))}),this.error?r.html`
        <div class="t3js-infobox callout callout-sm callout-error">
          <h4 class="callout-title">Something went wrong</h4>
        </div>
      `:r.html`
      <h1>${this.label}</h1>
      <div class="card-container">
        ${this.renderCards(this.cards||[])}
      </div>
    `}renderCards(e){return e.map(e=>r.html`
      <div class="card card-size-fixed-small ${"disabled"in e&&e.disabled?"card-disabled":""}">
        <div class="card-header">
          ${e.icon?r.html`
            <div class="card-icon">
              <img src="${"./sysext/install/Resources/Public/"}Icons/modules/${e.icon}.svg" width="64" height="64" class="card-header-icon-image" />
            </div>
          `:r.nothing}
          <div class="card-header-body">
            <h1 class="card-title">${e.title}</h1>
            <span class="card-subtitle">${e.subtitle}</span>
          </div>
        </div>
        <div class="card-content">
          <p class="card-text">${i.unsafeHTML(e.description)}</p>
        </div>
        <div class="card-footer">
          ${"disabled"in e&&e.disabled?r.html`${i.unsafeHTML(e.disabledInfo)}`:r.html`
            <typo3-install-card-button
              label="${e.button.label}"
              inline="${o.ifDefined(e.button.inline)}"
              require="TYPO3/CMS/Install/Module/${e.button.require}"
              modal-title="${e.title}"
              modal-size="${o.ifDefined(e.button.modalSize)}"
            ></typo3-install-card-button>
          `}
        </div>
      </div>
    `)}};__decorate([s.property({type:String})],a.prototype,"endpoint",void 0),__decorate([s.property({type:Boolean})],a.prototype,"standalone",void 0),__decorate([s.state()],a.prototype,"cards",void 0),__decorate([s.state()],a.prototype,"label",void 0),__decorate([s.state()],a.prototype,"error",void 0),a=__decorate([s.customElement("typo3-install-module")],a),t.InstallModule=a}));