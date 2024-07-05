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
import { live } from 'lit/directives/live.js';

export const componentName = 'typo3-backend-settings-type-stringlist';

@customElement(componentName)
export class StringlistTypeElement extends BaseElement<string[]> {

  @property({ type: String }) key: string;
  @property({ type: Array }) value: string[];

  protected updateValue(value: string, index: number) {
    this.value[index] = value;
  }

  protected addValue(index: number, value: string = '') {
    this.value = this.value.toSpliced(index + 1, 0, value);
  }

  protected removeValue(index: number) {
    this.value = this.value.toSpliced(index, 1);
  }

  protected render(): TemplateResult[] {
    return this.value.map((value, index) => html`
      <input
        id=${`${this.key}-${index}`}
        type="text"
        class="form-control"
        .value=${live(value)}
        @change=${(e: InputEvent) => this.updateValue((e.target as HTMLInputElement).value, index)}
      />
      <button @click=${() => this.addValue(index)}>+</button>
      <button @click=${() => this.removeValue(index)}>-</button>
      <br>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-type-stringlist': StringlistTypeElement;
  }
}
