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

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { BaseElement } from './base';

@customElement('typo3-backend-settings-type-int')
export class IntTypeElement extends BaseElement<number> {

  @property({ type: String }) key: string;
  @property({ type: Number }) value: number;

  protected render(): TemplateResult {
    return html`
      <input
        id=${this.key}
        type="number"
        .value=${this.value}
        @change=${(e: InputEvent) => this.value = parseInt((e.target as HTMLInputElement).value, 10)}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-int': IntTypeElement;
  }
}
