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

import {html, LitElement, nothing, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {ifDefined} from 'lit-html/directives/if-defined';
import {until} from 'lit/directives/until';
import {unsafeHTML} from 'lit/directives/unsafe-html';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import {AjaxResponse} from '@typo3/core/ajax/ajax-response';
import './card-button';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/spinner-element';

/**
 * Module: TYPO3/CMS/Install/App
 */
@customElement('typo3-admin-tool-app')
export class InstallModule extends LitElement {
  @property({type: String}) siteName: string;
  @property({type: String}) currentTypo3Version: string;
  @property({type: String}) bust: string;
  @property({type: String}) basepath: string;

  @property({type: String}) endpoint: string;
  @property({type: Boolean}) standalone: boolean = false;

  @state() cards: any = null;
  @state() label: string = 'Loading cards…';
  @state() iconPath: string = null;
  @state() error: boolean = false;

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  public render(): TemplateResult {
    return html`
      <div class="scaffold">
        <div class="scaffold-header t3js-scaffold-header">
            <div class="scaffold-topbar t3js-scaffold-topbar">
                <div class="topbar">
                    <div class="topbar-header t3js-topbar-header" style="padding-left: 0">
                        <div class="topbar-header-site">
                            <a href="" target="_top" title="TYPO3.CMS">
                                <span class="topbar-header-site-logo">
                                    <img src="./sysext/install/Resources/Public/Images/typo3_logo_orange.svg" width="22" height="22" title="TYPO3 Content Management System" alt="">
                                </span>
                                <span class="topbar-header-site-title">
                                    <span class="topbar-header-site-name">Admin tool on site: {siteName}</span>
                                    <span class="topbar-header-site-version">TYPO3 CMS {currentTypo3Version}</span>
                                </span>
                            </a>
                            <button type="button" class="btn btn-default btn-danger pull-right" style="margin-top: 7px; margin-right: 15px;" @click=${() => this.dispatchEvent(new CustomEvent('install-tool:logout', {bubbles: true, composed: true}))}>
                                <typo3-backend-icon identifier="actions-logout" size="small"><typo3-backend-icon>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="scaffold-modulemenu t3js-scaffold-modulemenu">
            <div class="modulemenu t3js-modulemenu" role="menubar" data-role="modulemenu" id="modulemenu">
                <ul class="modulemenu-group-container">
                    ${this.renderModuleLink('maintenance', 'Maintenance')}
                    ${this.renderModuleLink('settings', 'Settings')}
                    ${this.renderModuleLink('upgrade', 'Upgrade')}
                    ${this.renderModuleLink('environment', 'Environment')}

                    <li class="modulemenu-group-spacer"></li>
                    <li data-level="1">
                        <a href="index.php"
                            title="Switch to Backend"
                            class="modulemenu-action"
                            role="menuitem"
                            id="backend"
                            data-link="index.php"
                        >
                            <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="modulegroup-web" size="default"></typo3-backend-icon></span>
                            <span class="modulemenu-name">Switch to Backend</span>
                            <span class="modulemenu-indicator" aria-hidden="true"></span>
                        </a>
                    </li>
                    <li data-level="1">
                        <a href="../"
                            title="Switch to Frontend"
                            class="modulemenu-action"
                            role="menuitem"
                            id="frontend"
                        >
                            <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="modulegroup-site" size="default"></typo3-backend-icon></span>
                            <span class="modulemenu-name">Switch to Frontend</span>
                            <span class="modulemenu-indicator" aria-hidden="true"></span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="scaffold-content t3js-scaffold-content">
            <div class="container-fluid" style="padding-top:25px;">
                <div class="t3js-module-body">
                    ${this.renderContent()}
                </div>
            </div>
        </div>
      </div>
    `;
  }

  private renderModuleLink(controller: string, label: string): TemplateResult
  {
    return html`
      <li data-level="1">
        <a href="install.php?install[controller]=${controller}"
          title="${label}"
          class="modulemenu-action"
          role="menuitem"
        >
          <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="module-install-${controller}" size="default"></typo3-backend-icon></span>
          <span class="modulemenu-name">${label}</span>
          <span class="modulemenu-indicator" aria-hidden="true"></span>
        </a>
      </li>
    `;
  }

  private renderContent(): TemplateResult {
    if (this.cards === null) {
      (new AjaxRequest(this.endpoint))
        .get({cache: 'no-cache'})
        .then(
          async (response: AjaxResponse): Promise<any> => {
            const data = await response.resolve();
            if (data.success === true && data.cards !== 'undefined' && data.cards.length > 0) {
              this.cards = data.cards;
              this.iconPath = data.iconPath;
              this.label = data.label;
              this.error = false;
            } else {
              this.error = true;
            }
          },
          (error: AjaxResponse): void => {
            this.error = true;
            this.dispatchEvent(new CustomEvent('install-tool:ajax-error', {composed: true, bubbles: true, detail: {error}}));
          }
        );
    }

    /* @todo loading state
      <core:icon identifier="spinner-circle" size="large" />
      <h2 id="t3js-ui-block-detail">Loading cards</h2>
    */

    if (this.error) {
      return html`
        <div class="t3js-infobox callout callout-sm callout-error">
          <h4 class="callout-title">Something went wrong</h4>
        </div>
      `;
    }

    if (this.cards === null) {
      return html`
        <div class="ui-block">
          <typo3-backend-spinner size="large" class="mx-auto"></typo3-backend-spinner>
          <h2 t3js-ui-block-detail">Loading cards</h2>
        </div>
      `;
    }

    return html`
      <h1>${this.label}</h1>
      <div class="card-container">
        ${this.renderCards(this.cards || [])}
      </div>
    `;
  }

  private renderCards(cards: any): TemplateResult[] {
    return cards.map((card: any): TemplateResult => html`
      <div class="card card-size-fixed-small ${'disabled' in card && card.disabled ? 'card-disabled' : ''}">
        <div class="card-header">
          ${!card.icon ? nothing : html`
            <div class="card-icon">
              <img src="${this.iconPath}/${card.icon}.svg" width="64" height="64" class="card-header-icon-image" />
            </div>
          `}
          <div class="card-header-body">
            <h1 class="card-title">${card.title}</h1>
            <span class="card-subtitle">${card.subtitle}</span>
          </div>
        </div>
        <div class="card-content">
          <p class="card-text">${unsafeHTML(card.description)}</p>
        </div>
        <div class="card-footer">
          ${'disabled' in card && card.disabled ? html`${unsafeHTML(card.disabledInfo)}` : html`
            <typo3-install-card-button
              label="${card.button.label}"
              inline="${ifDefined(card.button.inline)}"
              module="TYPO3/CMS/Install/Module/${card.button.module}"
              modal-title="${card.title}"
              modal-size="${ifDefined(card.button.modalSize)}"
            ></typo3-install-card-button>
          `}
        </div>
      </div>
    `);
  }
}
