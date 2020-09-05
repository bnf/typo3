import { Sizes } from '../Enum/IconTypes.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { css as i } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/css-tag.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';

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
var Variant;
(function (Variant) {
    Variant["light"] = "light";
    Variant["dark"] = "dark";
})(Variant || (Variant = {}));
/**
 * Module: TYPO3/CMS/Backend/Element/SpinnerElement
 *
 * @example
 * <typo3-backend-spinner size="small" variant="dark"></typo3-backend-spinner>
 * + attribute size can be one of small, default, large or mega
 */
let SpinnerElement = class SpinnerElement extends h {
    constructor() {
        super(...arguments);
        this.size = Sizes.default;
        this.variant = Variant.dark;
    }
    render() {
        return T `
      <div class="icon">
        <svg viewBox="0 0 16 16">
          <path d="M8 15c-3.86 0-7-3.141-7-7 0-3.86 3.14-7 7-7 3.859 0 7 3.14 7 7 0 3.859-3.141 7-7 7zM8 3C5.243 3 3 5.243 3 8s2.243 5 5 5 5-2.243 5-5 -2.243-5-5-5z" opacity=".3"/>
          <path d="M14 9a1 1 0 0 1-1-1c0-2.757-2.243-5-5-5a1 1 0 0 1 0-2c3.859 0 7 3.14 7 7a1 1 0 0 1-1 1z" transform-origin="center center">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0" to="360" begin="0s" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    `;
    }
};
SpinnerElement.styles = i `
    :host {
      display: flex;
      width: 1em;
      height: 1em;
      line-height: 0;
    }
    .icon {
      position: relative;
      display: block;
      height: 1em;
      width: 1em;
      line-height: 1;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: block;
      height: 1em;
      width: 1em;
      transform: translate3d(0, 0, 0);
      fill: currentColor;
    }
    :host([variant=dark]) svg {
      fill: #212121;
    }
    :host([variant=light]) svg {
      fill: #fff;
    }
    :host([size=small]) {
      font-size: 16px;
    }
    :host([size=default]) {
      font-size: 32px;
    }
    :host([size=large]) {
      font-size: 48px;
    }
    :host([size=mega]) {
      font-size: 64px;
    }
  `;
__decorate([
    e({ type: String })
], SpinnerElement.prototype, "size", void 0);
__decorate([
    e({ type: String })
], SpinnerElement.prototype, "variant", void 0);
SpinnerElement = __decorate([
    n('typo3-backend-spinner')
], SpinnerElement);

export { SpinnerElement };
