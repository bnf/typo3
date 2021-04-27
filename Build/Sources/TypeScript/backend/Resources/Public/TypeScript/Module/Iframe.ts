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

import {html, css, LitElement, TemplateResult} from 'lit';
import {customElement, property, query} from 'lit/decorators';
import {ModuleState} from './State';
import {lll} from 'TYPO3/CMS/Core/lit-helper';

export const componentName = 'typo3-iframe-module';
//
// Trigger a render cycle, even if property has been reset to
// the current value (this is to trigger a module refresh).
const alwaysUpdate = (newVal: string, oldVal: string) => true;

/**
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
@customElement(componentName)
export class IframeModuleElement extends LitElement {

  @property({type: String, hasChanged: alwaysUpdate})
  endpoint: string = '';

  @query('iframe', true)
  iframe: HTMLIFrameElement;

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Disable shadow root as <iframe> needs to be accessible
    // via top.list_frame for backwards compatibility.
    return this;
  }

  public render(): TemplateResult {
    if (!this.endpoint) {
      return html``;
    }

    return html`
      <iframe
        src="${this.endpoint}"
        name="list_frame"
        id="typo3-contentIframe"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        @load="${this._loaded}"
      ></iframe>
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.endpoint) {
      const event = new CustomEvent<ModuleState>('typo3-iframe-load', {
        bubbles: true,
        composed: true,
        detail: {
          url: this.endpoint
        }
      });
      this.dispatchEvent(event);
    }
  }

  /*
  public attributeChangedCallback(name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);

    if (name === 'endpoint' && value === old) {
      this.iframe.setAttribute('src', value);
    }
  }
  */

  private _loaded({target}: Event) {
    const iframe = <HTMLIFrameElement> target;
    let state: ModuleState = { url: this.endpoint };
    try {
      const moduleElement = iframe.contentDocument.body.querySelector('.module[data-module-name]');
      state = {
        url: iframe.contentWindow.location.href;
        title: iframe.contentDocument.title;
        module: = moduleElement ? ( moduleElement.getAttribute('data-module-name') || null) : null;
      };

      iframe.contentWindow.addEventListener('unload', (e: Event) => this.unload(e), { once: true});
    } catch (e) {
      console.log('Failed to access module iframe', e);
      // continue
    }

    console.log('[module-iframe] dispatching iframe-loaded event', state);
    const event = new CustomEvent<ModuleState>('typo3-iframe-loaded', {
      bubbles: true,
      composed: true,
      detail: state
    });
    this.dispatchEvent(event);
  }

  private _unload(e: Event) {
    console.log('[module-iframe] caught iframe unload event', e);

    // Asynchronous execution needed because the URL changes immediately after
    // the `unload` event is dispatched.
    new Promise((resolve) => window.setTimeout(resolve, 0)).then(() => {
      if (iframe.contentWindow === null) {
        console.log('real iframe window not found. we probably got removed.');
        return;
      }
      const url = iframe.contentWindow.location.href;
      const event = new CustomEvent<ModuleState>('typo3-iframe-load', {
        bubbles: true,
        composed: true,
        detail: {
          url
        }
      });
      this.dispatchEvent(event);
    });
  }
}
