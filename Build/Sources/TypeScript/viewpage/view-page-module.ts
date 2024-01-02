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
import { live } from 'lit/directives/live.js';
import { customElement, property, state } from 'lit/decorators';
import { Task } from '@lit/task';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Loader from '@typo3/backend/viewport/loader';
import { ModuleState } from '@typo3/backend/module';
import PersistentStorage, { UC } from '@typo3/backend/storage/persistent';
//import { debounceEvent } from '@typo3/core/event/debounce-event';
import '@typo3/backend/element/module';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/spinner-element';

export const componentName = 'typo3-viewpage-module';

const module = 'page_preview';

type PresetType = 'desktop' | 'tablet' | 'mobile' | 'unidentified';

type Labels = {
  maximized: string,
  custom: string,
  iframeTitle: string,
  refresh: string,
};

type State = {
  label: string,
  width: number,
  height: number
};

type Preset = {
  key: string,
  label: string,
  type: PresetType,
  width: number,
  height: number
};

type ModuleData = {
  title: string,
  url: string,
  labels: Labels,
  current: State,
  custom: State,
  presetGroups: Record<PresetType, Preset[]>,
};

@customElement(componentName)
export class ViewPageModule extends LitElement {

  @property({ type: Boolean }) active: boolean = false;
  @property({ type: String, reflect: true }) endpoint: string = '';

  @state() /*private*/ size: State = null;
  @state() /*private*/ custom: State = null;

  private cache: Pick<ModuleData, 'url' | 'labels' | 'current' | 'custom' | 'presetGroups'> = null

  private readonly storagePrefix: string = 'moduleData.page_preview.States.';
  private queueDelayTimer: number;

  private readonly task = new Task(this, {
    task: async ([ endpoint ], { signal }): Promise<ModuleData> => {
      this.dispatchLoad(endpoint, 'viewpage');
      const response = await new AjaxRequest(endpoint).get({ cache: 'no-cache', signal });
      const data: ModuleData = await response.resolve();
      this.task.taskComplete.then(
        async () => {
          this.requestUpdate();
          await this.updateComplete;
          this.dispatchLoaded(endpoint, data);
        },
        () => {
          Loader.finish();
        }
      );
      return data;
    },
    args: () => [ this.endpoint ]
  });

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadowRoot for now, to allow css classes to work
    return this;
  }

  protected dispatchLoad(url: string, module: string): void {
    Loader.start();
    const event = new CustomEvent<ModuleState>('typo3-module-load', {
      bubbles: true,
      composed: true,
      detail: {
        url,
        module
      }
    });
    this.dispatchEvent(event);
  }

  protected dispatchLoaded(url: string, data: ModuleData): void {
    Loader.finish();
    const event = new CustomEvent<ModuleState>('typo3-module-loaded', {
      bubbles: true,
      composed: true,
      detail: {
        url,
        module,
        title: data.title,
      }
    });
    this.dispatchEvent(event);
    console.log('sending out config module loaded ' + url, event);
  }

  protected render(): TemplateResult {
    const content = this.task.render({
      pending: () => {
        if (this.cache === null) {
          return html`<typo3-backend-spinner></typo3-backend-spinner>`;
        }
        return this.renderContent({ ...this.cache, title: 'Loading' }, true);
      },
      complete: (data: ModuleData) => {
        const { url, labels, current, custom, presetGroups } = data;
        if (this.size === null) {
          this.size = current;
          this.custom = custom;
        }
        this.cache = { url, labels, current, custom, presetGroups };

        return this.renderContent(data, false);
      },
      error: () => {
        return html`<p>Failed to load viewpage module</p>`;
      },
    })
    //const content = this.renderContent();
    return html`<typo3-backend-module>${content}</typo3-backend-module>`;
  }

  protected renderContent(data: ModuleData, loading: boolean): TemplateResult
  {
    const { url, labels, presetGroups } = data;
    const current = this.size
    const custom = this.custom

    return html`

      <button slot="docheader-button-right" class="btn btn-sm btn-default" title=${labels.refresh} @click=${() => this.handleRefresh()}>
        <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
      </button>

      <div class="viewpage-item">
        <div class="viewpage-topbar t3js-viewpage-topbar" data-loading="${loading ? 'true' : 'false'}">
          <div class="viewpage-topbar-orientation t3js-viewpage-topbar-orientation">
            <a href="#" class="t3js-change-orientation" @click=${this.handleOrientationChange}>
              <typo3-backend-icon identifier="actions-device-orientation-change" size="small"></typo3-backend-icon>
            </a>
          </div>
          <div class="viewpage-topbar-preset">
            <span class="dropdown">
              <button type="button" id="viewpage-topbar-preset-button" class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <span class="t3js-viewpage-current-label">
                  ${current.label} (${custom.width}px/${custom.height}px)
                </span>
              </button>
              <ul class="dropdown-menu" aria-labelledby="viewpage-topbar-preset-button">
                <li>
                  <a href="#" class="dropdown-item t3js-preset-maximized t3js-change-preset" @click=${(e: Event) => this.handlePresetSelection(e, null)} data-key="maximized" data-label=${labels.maximized} data-width data-height>
                    <span class="dropdown-item-columns">
                      <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                        <typo3-backend-icon identifier="actions-fullscreen" size="small"></typo3-backend-icon>
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-title">
                        ${labels.maximized}
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-value">
                        100%/100%
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item t3js-preset-custom t3js-change-preset" @click=${(e: Event) => this.handlePresetSelection(e, this.custom)} data-key="custom" data-label=${labels.custom} data-width="${custom.width}" data-height="${custom.height}">
                    <span class="dropdown-item-columns">
                      <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                        <typo3-backend-icon identifier="actions-expand" size="small"></typo3-backend-icon>
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-title t3js-preset-custom-label">
                        ${labels.custom}
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-value">
                        <span class="t3js-preset-custom-width">${custom.width}</span>px/<span class="t3js-preset-custom-height">${custom.height}</span>px
                      </span>
                    </span>
                  </a>
                </li>
                ${Object.values(presetGroups).filter(presetGroup => Object.keys(presetGroup).length > 0).map(presetGroup => html`
                  <li><hr class="dropdown-divider"></li>
                  ${Object.values(presetGroup).map((preset) => html`
                    <li>
                      <a href="#" class="dropdown-item t3js-change-preset" @click=${(e: Event) => this.handlePresetSelection(e, preset)} data-key="${preset.key}" data-label="${preset.label}" data-width="${preset.width}" data-height="${preset.height}">
                        <span class="dropdown-item-columns">
                          <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                            <typo3-backend-icon identifier="actions-device-${preset.type ? preset.type : 'unidentified'}" size="small"></typo3-backend-icon>
                          </span>
                          <span class="dropdown-item-column dropdown-item-column-title">
                            ${preset.label}
                          </span>
                          <span class="dropdown-item-column dropdown-item-column-value">
                            ${preset.width ? preset.width + 'px' : '100%'}/${preset.height ? preset.height + 'px' : '100%'}
                          </span>
                        </span>
                      </a>
                    </li>
                  `)}
                `)}
              </ul>
            </span>
          </div>
          <div class="viewpage-topbar-size">
            <input class="t3js-viewpage-input-width" type="number" name="width" min="300" max="9999" .value="${live(current.width)}" @change=${(e: Event) => this.handleSizeInputChange(e, 'width')}>
            x
            <input class="t3js-viewpage-input-height" type="number" name="height" min="300" max="9999" .value="${live(current.height)}" @change=${(e: Event) => this.handleSizeInputChange(e, 'height')}>
          </div>
        </div>
        <div class="viewpage-resizeable t3js-viewpage-resizeable" style="width:${current.width}px;height:${current.height}px;">
          <iframe src=${url} width="100%" height="100%" id="tx_viewpage_iframe" frameborder="0" border="0" title=${labels.iframeTitle}></iframe>
          <!-- support handles for interactjs -->
          <div class="resizable-w"></div>
          <div class="resizable-s"></div>
          <div class="resizable-e"></div>
        </div>
      </div>
    `;

  }

  protected shouldUpdate(): boolean {
    return this.active;
  }

  private readonly handleOrientationChange = (): void => {
    this.size = { ...this.size, width: this.size.height, height: this.size.width };
    this.persistCurrentPreset();
  }

  private readonly handleSizeInputChange = (e: Event, property: 'width' | 'height'): void => {
    const inputEl = e.target as HTMLInputElement;
    if (!inputEl.valueAsNumber) {
      return;
    }
    this.size = this.custom = {
      ...this.size,
      ...{
        label: this.custom.label,
        [property]: inputEl.valueAsNumber,
      }
    };
    this.persistCustomPresetAfterChange();
  }

  private readonly handlePresetSelection = (e: Event, preset: State|Preset|null): void => {
    if (preset === null) {
      preset = {
        label: this.cache.labels.maximized,
        width: 100,
        height: 100
      }
    }
    const { label, width, height } = preset;
    this.size = { label, width, height };
    this.persistCurrentPreset();
  }

  private readonly handleRefresh = () => {
    const iframe = this.renderRoot.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.location.reload();
    }
  }

  private persistChanges(storageIdentifier: string, data: UC): void {
    PersistentStorage.set(storageIdentifier, data);
  }

  private persistCurrentPreset(): void {
    /*
    const data = {
      width: this.getCurrentWidth(),
      height: this.getCurrentHeight(),
      label: this.getCurrentLabel(),
    };
    */
    this.persistChanges(this.storagePrefix + 'current', this.size);
  }

  private persistCustomPreset(): void {
    this.persistChanges(this.storagePrefix + 'current', this.size);
    this.persistChanges(this.storagePrefix + 'custom', this.custom);
  }

  private persistCustomPresetAfterChange(): void {
    clearTimeout(this.queueDelayTimer);
    this.queueDelayTimer = window.setTimeout(() => { this.persistCustomPreset(); }, 1000);
  }

}
