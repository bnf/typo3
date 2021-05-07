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

import {html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators';
import Modal from '@typo3/backend/modal';
import {AbstractInteractableModule} from './module/abstract-interactable-module';
import {AbstractInlineModule} from './module/abstract-inline-module';
import $ from 'jquery';
import '@typo3/backend/element/spinner-element';

/**
 * Module: TYPO3/CMS/Install/CardButton
 */
@customElement('typo3-install-card-button')
export class CardButton extends LitElement {
  @property({type: String, attribute: 'module'}) requireModule: string;
  @property({type: String}) label: string;
  @property({type: Boolean, attribute: 'inline'}) isInline: boolean = false;
  @property({type: String}) variant: string = 'default';
  @property({type: String, attribute: 'modal-size'}) modalSize: typeof Modal.sizes = Modal.sizes.large;
  @property({type: String, attribute: 'modal-title'}) modalTitle: string;

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  public render(): TemplateResult {
    return html`
      <button type="button" class="btn btn-${this.variant}" @click="${(e: MouseEvent) => this.onClick(e)}">${this.label}</button>
    `;
  }

  private onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.isInline) {
      require([this.requireModule], (aModule: AbstractInlineModule): void => {
        aModule.initialize($(e.currentTarget));
      });
    } else {
      const $modal = Modal.advanced({
        type: Modal.types.default,
        title: this.modalTitle,
        size: this.modalSize,
        content: $('<div class="modal-loading"><typo3-backend-spinner></typo3-backend-spinner></div>'),
        additionalCssClasses: ['install-tool-modal'],
        callback: (currentModal: any): void => {
          require([this.requireModule], (aModule: AbstractInteractableModule): void => {
            aModule.initialize(currentModal);
          });
        },
      });
    }
  }
}
