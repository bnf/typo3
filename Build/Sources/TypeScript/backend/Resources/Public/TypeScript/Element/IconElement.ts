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

import {html, css, unsafeCSS, customElement, property, LitElement, TemplateResult, CSSResult} from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {until} from 'lit-html/directives/until';
import Icons = require('../Icons');

import {Sizes, States, MarkupIdentifiers} from '../IconEnums';

import 'TYPO3/CMS/Backend/Element/SpinnerElement';

/**
 * Module: TYPO3/CMS/Backend/Element/IconElement
 *
 * @example
 * <typo3-backend-icon identifier="data-view-page" size="small"></typo3-backend-spinner>
 * + attribute size can be one of small, default, large or overlay.
 */
@customElement('typo3-backend-icon')
export class IconElement extends LitElement {
  @property({type: String}) identifier: string;
  @property({type: String}) size: Sizes = Sizes.default;
  @property({type: String}) state: States = States.default;

  public static get styles(): CSSResult[]
  {
    const iconUnifyModifier = 0.86;
    const iconSize = (identifier: CSSResult, size: number) => css`
      .icon-size-${identifier} {
        height: ${size}px;
        width: ${size}px;
        line-height: ${size}px;
      }
      :host([size=${identifier}]) .icon {
        height: ${size}px;
        width: ${size}px;
        line-height: ${size}px;
      }

      :host([size=${identifier}]) .icon-unify {
        line-height: ${size}px;
        font-size: ${Math.ceil(size * iconUnifyModifier)}px;
      }

      :host([size=${identifier}]) .icon-overlay .icon-unify {
        line-height: ${Math.ceil(size / 1.6)}px;
        font-size: ${Math.ceil(Math.ceil(size / 1.6) * iconUnifyModifier)}px;
      }
    `;

    return [
      css`
        :host {
          display: inline-block;
        }

        typo3-backend-spinner,
        .icon {
          position: relative;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          height: 1em;
          width: 1em;
          vertical-align: -22%;
        }

        .icon svg,
        .icon img {
          display: block;
          height: 100%;
          width: 100%;
          transform: translate3d(0, 0, 0);
        }

        .icon * {
          display: block;
          line-height: inherit;
        }

        .icon-markup {
          position: absolute;
          display: block;
          text-align: center;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .icon-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          height: 68.75%;
          width: 68.75%;
          text-align: center;
        }

        .icon-color {
          fill: currentColor;
        }

        //
        // Icon Animation
        //
        .icon-spin .icon-markup {
          -webkit-animation: icon-spin 2s infinite linear;
          animation: icon-spin 2s infinite linear;
        }

        @-webkit-keyframes icon-spin {
          0% {
            -webkit-transform: rotate(0deg);
                    transform: rotate(0deg);
            }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        @keyframes icon-spin {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
      `,
      iconSize(unsafeCSS(Sizes.small), 16),
      iconSize(unsafeCSS(Sizes.default), 32),
      iconSize(unsafeCSS(Sizes.large), 48),
      iconSize(unsafeCSS(Sizes.overlay), 64),
    ];
  }

  public render(): TemplateResult {
    if (!this.identifier) {
      return html``;
    }
    const icon = Icons.getIcon(this.identifier, this.size, null, this.state).then((markup: string) => html`${unsafeHTML(markup)}`);
    return html`${until(icon, html`<typo3-backend-spinner size="${this.size === 'default' ? 'medium' : this.size}"></typo3-backend-spinner>`)}`;
  }
}
