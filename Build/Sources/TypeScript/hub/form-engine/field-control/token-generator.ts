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
import DocumentService from '@typo3/core/document-service';
import FormEngine from '@typo3/backend/form-engine';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import { action } from '@typo3/core/action/request';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import labels from '~labels/hub.token_generator';

interface GeneratedSecret {
  secret: string;
  digest: string;
  token: string | null;
}

/**
 * Handles the "Generate Token" field control: only the digest of the generated
 * secret is written to the field, the secret (OAuth apps) or the token wrapping
 * it (static apps) is shown once in a modal to be copied
 */
class TokenGenerator {
  private controlElement: HTMLAnchorElement = null;
  private humanReadableField: HTMLInputElement = null;

  constructor(controlElementId: string) {
    DocumentService.ready().then((): void => {
      this.controlElement = <HTMLAnchorElement>document.getElementById(controlElementId);
      this.humanReadableField = document.querySelector<HTMLInputElement>(
        'input[data-formengine-input-name="' + this.controlElement.dataset.itemName + '"]',
      );

      // Set human-readable field to disable and readonly in case edit is disallowed in the field control settings
      if (!this.controlElement.dataset.allowEdit) {
        this.humanReadableField.disabled = true;
        this.humanReadableField.readOnly = true;
        // Also remove clearable possibility
        if (this.humanReadableField.isClearable || this.humanReadableField.classList.contains('t3js-clearable')) {
          this.humanReadableField.classList.remove('t3js-clearable');
          const clearableContainer = this.humanReadableField.closest<HTMLDivElement>('div.form-control-clearable-wrapper');
          if (clearableContainer) {
            clearableContainer.classList.remove('form-control-clearable');
            const closeButton = clearableContainer.querySelector<HTMLButtonElement>('button.close');
            if (closeButton) {
              clearableContainer.removeChild(closeButton);
            }
          }
        }
      }

      this.controlElement.addEventListener('click', this.generateSecret.bind(this));
    });
  }

  private async generateSecret(e: Event): Promise<void> {
    e.preventDefault();

    const appType = document.querySelector<HTMLSelectElement>('select[name="' + this.controlElement.dataset.itemName.replace('secret', 'app_type') + '"]').value;
    const appIdentifier = document.querySelector<HTMLInputElement>('input[data-formengine-input-name="' + this.controlElement.dataset.itemName.replace('secret', 'identifier') + '"]').value;

    let generated: GeneratedSecret;
    try {
      const response = await action('/v1/app/secret/generate')
        .post(JSON.stringify({ appIdentifier, appType }), {
          headers: { 'Content-Type': 'application/json' },
        });
      generated = await response.resolve();
    } catch {
      Notification.error(labels.get('error'));
      return;
    }

    this.humanReadableField.value = generated.digest;
    // Manually dispatch "change" to enable FormEngine handling (instead of manually calling "updateInputField()").
    // This way custom modules are also triggered when listening on this event.
    this.humanReadableField.dispatchEvent(new Event('change'));
    FormEngineValidation.validateField(this.humanReadableField);
    FormEngine.markFieldAsChanged(this.humanReadableField);

    if (appType === 'oauth') {
      await this.showCredential(labels.get('title.oauth'), labels.get('message.oauth'), generated.secret);
    } else {
      await this.showCredential(labels.get('title.static'), labels.get('message.static'), generated.token);
    }
  }

  private async showCredential(title: string, message: string, credential: string): Promise<void> {
    // The modal is rendered in the top frame, its custom elements need to be registered there
    await topLevelModuleImport('@typo3/backend/copy-to-clipboard.js');
    await topLevelModuleImport('@typo3/backend/element/icon-element.js');
    const content: TemplateResult = html`
      <p>${message}</p>
      <p><strong>${labels.get('message.once')}</strong></p>
      <div class="input-group">
        <input type="text" class="form-control font-monospace" readonly .value="${credential}" @focus="${(e: FocusEvent): void => (<HTMLInputElement>e.target).select()}">
        <typo3-copy-to-clipboard text="${credential}" class="btn btn-default">
          <typo3-backend-icon identifier="actions-clipboard" size="small"></typo3-backend-icon>
          ${labels.get('copy')}
        </typo3-copy-to-clipboard>
      </div>
    `;
    const modal = Modal.advanced({
      title,
      content,
      severity: SeverityEnum.warning,
      size: Modal.sizes.medium,
      staticBackdrop: true,
      buttons: [
        {
          text: labels.get('close'),
          active: true,
          btnClass: 'btn-default',
          name: 'close',
          trigger: (): void => modal.hideModal(),
        },
      ],
    });
  }
}

export default TokenGenerator;
