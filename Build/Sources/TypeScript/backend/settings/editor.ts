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

import { html, LitElement, TemplateResult, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { copyToClipboard } from '@typo3/backend/copy-to-clipboard';
import { lll } from '@typo3/core/lit-helper';
import '@typo3/backend/settings/editor/editable-setting';

// preload known/common types
import '@typo3/backend/settings/type/bool';
import '@typo3/backend/settings/type/int';
import '@typo3/backend/settings/type/number';
import '@typo3/backend/settings/type/string';
import '@typo3/backend/settings/type/stringlist';

type ValueType = string|number|boolean|string[]|null;


export interface Category {
  key: string,
  label: string,
  description: string,
  icon: string,
  settings: EditableSetting[],
  categories: Category[],
}

/** @see \TYPO3\CMS\Core\Settings\SettingDefinition */
export interface SettingDefinition {
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
export interface EditableSetting {
  definition: SettingDefinition,
  value: ValueType,
  systemDefault: ValueType,
  status: string,
  warnings: string[],
  typeImplementation: string,
}

@customElement('typo3-backend-settings-editor')
export class SettingsEditorElement extends LitElement {

  @property({ type: Array }) categories: Category[];
  @property({ type: String, attribute: 'action-url' }) actionUrl: string;
  @property({ type: String, attribute: 'dump-url' }) dumpUrl: string;
  @property({ type: Object, attribute: 'custom-form-data' }) customFormData: Record<string, string> = {};
  @property({ type: Boolean }) readonly: boolean = false;

  @state() activeCategory: string = '';

  provideEvents: boolean;

  visibleCategories: Record<string, boolean> = {};
  observer: IntersectionObserver = null

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected override firstUpdated(): void {
    let rootMargin = '0px 0px 0px 0px';
    const docheader = document.querySelector('.module-docheader')
    if (docheader) {
      rootMargin = `-${getComputedStyle(docheader).getPropertyValue('min-height')} 0px 0px 0px`;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const key = (entry.target as HTMLElement).dataset.key;
          this.visibleCategories[key] = entry.isIntersecting;
        })
        const flatten = (list: Category[]): string[] => list.reduce((acc, c) => [...acc, c.key, ...flatten(c.categories)], []);
        const active = flatten(this.categories).filter(key => this.visibleCategories[key])[0] || '';
        if (active) {
          this.activeCategory = active;
        }
      },
      {
        root: document.querySelector('.module'),
        threshold: 0.1,
        rootMargin,
      }
    )
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    [...this.renderRoot.querySelectorAll('.settings-category')].map(entry => this.observer?.observe(entry));
    if (changedProperties.has('activeCategory')) {
      const activeElement = this.querySelector('.settings-navigation-item.active') as HTMLElement;
      if (activeElement && 'scrollIntoViewIfNeeded' in activeElement && typeof activeElement.scrollIntoViewIfNeeded === 'function') {
        activeElement.scrollIntoViewIfNeeded();
      } else {
        activeElement?.scrollIntoView();
      }
    }
  }

  protected renderCategoryTree(categories: Category[], level: number): TemplateResult {
    return html`
      <ul data-level=${level}>
        ${categories.map(category => html`
          <li>
            <a href=${`#category-headline-${category.key}`}
              @click=${() => this.activeCategory = category.key}
              class="settings-navigation-item ${this.activeCategory === category.key ? 'active' : ''}">
              <span class="settings-navigation-item-icon">
                <typo3-backend-icon identifier=${category.icon ? category.icon : 'actions-dot'} size="small"></typo3-backend-icon>
              </span>
              <span class="settings-navigation-item-label">${category.label}</span>
            </a>
            ${category.categories.length === 0 ? nothing : html`
              ${this.renderCategoryTree(category.categories, level + 1)}
            `}
          </li>
        `)}
      </ul>
    `;
  }

  protected renderSettings(categories: Category[], level: number): TemplateResult[] {
    return categories.map(category => html`
      <div class="settings-category-list" data-key=${category.key}>
        <div class="settings-category" data-key=${category.key}>
          ${this.renderHeadline(Math.min(level + 1, 6), `category-headline-${category.key}`, html`${category.label}`)}
          ${category.description ? html`<p>${category.description}</p>` : nothing}
        </div>
        ${category.settings.map((setting): TemplateResult => html`
          <typo3-backend-editable-setting .setting=${setting} .dumpuri=${this.dumpUrl} ?readonly=${this.readonly}></typo3-backend-editable-setting>
        `)}
      </div>
      ${category.categories.length === 0 ? nothing : html`
        ${this.renderSettings(category.categories, level + 1)}
      `}
    `);
  }

  protected renderHeadline(level: number, id: string, content: TemplateResult): TemplateResult {
    switch (level) {
      case 1:
        return html`<h1 id=${id}>${content}</h1>`;
      case 2:
        return html`<h2 id=${id}>${content}</h2>`;
      case 3:
        return html`<h3 id=${id}>${content}</h3>`;
      case 4:
        return html`<h4 id=${id}>${content}</h4>`;
      case 5:
        return html`<h5 id=${id}>${content}</h5>`;
      case 6:
        return html`<h6 id=${id}>${content}</h6>`;
      default:
        throw new Error(`Invalid header level: ${level}`);
    }
  }

  protected async onSubmit(e: SubmitEvent): Promise<void> {
    const form = e.target as HTMLFormElement;

    if ((e.submitter as HTMLButtonElement|null)?.value === 'export') {
      e.preventDefault();
      const formData = new FormData(form);
      const response = await new AjaxRequest(this.dumpUrl).post(formData);

      const result = await response.resolve();
      if (typeof result.yaml === 'string') {
        copyToClipboard(result.yaml);
      } else {
        console.warn('Value can not be copied to clipboard.', typeof result.yaml);
        Notification.error(lll('copyToClipboard.error'));
      }
    }

    if (this.provideEvents) {
      this.dispatchEvent(new CustomEvent('typo3:settings-editor:submit', {
        detail: {
          originalEvent: e,
          formData: Object.fromEntries(new FormData(form)),
        }
      }));
    }
  }

  protected render(): TemplateResult {
    return html`
      <form class="settings-container"
            id="sitesettings_form"
            name="sitesettings_form"
            action=${this.actionUrl}
            method="post"
            @submit=${(e: SubmitEvent) => this.onSubmit(e)}
      >
        ${Object.entries(this.customFormData).map(([name, value]) => html`<input type="hidden" name=${name} value=${value} />`)}
        <div class="settings">
          <div class="settings-navigation">
            ${this.renderCategoryTree(this.categories ?? [], 1)}
          </div>
          <div class="settings-body">
            ${this.renderSettings(this.categories ?? [], 1)}
          </div>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-settings-editor': SettingsEditorElement;
  }
}
