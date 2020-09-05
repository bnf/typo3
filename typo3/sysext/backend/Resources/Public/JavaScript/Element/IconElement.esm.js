import { Sizes, States, MarkupIdentifiers } from '../Enum/IconTypes.esm.js';
import Icons from '../Icons.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { css as i, unsafeCSS as r } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/css-tag.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import { unsafeHTML as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/directives/unsafe-html.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/directives/unsafe-html.esm.js';
import { until as o$1 } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/directives/until.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/directives/until.esm.js';
import './SpinnerElement.esm.js';

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
const iconUnifyModifier = 0.86;
const iconSize = (identifier, size) => i `
  :host([size=${identifier}]),
  :host([raw]) .icon-size-${identifier} {
    font-size: ${size}px;
  }
`;
/**
 * Module: TYPO3/CMS/Backend/Element/IconElement
 *
 * @example
 * <typo3-backend-icon identifier="data-view-page" size="small"></typo3-backend-icon>
 */
let IconElement = class IconElement extends h {
    constructor() {
        super(...arguments);
        this.size = Sizes.default;
        this.state = States.default;
        this.overlay = null;
        this.markup = MarkupIdentifiers.inline;
        /**
         * @internal Usage of `raw` attribute is discouraged due to security implications.
         *
         * The `raw` attribute value will be rendered unescaped into DOM as raw html (.innerHTML = raw).
         * That means it is the responsibility of the callee to ensure the HTML string does not contain
         * user supplied strings.
         * This attribute should therefore only be used to preserve backwards compatibility,
         * and must not be used in new code or with user supplied strings.
         * Use `identifier` attribute if ever possible instead.
         */
        this.raw = null;
    }
    render() {
        if (this.raw) {
            return T `${o(this.raw)}`;
        }
        if (!this.identifier) {
            return T ``;
        }
        const icon = Icons.getIcon(this.identifier, this.size, this.overlay, this.state, this.markup)
            .then((markup) => {
            return T `
          ${o(markup)}
        `;
        });
        return T `${o$1(icon, T `<typo3-backend-spinner></typo3-backend-spinner>`)}`;
    }
};
IconElement.styles = [
    i `
      :host {
        display: flex;
        width: 1em;
        height: 1em;
        line-height: 0;
      }

      .icon {
        position: relative;
        display: block;
        overflow: hidden;
        white-space: nowrap;
        height: 1em;
        width: 1em;
        line-height: 1;
      }

      .icon svg,
      .icon img {
        display: block;
        height: 1em;
        width: 1em;
        transform: translate3d(0, 0, 0);
      }

      .icon * {
        display: block;
        line-height: inherit;
      }

      .icon-markup {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
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
        font-size: 0.6875em;
        text-align: center;
      }

      .icon-color {
        fill: currentColor;
      }

      .icon-state-disabled .icon-markup {
        opacity: .5;
      }

      .icon-unify {
        font-size: ${iconUnifyModifier}em;
        line-height: ${1 / iconUnifyModifier};
      }

      .icon-spin .icon-markup {
        animation: icon-spin 2s infinite linear;
      }

      @keyframes icon-spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    `,
    iconSize(r(Sizes.small), 16),
    iconSize(r(Sizes.default), 32),
    iconSize(r(Sizes.large), 48),
    iconSize(r(Sizes.mega), 64),
];
__decorate([
    e({ type: String })
], IconElement.prototype, "identifier", void 0);
__decorate([
    e({ type: String })
], IconElement.prototype, "size", void 0);
__decorate([
    e({ type: String })
], IconElement.prototype, "state", void 0);
__decorate([
    e({ type: String })
], IconElement.prototype, "overlay", void 0);
__decorate([
    e({ type: String })
], IconElement.prototype, "markup", void 0);
__decorate([
    e({ type: String })
], IconElement.prototype, "raw", void 0);
IconElement = __decorate([
    n('typo3-backend-icon')
], IconElement);

export { IconElement };
