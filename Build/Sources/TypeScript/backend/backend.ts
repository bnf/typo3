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

import { ReactiveElement, type PropertyValues } from '@lit/reactive-element';
import { customElement, property } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { colorSchemeContext, type ColorScheme } from '@typo3/backend/context/color-scheme';
import { themeContext, type Theme } from '@typo3/backend/context/theme';


/**
 * Module: @typo3/backend/backend
 */
@customElement('typo3-backend')
export class BackendElement extends ReactiveElement {
  @property({ type: String, attribute: 'color-scheme', reflect: true })
  @provide({ context: colorSchemeContext })
  public colorScheme: ColorScheme;

  @property({ type: String, reflect: true })
  @provide({ context: themeContext })
  public theme: Theme;

  public override renderRoot = this;

  protected override updated(changedProperties: PropertyValues<this>): void {
    const styleChangingAttributes: Record<string, string|null> = {};
    if (changedProperties.has('colorScheme') && changedProperties.get('colorScheme') !== undefined) {
      styleChangingAttributes['data-color-scheme'] = this.colorScheme === 'auto' ? null : this.colorScheme;
    }
    if (changedProperties.has('theme') && changedProperties.get('theme') !== undefined) {
      styleChangingAttributes['data-theme'] = this.theme === 'modern' ? null : this.theme;
    }
    if (Object.keys(styleChangingAttributes).length > 0) {
      setStyleChangingDocumentAttributes(styleChangingAttributes);
    }
  }
}

async function setStyleChangingDocumentAttributes(
  styleChangingAttributes: Record<string, string|null>
): Promise<void> {
  const rootEl = document.documentElement;
  const frame = window.frames.list_frame?.document.documentElement;

  const action = () => {
    rootEl.classList.add('t3js-disable-transitions');
    frame?.classList.add('t3js-disable-transitions');

    for (const [attributeName, attributeValue] of Object.entries(styleChangingAttributes)) {
      if (attributeValue === null) {
        rootEl.removeAttribute(attributeName);
        frame?.removeAttribute(attributeName);
      } else {
        rootEl.setAttribute(attributeName, attributeValue);
        frame?.setAttribute(attributeName, attributeValue);
      }
    }
  };

  const cleanup = () => {
    rootEl.classList.remove('t3js-disable-transitions');
    frame?.classList.remove('t3js-disable-transitions');
  };

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    // The fallback condition in the next line (currently needed for firefox) can be removed
    // once view transitions enter baseline "Widely available":
    // https://webstatus.dev/features/view-transitions?q=view+transition
    !('startViewTransition' in document) || typeof document.startViewTransition !== 'function'
  ) {
    action();

    // await animation frame in order for the transition disable to be
    // considered by the time the change-transitions are being started.
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (frame) {
      await new Promise(resolve => window.frames.list_frame.requestAnimationFrame(resolve));
    }
    cleanup();
    return;
  }

  await document.startViewTransition(action).finished;
  cleanup();
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend': BackendElement;
  }
}
