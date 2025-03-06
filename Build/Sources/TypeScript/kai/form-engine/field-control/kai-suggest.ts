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

import DocumentService from '@typo3/core/document-service';
import FormEngine from '@typo3/backend/form-engine';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import { action } from '@typo3/core/action/request';
import Notification from '@typo3/backend/notification';
import type { CKEditor5Element } from '@typo3/rte-ckeditor/ckeditor5';

class KaiSuggest {
  private controlElement: HTMLAnchorElement = null;
  private humanReadableField: HTMLInputElement = null;
  private hiddenField: HTMLInputElement = null;

  constructor(controlElementId: string) {
    console.log('kai2', controlElementId);
    DocumentService.ready().then((): void => {
      this.controlElement = <HTMLAnchorElement>document.getElementById(controlElementId);
      this.humanReadableField = <HTMLInputElement>document.querySelector(
        '[data-formengine-input-name="' + this.controlElement.dataset.itemName + '"]',
      );
      this.hiddenField = <HTMLInputElement>document.querySelector(
        '[name="' + this.controlElement.dataset.itemName + '"]',
      );

      const { site } = this.controlElement.dataset;
      const fieldName = this.controlElement.dataset.itemName.replace(/.*\[([^\]]+)\]$/, '$1');
      this.controlElement.addEventListener('click', (e: Event) => this.suggest(e, site, fieldName));
    });
  }

  private async suggest(e: Event, site: string, fieldName: string): Promise<void> {
    e.preventDefault();

    let result: {
      content: {
        value: string,
        notificationTitle: string,
        notificationMessage: string,
      }
    };
    try {
      const response = await action('/kai/suggest').post({ site, fieldName }, { headers: { 'Content-Type': 'application/json' } });
      const resolvedBody = await response.resolve();
      if (resolvedBody.status !== 'ok') {
        throw new Error('Status not ok');
      }
      result = resolvedBody.result as typeof result;
    } catch (e) {
      Notification.error('Value could not be generated');
      console.error(e);
      return;
    }

    Notification.success(result.content.notificationTitle, result.content.notificationMessage);

    if (this.hiddenField.parentElement.tagName === 'TYPO3-RTE-CKEDITOR-CKEDITOR5') {
      const { editor } = this.hiddenField.parentElement as CKEditor5Element;
      editor.setData(result.content.value);
    } else if (this.humanReadableField) {
      this.humanReadableField.value = result.content.value;
      // Manually dispatch "change" to enable FormEngine handling (instead of manually calling "updateInputField()").
      // This way custom modules are also triggered when listening on this event.
      this.humanReadableField.dispatchEvent(new Event('change'));
      // Due to formatting and processing done by FormEngine, we need to set the value again (allow to copy)
      this.humanReadableField.value = this.hiddenField.value;
      // Finally validate and mark the field as changed
      FormEngineValidation.validateField(this.humanReadableField);
      FormEngine.markFieldAsChanged(this.humanReadableField);
    }
  }
}

export default KaiSuggest;
