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

import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { contentNavigationContext, type ContentNavigationContext } from '@typo3/backend/context/content-navigation';
import { PseudoButtonLitElement } from '@typo3/backend/element/pseudo-button';
import '@typo3/backend/element/icon-element';

export enum ContentNavigationToggleActionEnum {
  collapse = 'collapse',
  expand = 'expand',
}

/**
 * Module: @typo3/backend/viewport/content-navigation-toggle
 *
 * A toggle button component that can be placed anywhere within or related to
 * a content-navigation component. It shows/hides based on the navigation state
 * and renders the appropriate icon and title based on the action.
 *
 * @example
 * <!-- Collapse button in tree toolbar -->
 * <typo3-backend-content-navigation-toggle action="collapse"></typo3-backend-content-navigation-toggle>
 *
 * @example
 * <!-- Expand button in docheader -->
 * <typo3-backend-content-navigation-toggle action="expand"></typo3-backend-content-navigation-toggle>
 */
@customElement('typo3-backend-content-navigation-toggle')
export class ContentNavigationToggle extends PseudoButtonLitElement {
  @property({ type: String }) action: ContentNavigationToggleActionEnum;

  @consume({ context: contentNavigationContext, subscribe: true })
  @state()
  context: ContentNavigationContext;

  protected override render(): TemplateResult {
    if (!this.action) {
      console.error('<typo3-backend-content-navigation-toggle> requires an "action" attribute (collapsed or expanded)');
      return html`nothing`;
    }

    this.updateVisibility();

    if (!this.context) {
      return html`${nothing}`;
    }

    const iconIdentifier = this.action === ContentNavigationToggleActionEnum.collapse ? 'actions-panel-collapse-start' : 'actions-panel-expand-start';

    return html`<typo3-backend-icon identifier=${iconIdentifier} size="small"></typo3-backend-icon>`;
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('context') &&
        !this.hidden &&
        (
          (
            this.context.focusTarget === 'navigation' &&
            this.action === ContentNavigationToggleActionEnum.collapse
          ) || (
            this.context.focusTarget === 'content' &&
            this.action === ContentNavigationToggleActionEnum.expand
          )
        )
    ) {
      this.focus();
    }
  }

  protected buttonActivated(): void {
    this.context.toggle();
  }

  private shouldBeVisible(): boolean {
    if (!this.context || !this.action) {
      return false;
    }

    if (this.action === ContentNavigationToggleActionEnum.collapse) {
      return this.context.shouldShowCollapseButton;
    } else {
      return this.context.shouldShowExpandButton;
    }
  }

  private updateVisibility(): void {
    this.hidden = !this.shouldBeVisible();
    this.updateTitle();
  }

  private updateTitle(): void {
    if (!this.context) {
      return;
    }

    this.title = this.action === ContentNavigationToggleActionEnum.collapse
      ? this.context.navigationLabelCollapse
      : this.context.navigationLabelExpand;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-content-navigation-toggle': ContentNavigationToggle;
  }
}
