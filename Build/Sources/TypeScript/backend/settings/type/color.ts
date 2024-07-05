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
import Alwan from 'alwan';

@customElement('typo3-backend-settings-type-color')
export class ColorTypeElement extends LitElement {

  @property({ type: String }) key: string;
  @property({ type: String }) value: string;

  private alwan: Alwan|null = null;

  protected firstUpdated(): void {
    this.alwan = new Alwan(this.querySelector('input'), {
      position: 'bottom-start',
      format: 'hex',
      opacity: false,
      preset: false,
      color: this.value,
    });
    this.alwan.on('color', (e): void => {
      this.value = e.hex;
    });
  }

  protected render(): TemplateResult {
    return html`
      <input
        id=${this.key}
        type="string"
        name=${'data[' + this.key + ']'}
        .value=${this.value}
        @input=${(e: InputEvent) => this.alwan?.setColor((e.target as HTMLInputElement).value)}
        @change=${(e: InputEvent) => this.alwan?.setColor((e.target as HTMLInputElement).value)}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-color': ColorTypeElement;
  }
}
