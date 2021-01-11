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
 * Module: TYPO3/CMS/Lowlevel/ConfigurationModule
 */
@customElement('typo3-lowlevel-configuration-module')
export class ConfigurationModule extends LitElement {

  public static get styles(): CSSResult
  {
    return css`
      :host {
        display: block;
        height: 100%;
      }
    `;
  }

  public render(): TemplateResult {
    return html`
      FOO
    `;
  }

  public firstUpdated(): void {
    const event = new CustomEvent('typo3-module-loaded', {
      detail: {
        message: 'Something important happened'
      }
    });
    this.dispatchEvent(event);

    /* alternative to a CustomEvent, but will use CustomEvent if that works out */
    const url = '/typo3/module/system/config?token=dummy';
    const moduleName = 'system_config';
    const message = new BroadcastMessage(
      'navigation',
      'contentchange',
      { url: url, module: moduleName }
    );

    console.log('sending out an url change ' + url);
    BroadcastService.post(message, true);
  }
}
