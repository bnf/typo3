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
import { until } from 'lit/directives/until.js';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/copy-to-clipboard';

type ValueType = string|number|boolean|string[]|null;

/** @see \TYPO3\CMS\Core\Settings\SettingDefinition */
interface SettingDefinition {
  key: string,
  type: string,
  default: ValueType,
  label: string,
  description?: string|null,
  enum: ValueType[],
  categories: string[],
  tags: string[],
}

/** @see \TYPO3\CMS\Backend\Dto\Settings\EditableSetting */
interface EditableSetting {
  definition: SettingDefinition,
  isChanged: boolean,
  value: ValueType,
  status: string,
  warnings: string[],
  typeImplementation: string,
}

@customElement('typo3-backend-editable-setting')
export class EditableSettingElement extends LitElement {

  @property({ type: String }) key: string;
  @property({ type: Object }) setting: EditableSetting;

  typeElement: HTMLElement = null;

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected render(): TemplateResult {
    const { value, definition } = this.setting;
    return html`
      <div
        class=${`settings-item settings-item-${definition.type}`}
        id=${`setting-${definition.key}`}
        tabindex="0"
        data-status=${value === definition.default ? 'none' : 'modified'}
      >
        <!-- data-status=modified|error|none-->
        <div class="settings-item-indicator"></div>
        <div class="settings-item-title">
          <div class="settings-item-label">${definition.label}</div>
          <div class="settings-item-description">${definition.description}</div>
          <div class="settings-item-key">${definition.key}</div>
        </div>
        <div class="settings-item-control">
          ${until(this.renderField(), html`<typo3-backend-spinner></typo3-backend-spinner>`)}
        </div>
        <div class="settings-item-message"></div>
        <div class="settings-item-actions">
          ${this.renderActions()}
        </div>
      </div>
    `;
  }

  protected async renderField(): Promise<HTMLElement> {
    const { definition, value, typeImplementation } = this.setting;
    let element = this.typeElement
    if (!element) {
      const implementation = await import(typeImplementation);
      if (!('componentName' in implementation)) {
        throw new Error(`module ${typeImplementation} is missing the "componentName" export`);
      }
      element = document.createElement(implementation.componentName);
      this.typeElement = element;
    }

    element.setAttribute('key', definition.key);
    element.setAttribute('name', `settings[${definition.key}]`);
    element.setAttribute('value', Array.isArray(value) ? JSON.stringify(value) : String(value));
    element.setAttribute('default', Array.isArray(definition.default) ? JSON.stringify(definition.default) : String(definition.default));

    return element;
  }

  protected renderActions(): TemplateResult {
    const { definition } = this.setting;
    return html`
      <div class="dropdown">
          <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon>
              <span class="visually-hidden">More actions</span>
          </button>
          <ul class="dropdown-menu">
              <li>
                  <button class="dropdown-item nowrap" data-default-value=${definition.default} type="button">
                    <typo3-backend-icon identifier="actions-undo" size="small"></typo3-backend-icon> Reset Setting
                  </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                  <typo3-copy-to-clipboard
                      text=${definition.key}
                      class="dropdown-item nowrap"
                  >
                    <typo3-backend-icon identifier="actions-clipboard" size="small"></typo3-backend-icon> Copy Settings Identifier
                  </typo3-copy-to-clipboard>
              </li>
              <li>
                  <a class="dropdown-item nowrap" href="#">
                    <typo3-backend-icon identifier="actions-clipboard-paste" size="small"></typo3-backend-icon> Copy as YAML
                  </a>
              </li>
          </ul>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-editable-setting': EditableSettingElement;
  }
}
