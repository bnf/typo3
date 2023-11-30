// @ts-strict-ignore
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

import FormEngineValidation from '@typo3/backend/form-engine-validation';
import RegularEvent from '@typo3/core/event/regular-event';

/**
 * Module: @typo3/backend/form-engine/element/datetime-element
 *
 * Functionality for the datetime element
 *
 * @example
 * <typo3-formengine-element-datetime recordFieldId="some-id">
 *   ...
 * </typo3-formengine-element-datetime>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class DatetimeElement extends HTMLElement {
  public connectedCallback(): void {
    const element = document.getElementById((this.getAttribute('recordFieldId') || '' as string)) as HTMLInputElement|null;

    if (!element) {
      return;
    }

    this.registerEventHandler(element);
    import('../../date-time-picker').then(({ default: DateTimePicker }): void => {
      DateTimePicker.initialize(element);
    });
  }

  private registerEventHandler(element: HTMLInputElement): void {
    new RegularEvent('formengine.dp.change', (e: CustomEvent): void => {
      FormEngineValidation.validateField(e.target as HTMLInputElement);
      FormEngineValidation.markFieldAsChanged(e.target as HTMLInputElement);

      document.querySelectorAll('.module-docheader-bar .btn').forEach((btn: HTMLButtonElement): void => {
        btn.classList.remove('disabled');
        btn.disabled = false;
      });
    }).bindTo(element);
  }
}

window.customElements.define('typo3-formengine-element-datetime', DatetimeElement);
