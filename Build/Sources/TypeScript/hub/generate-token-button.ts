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

import { customElement, property } from 'lit/decorators.js';
import { PseudoButtonLitElement } from '@typo3/backend/element/pseudo-button';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';

/**
 * Module: @typo3/hub/generate-token-button
 *
 * @example
 * <typo3-hub-generate-token-button app="…">
 *   Generate Token
 * </typo3-hub-generate-token-button>
 */
@customElement('typo3-hub-generate-token-button')
export class GenerateTokenButton extends PseudoButtonLitElement {
  @property({ type: String }) app: string;

  protected override async buttonActivated(): Promise<void> {
    const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.token_generate)
      .post(JSON.stringify({ appIdentifier: this.app }), {
        headers: { 'Content-Type': 'application/json' },
      });
    const data = await response.resolve();
    Notification.success('Token generated', data.token);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-hub-generate-token-button': GenerateTokenButton;
  }
}
