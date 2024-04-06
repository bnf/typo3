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

import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { BaseElement } from './base';
import { live } from 'lit/directives/live.js';

export const componentName = 'typo3-backend-settings-type-mixed';

@customElement(componentName)
export class MixedTypeElement extends BaseElement<string> {

  @property({ type: String }) override value: string;

  protected handleChange(e: InputEvent): void {
    const input = e.target as HTMLInputElement;
    if (input.reportValidity()) {
      this.value = input.value;
    }
  }

  protected override render(): TemplateResult {
    return html`
      <textarea
        id=${this.formid}
        class="form-control"
        ?readonly=${this.readonly}
        .value=${live(this.value)}
        @change=${this.handleChange}
      ></textarea>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-mixed': MixedTypeElement;
  }
}
