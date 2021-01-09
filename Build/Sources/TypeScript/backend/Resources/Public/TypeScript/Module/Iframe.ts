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
  @property({type: String}) params: string = '';
  @property({type: Object}) moduleData: any = {};

  // for iframe.location backwards compatibility
  //@property({type: Object, attribute: false}) location: Location;
  public location: Location;

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

  constructor() {
    super();
    // for iframe.location backwards compatibility
    this.location = new Location((property: string) => this.requestUpdate());
  }

  public render(): TemplateResult {

    let nextLoadModuleUrl = '';
    if (top.nextLoadModuleUrl) {
      nextLoadModuleUrl = top.nextLoadModuleUrl;
      top.nextLoadModuleUrl = '';
    }
    const href = this.location && this.location.href;
    const link = nextLoadModuleUrl || href || this.moduleData.link || '';
    console.log('rendering iframe', {href, link});

    // @todo: attributes name and class will and can be removed, as we use shadow root.
    return html`
      <iframe
        name="list_frame"
        id="typo3-contentIframe"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        src="${link}"
        @load="${this._loaded}"
      ></iframe>
    `;
  }

  private _loaded(e: Event) {
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
}

class Location {
  public propertyChangedCallback: (property: string) => void;
  private _href: string = '';

  constructor(propertyChangedCallback: (property: string) => void) {
    this.propertyChangedCallback = propertyChangedCallback;
  }

  get href() {
    return this._href;
  }

  set href(val: string) {
    this._href = val;
    this.propertyChangedCallback('href');
  }
}
