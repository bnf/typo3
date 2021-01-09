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

interface Module {
  name: string;
  navigationComponentId: string;
  navigationFrameScript: string;
  navigationFrameScriptParam: string;
  link: string;
  element: string;
  elementModule: string;
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

/**
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
@customElement('typo3-iframe-module')
export class IframeModuleElement extends LitElement {
  @property({type: String}) module: string = '';
  @property({type: String}) src: string = '';
  @property({type: String}) params: string = '';
  @property({type: Object}) moduleData: any = null;

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
    const moduleData = this.moduleData || this.getRecordFromName(this.module);
    console.log('iframe moduledata', moduleData, this.module);
    const src = nextLoadModuleUrl || href || this.src || moduleData.link || '';

    console.log('rendering iframe', {href, src});

    if (!src) {
      return html``;
    }

    // @todo: attributes name and class will and can be removed, as we use shadow root.
    return html`
      <iframe
        name="list_frame"
        id="typo3-contentIframe"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        src="${src}"
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

  /**
   * Gets the module properties from module menu markup (data attributes)
   *
   * @param {string} name
   * @returns {Module}
   */
  private getRecordFromName(name: string): Module {
    const subModuleElement = document.getElementById(name);
    if (!subModuleElement) {
      return {
        name: '',
        navigationComponentId: '',
        navigationFrameScript: '',
        navigationFrameScriptParam: '',
        link: '',
        element: '',
        elementModule: ''
      };
    }
    return {
      name: name,
      navigationComponentId: subModuleElement.dataset.navigationcomponentid,
      navigationFrameScript: subModuleElement.dataset.navigationframescript,
      navigationFrameScriptParam: subModuleElement.dataset.navigationframescriptparameters,
      link: subModuleElement.dataset.link,
      element: subModuleElement.dataset.element,
      elementModule: subModuleElement.dataset.elementModule,
    };
  }
}
