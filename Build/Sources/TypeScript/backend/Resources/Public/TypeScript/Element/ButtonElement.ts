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

import {html, css, LitElement, TemplateResult} from 'lit-element';
import {customElement, property} from 'lit/decorators';
import {unsafeHTML} from 'lit/directives/unsafe-html';
import {until} from 'lit/directives/until';
import {Sizes, States, MarkupIdentifiers} from '../Enum/IconTypes';
import 'TYPO3/CMS/Backend/Element/IconElement';
import 'TYPO3/CMS/Backend/Element/SpinnerElement';

/**
 * Module: TYPO3/CMS/Backend/Element/ButtonElement
 *
 * @example
 * <typo3-backend-button label="Test" size="small"></typo3-backend-button>
 */
@customElement('typo3-backend-button')
export class ButtonElement extends LitElement {

  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: String}) icon = '';
  @property({type: String}) label = '';
  @property({type: String}) type = '';
  @property({type: String}) containment = '';
  @property({type: String, reflect: true}) size: Sizes | null = null;

  public static styles = css`
    :host([disabled]) {
      pointer-events: none;
    }
    button {
      display: inline-block;
      font-family: var(--t3-btn-font-family, inherit);
      font-weight: var(--t3-btn-font-weight, inherit);
      line-height: var(--t3-btn-line-height, inherit);
      color: var(--t3-body-color, inherit);
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      background-color: transparent;
      border: var(--t3-btn-border-width, currentColor) solid transparent;
    }
    button:hover {
    }
  `;

  protected render(): TemplateResult {
    return html`
      <button ?type="${this.type}" ?disabled="${this.disabled}" ?aria-label="${this.label}">
        ${this.icon ? `<typo3-backend-icon icon=${this.icon}></typo3-backend-icon>` : html`<slot name="icon"></slot>`}
        <span class="label">${this.label ? this.label : html`<slot></slot>`}</span>
        <slot name="trailing-icon"></slot>
      </button>
    `;
  }
}
