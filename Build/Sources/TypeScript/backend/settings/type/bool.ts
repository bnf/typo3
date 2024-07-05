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

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';

@customElement('typo3-backend-settings-type-bool')
export class BoolTypeElement extends LitElement {

  @property({ type: String }) key: string;

  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value: string): boolean => {
        return value === '1' || value === 'true';
      }
    }
  }) value: boolean;

  protected render(): TemplateResult {
    return html`
      <input
        type="hidden"
        name=${`data[${this.key}]`}
        value="0"
      />
      <div class="form-check form-check-type-toggle">
        <input
          type="checkbox"
          name=${`data[${this.key}]`}
          id=${this.key}
          class="form-check-input"
          value="1"
          .checked=${this.value}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-bool': BoolTypeElement;
  }
}
