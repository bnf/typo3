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

/**
 * Module: TYPO3/CMS/Install/Module
 */
@customElement('typo3-install-module')
export class InstallModule extends LitElement {
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
    if (this.standalone) {
      return html`
        ${this.renderContent()}
      `;
    } else {
      return html`
        <typo3-backend-module>
          ${this.renderContent()}
        </typo3-backend-module>
      `;
    }
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
