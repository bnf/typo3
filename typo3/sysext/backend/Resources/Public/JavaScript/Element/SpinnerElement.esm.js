import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { property, customElement } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lib/decorators.esm.js';
import { css } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lib/css-tag.esm.js';
import { LitElement } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';

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
/**
 * Module: TYPO3/CMS/Backend/Element/SpinnerElement
 *
 * @example
 * <typo3-backend-spinner size="small"></typo3-backend-spinner>
 * + attribute size can be one of small, medium, large
 */
let SpinnerElement = class SpinnerElement extends LitElement {
    constructor() {
        super(...arguments);
        this.size = 'small';
    }
    static get styles() {
        return css `
      :host {
        display: block;
      }
      .spinner {
        display: block;
        margin: 2px;
        border-style: solid;
        border-color: #212121 #bababa #bababa;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      .spinner.small {
        border-width: 2px;
        width: 10px;
        height: 10px;
      }
      .spinner.medium {
        border-width: 3px;
        width: 14px;
        height: 14px;
      }
      .spinner.large {
        border-width: 4px;
        width: 20px;
        height: 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    }
    render() {
        return html `<div class="spinner ${this.size}"></div>`;
    }
};
__decorate([
    property({ type: String })
], SpinnerElement.prototype, "size", void 0);
SpinnerElement = __decorate([
    customElement('typo3-backend-spinner')
], SpinnerElement);

export { SpinnerElement };
