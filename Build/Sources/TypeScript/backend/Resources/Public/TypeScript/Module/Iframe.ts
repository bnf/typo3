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

import {html, css, customElement, property, LitElement, TemplateResult, CSSResult} from 'lit-element';
import {lll} from 'TYPO3/CMS/Core/lit-helper';

/**
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
@customElement('typo3-iframe-module')
export class IframeModuleElement extends LitElement {
  @property({type: String}) src: string = '';

  private ignoreNextUnloadUrl: boolean = false;

  public static get styles(): CSSResult
  {
    // @todo: css is currently unused, as we are not yet using shadow root (because of acceptance tests)
    return css`
      :host {
        display: block;
        height: 100%;
      }
      iframe {
        display: block;
        border: none;
        height: 100%;
        width: 1px;
        min-width: 100%;
        transform: translate3d(0,0,0);
      }
    `;
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Need to avoid shadowRoot for now, because of backwoods
    // acceptance tests via codeception -___-
    // Will switch to shadow root, as soon acceptance tests
    // can locate iframes inside shadowRoot
    return this;
  }

  public render(): TemplateResult {
    const src = this.src;

    console.log('rendering iframe', {src});

    if (!src) {
      return html``;
    }

    // @todo: class is only set as long as we do not use shadow root
    return html`
      <iframe
        class="scaffold-content-module-iframe"
        src="${src}"
        name="list_frame"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        @load="${this._load}"
      ></iframe>
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    const event = new CustomEvent('typo3-module-load', {
      bubbles: true,
      composed: true,
      detail: {
        url: this.src,
        decorate: false
      }
    });
    console.log('connectedCallback', event);
    //console.error('connectedCallback');
    this.dispatchEvent(event);
  }

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval);

    if (name === 'src') {
      //this.ignoreNextUnloadUrl = true;
      //this.requestUpdate();
      const iframe = this.renderRoot.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow.location.reload();
      }
    }
  }

  public updated(): void {
    /*
    const event = new CustomEvent('typo3-module-load', {
      bubbles: true,
      composed: true,
      detail: {
        url: this.src,
        decorate: true
      }
    });
    this.dispatchEvent(event);
   */
  }

  private _load(e: Event) {
    const iframe = <HTMLIFrameElement> e.target;
    let url = null;
    let moduleName = null;
    try {
      url = iframe.contentWindow.location.href;
      const module = iframe.contentDocument.body.querySelector('.module[data-module-name]');
      moduleName = module ? ( module.getAttribute('data-module-name') || null) : null;

      iframe.contentWindow.addEventListener('unload', (e: Event) => {
        console.log('real iframe unload', e);
        /*
        if (this.ignoreNextUnloadUrl) {
          console.log('real iframe unload url replaced', e);
          this.ignoreNextUnloadUrl = false;
          const event = new CustomEvent('typo3-module-load', {
            bubbles: true,
            composed: true,
            detail: {
              url: this.src,
              // @todo maybe synthetic true/false
              decorate: true
            }
          });
          this.dispatchEvent(event);
          return;
        }
       */

        // Asynchronous execution needed because the URL changes immediately after
        // the `unload` event is dispatched.
        new Promise((resolve) => window.setTimeout(resolve, 0)).then(() => {
        //Promise.resolve().then(() => {
          if (iframe.contentWindow === null) {
            console.log('real iframe window not found. we probably got removed.');
            return;
          }
          const url = iframe.contentWindow.location.href;
          const event = new CustomEvent('typo3-module-load', {
            bubbles: true,
            composed: true,
            detail: {
              url,
              // @todo maybe synthetic true/false
              decorate: true
            }
          });
          this.dispatchEvent(event);
        });
      }, { once: true});
    } catch (e) {
      console.log('iframe catch', e);
      // continue
    }

    console.log('loaded iframe event', e, {url, module: moduleName}, iframe === e.target);
    const event = new CustomEvent('typo3-module-loaded', {
      bubbles: true,
      composed: true,
      detail: {
        url,
        module: moduleName
      }
    });
    console.log('sending out an url change ' + url);
    this.dispatchEvent(event);
  }
}
