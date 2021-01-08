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

class Location {
  public propertyChangedCallback: (property: string) => void;
  private __href: string = '';

  get href() {
    return this.__href;
  }

  set href(val: string) {
    this.__href = val;
    this.propertyChangedCallback('href');
  }
}


/**
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
@customElement('typo3-iframe-module')
export class IframeModuleElement extends LitElement {
  @property({type: String}) params: string = '';
  @property({type: Object}) moduleData: any = {};

  // for iframe.location backwards compatibility
  @property({type: Object, attribute: false}) location: Location;


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
    this.location = new Location;
    this.location.propertyChangedCallback = (property: string): void => {
      this.requestUpdate();
    };
  }

  /*
  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once we import all requires css here
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
 */

  public render(): TemplateResult {
    const href = this.location && this.location.href;
    const link = href || this.moduleData.link || '';
    const title = this.title;
    console.log('rendering iframe', {href, link, title});
    return html`
      <iframe name="list_frame" id="typo3-contentIframe" title="${lll('iframe.listFrame')}" scrolling="no" class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe" src="${link}"></iframe>
    `;
  }
}
