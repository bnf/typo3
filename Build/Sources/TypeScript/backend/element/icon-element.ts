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

import { html, LitElement, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { until } from 'lit/directives/until';
import { Sizes, States, MarkupIdentifiers } from '../enum/icon-types';
import Icons, { IconStyles } from '../icons';
import '@typo3/backend/element/spinner-element';

/**
 * Module: @typo3/backend/element/icon-element
 *
 * @example
 * <typo3-backend-icon identifier="data-view-page" size="small"></typo3-backend-icon>
 */
@customElement('typo3-backend-icon')
export class IconElement extends LitElement {
  static styles = IconStyles.getStyles();

  @property({ type: String }) identifier: string;
  /**
   * The `inline` attribute may be used to force inline rendering of the icon,
   * in order to automatically position in a line next to text nodes.
   * Note that this is only needed when the containing element does not use
   * layouting techniques like flexbox and requires.
   * This attribute uses vertical-align workaround/hack, which is why this
   * attribute is not enabled by default and should be avoided if possible.
   */
  @property({ type: Boolean, reflect: true }) inline: boolean = false;
  @property({ type: String, reflect: true }) size: Sizes = Sizes.default;
  @property({ type: String }) state: States = States.default;
  @property({ type: String }) overlay: string = null;
  @property({ type: String }) markup: MarkupIdentifiers = MarkupIdentifiers.inline;

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
  @property({ type: String }) raw?: string = null;

  public render(): TemplateResult | symbol {
    if (this.raw) {
      return html`${unsafeHTML(this.raw)}`;
    }

    if (!this.identifier) {
      return nothing;
    }

    const icon = Icons.getIcon(this.identifier, this.size, this.overlay, this.state, this.markup)
      .then((markup: string) => html`${unsafeHTML(markup)}`)

    const spinner = document.createElement('typo3-backend-spinner');
    spinner.size = this.size;
    return html`${until(icon, html`${spinner}`)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-icon': IconElement;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-icon': IconElement;
  }
}
