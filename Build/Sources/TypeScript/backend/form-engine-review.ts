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

import 'bootstrap';
import DocumentService from '@typo3/core/document-service';
import FormEngine from '@typo3/backend/form-engine';
import { selector } from '@typo3/core/literals';
import '@typo3/backend/element/icon-element';
import Popover from './popover';
import { Popover as BootstrapPopover, Tab as BootstrapTab } from 'bootstrap';

/**
 * Module: @typo3/backend/form-engine-review
 * Enables interaction with record fields that need review
 * @exports @typo3/backend/form-engine-review
 */
class FormEngineReview {

  /**
   * Class for the toggle button
   */
  private readonly toggleButtonClass: string = 't3js-toggle-review-panel';

  /**
   * Class of FormEngine labels
   */
  private readonly labelSelector: string = '.t3js-formengine-label';

  /**
   * Class of FormEngine legends
   */
  private readonly legendSelector: string = '.t3js-formengine-legend';

  /**
   * The constructor, set the class properties default values
   */
  constructor() {
    this.initialize();
  }

  /**
   * Fetches all fields that have a failed validation
   */
  public static findInvalidField(): NodeListOf<HTMLElement> {
    return document.querySelectorAll('.tab-content .' + FormEngine.Validation.errorClass);
  }

  /**
   * Renders an invisible button to toggle the review panel into the least possible toolbar
   */
  public attachButtonToModuleHeader(): void {
    const leastButtonBar: HTMLElement = document.querySelector('typo3-backend-module > [slot="docheader-button-right"] > [role="toolbar"]');

    const icon = document.createElement('typo3-backend-icon');
    icon.setAttribute('identifier', 'actions-info');
    icon.setAttribute('size', 'small');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-danger', 'btn-sm', 'hidden', this.toggleButtonClass);
    button.title = TYPO3.lang['buttons.reviewFailedValidationFields'];
    button.appendChild(icon);

    Popover.popover(button);
    leastButtonBar.prepend(button);
  }

  /**
   * Initialize the events
   */
  public initialize(): void {
    DocumentService.ready().then((): void => {
      this.attachButtonToModuleHeader();
      FormEngine.formElement.addEventListener('t3-formengine-postfieldvalidation', (): void => {
        this.checkForReviewableField();
      });
    });
  }

  /**
   * Checks if fields have failed validation. In such case, the markup is rendered and the toggle button is unlocked.
   */
  public checkForReviewableField(): void {
    const invalidFields = FormEngineReview.findInvalidField();
    const toggleButton: HTMLElement = document.querySelector('.' + this.toggleButtonClass);
    if (toggleButton === null) {
      return;
    }

    if (invalidFields.length > 0) {
      const erroneousListGroup = document.createElement('div');
      erroneousListGroup.classList.add('list-group');

      for (const invalidField of invalidFields) {
        const relatedInputField = invalidField.querySelector('[data-formengine-validation-rules]') as HTMLElement;
        const link = document.createElement('a');
        link.classList.add('list-group-item');
        link.href = '#';
        link.textContent = invalidField.querySelector(this.labelSelector)?.textContent || invalidField.querySelector(this.legendSelector)?.textContent || '';
        link.addEventListener('click', (e: Event) => this.switchToField(e, relatedInputField));

        erroneousListGroup.append(link);
      }

      toggleButton.classList.remove('hidden');
      Popover.setOptions(toggleButton, <BootstrapPopover.Options>{
        html: true,
        content: erroneousListGroup as Element
      });
    } else {
      toggleButton.classList.add('hidden');
      Popover.hide(toggleButton);
    }
  }

  /**
   * Finds the field in the form and focuses it
   */
  public switchToField(e: Event, inputField: HTMLElement): void {
    e.preventDefault();

    // iterate possibly nested tab panels
    let ref = inputField;
    while (ref) {
      if (ref.matches('[id][role="tabpanel"]')) {
        const tabContainer = document.querySelector(selector`[aria-controls="${ref.id}"]`);
        new BootstrapTab(tabContainer).show();
      }
      ref = ref.parentElement;
    }

    inputField.focus();
  }
}

// create an instance and return it
export default new FormEngineReview();
