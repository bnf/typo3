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
import {customElement, property} from 'lit/decorators';

/**
 * Module: TYPO3/CMS/Backend/Element/Module
 *
 * @example
 * <typo3-backend-spinner size="small"></typo3-backend-spinner>
 * + attribute size can be one of small, medium, large
 */
@customElement('typo3-backend-module')
export class ModuleElement extends LitElement {
  @property({type: String}) size: string = 'small';

  public static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .module-docheader {
      position: sticky;
      top: 20px;
      width: 100%;
      min-height: 65px;
      z-index: 300;
      background-color: #eee;
      border-bottom: 1px solid #c3c3c3;
      padding: 0 24px;
      box-sizing: border-box;
      transition: margin-top .3s ease-in-out;
    }
    .module-docheader-bar {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .module-docheader-bar > * {
      box-sizing: border-box;
      min-height: 26px;
      margin: 4px 0;
      line-height: 26px;
    }
    .module-docheader-bar-navigation {
      min-height: 26px;
    }
    .module-docheader-bar > *:empty {
      display: none;
    }

    .module-docheader-bar-buttons-column-left,
    .module-docheader-bar-buttons-column-right {
      display: flex;
      flex-direction: row;
    }

    .module-body {
      padding: 24px 24px;
    }
  `;

  public render(): TemplateResult {
    return html`
      <div class="module">
        <div class="module-loading-indicator"></div>

        <div class="module-docheader">
          <div class="module-docheader-bar module-docheader-bar-navigation">
            <slot name="docheader"/>
          </div>
          <div class="module-docheader-bar module-docheader-bar-buttons">
            <div class="module-docheader-bar-buttons-column-left">
              <slot name="docheader-button-left"></slot>
            </div>
            <div class="module-docheader-bar-buttons-column-right">
              <slot name="docheader-button-right"></slot>
            </div>
          </div>
        </div>
        <div class="module-body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
