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

import {BroadcastMessage} from 'TYPO3/CMS/Backend/BroadcastMessage';
import BroadcastService = require('TYPO3/CMS/Backend/BroadcastService');

/**
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
@customElement('typo3-iframe-module')
export class IframeModuleElement extends LitElement {
  @property({type: String}) src: string = '';

  public static get styles(): CSSResult
  {
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

  public render(): TemplateResult {
    const src = this.src;

    console.log('rendering iframe', {src});

    if (!src) {
      return html``;
    }

    return html`
      <iframe
        src="${src}"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        @load="${this._load}"
        @unload="${this._unload}"
      ></iframe>
    `;
  }

  private _load(e: Event) {
    console.log('loaded iframe event', e);
    const event = new CustomEvent('typo3-module-loaded', {
      detail: {
        message: 'Something important happened'
      }
    });
    this.dispatchEvent(event);

    /* alternative to a CustomEvent, but will use CustomEvent if that works out */
    const iframe = this.shadowRoot.querySelector('iframe')
    const url = iframe.contentWindow.location.href;
    const module = iframe.contentDocument.body.querySelector('.module[data-module-name]');
    const moduleName = module ? ( module.getAttribute('data-module-name') || null) : null;
    const message = new BroadcastMessage(
      'navigation',
      'contentchange',
      { url: url, module: moduleName }
    );

    console.log('sending out an url change ' + url);
    BroadcastService.post(message, true);
  }

  private _unload(e: Event) {
    console.log('iframe unload', e);
    const iframe = this.shadowRoot.querySelector('iframe');
    const url = iframe.contentWindow.location.href;
    const message = new BroadcastMessage(
      'navigation',
      'contentchange',
      { url: url, module: null }
    );
  }
}
