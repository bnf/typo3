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
var __decorate=function(e,a,r,t){var o,d=arguments.length,i=d<3?a:null===t?t=Object.getOwnPropertyDescriptor(a,r):t;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,a,r,t);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(i=(d<3?o(i):d>3?o(a,r,i):o(a,r))||i);return d>3&&i&&Object.defineProperty(a,r,i),i};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";let NewFormStep1=class extends LitElement{constructor(){super(...arguments),this.nofolders=!1}createRenderRoot(){return this}render(){return this.nofolders?html`
        <div class="new-form-modal">
          <div class="row">
            <label class="col col-form-label">${TYPO3.lang["formManager.newFormWizard.step1.noStorages"]}</label>
          </div>
        </div>
      `:html`
      <div class="new-form-modal">
        <div class="card-container">
          <div class="card card-size-medium">
            <div class="card-header">
              <div class="card-icon">
                <typo3-backend-icon identifier="apps-pagetree-page-default" size="large"></typo3-backend-icon>
              </div>
              <div class="card-header-body">
                <h2 class="card-title">${TYPO3.lang["formManager.blankForm.label"]}</h2>
                <span class="card-subtitle">${TYPO3.lang["formManager.blankForm.subtitle"]}</span>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text">${TYPO3.lang["formManager.blankForm.description"]}</p>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-success"
                @click=${e=>this.onNewFormModeButtonClick(e,"blank")}>
                <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                ${TYPO3.lang["formManager.blankForm.label"]}
              </button>
            </div>
          </div>
          <div class="card card-size-medium">
            <div class="card-header">
              <div class="card-icon">
                <typo3-backend-icon identifier="form-page" size="large"></typo3-backend-icon>
              </div>
              <div class="card-header-body">
                <h2 class="card-title">${TYPO3.lang["formManager.predefinedForm.label"]}</h2>
                <span class="card-subtitle">${TYPO3.lang["formManager.predefinedForm.subtitle"]}</span>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text">${TYPO3.lang["formManager.predefinedForm.description"]}</p>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-success"
                @click=${e=>this.onNewFormModeButtonClick(e,"predefined")}>
                <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                ${TYPO3.lang["formManager.predefinedForm.label"]}
              </button>
            </div>
          </div>
        </div>
      </div>
    `}onNewFormModeButtonClick(e,a){MultiStepWizard.set("newFormMode",a),MultiStepWizard.unlockNextStep().trigger("click")}};__decorate([property({type:Boolean})],NewFormStep1.prototype,"nofolders",void 0),NewFormStep1=__decorate([customElement("typo3-form-newformstep1")],NewFormStep1);let NewFormStep2=class extends LitElement{constructor(){super(...arguments),this.nofolders=!1}createRenderRoot(){return this}render(){return this.nofolders?html`
        <div class="new-form-modal">
          <div class="row">
            <label class="col col-form-label">${TYPO3.lang["formManager.newFormWizard.step1.noStorages"]}</label>
          </div>
        </div>
      `:html`
      <div class="new-form-modal">
        <div class="card-container">
          <div class="card card-size-medium">
            <div class="card-header">
              <div class="card-icon">
                <typo3-backend-icon identifier="apps-pagetree-page-default" size="large"></typo3-backend-icon>
              </div>
              <div class="card-header-body">
                <h2 class="card-title">${TYPO3.lang["formManager.blankForm.label"]}</h2>
                <span class="card-subtitle">${TYPO3.lang["formManager.blankForm.subtitle"]}</span>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text">${TYPO3.lang["formManager.blankForm.description"]}</p>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-success"
                @click=${e=>this.onNewFormModeButtonClick(e,"blank")}>
                <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                ${TYPO3.lang["formManager.blankForm.label"]}
              </button>
            </div>
          </div>
          <div class="card card-size-medium">
            <div class="card-header">
              <div class="card-icon">
                <typo3-backend-icon identifier="form-page" size="large"></typo3-backend-icon>
              </div>
              <div class="card-header-body">
                <h2 class="card-title">${TYPO3.lang["formManager.predefinedForm.label"]}</h2>
                <span class="card-subtitle">${TYPO3.lang["formManager.predefinedForm.subtitle"]}</span>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text">${TYPO3.lang["formManager.predefinedForm.description"]}</p>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-success"
                @click=${e=>this.onNewFormModeButtonClick(e,"predefined")}>
                <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                ${TYPO3.lang["formManager.predefinedForm.label"]}
              </button>
            </div>
          </div>
        </div>
      </div>
    `}onNewFormModeButtonClick(e,a){MultiStepWizard.set("newFormMode",a),MultiStepWizard.unlockNextStep().trigger("click")}};__decorate([property({type:Boolean})],NewFormStep2.prototype,"nofolders",void 0),NewFormStep2=__decorate([customElement("typo3-form-newformstep2")],NewFormStep2);