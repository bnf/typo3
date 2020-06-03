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

import moduleMenuApp = require('TYPO3/CMS/Backend/ModuleMenu');
import viewportObject = require('TYPO3/CMS/Backend/Viewport');

/**
 * Module: TYPO3/CMS/Backend/Element/ImmediateActionElement
 *
 * @example
 * <typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>
 */
class ImmediateActionElement extends HTMLElement {
  public connectedCallback(): void {
    const delegate = this.getDelegate(this.getAttribute('action'));
    // execute action
    delegate();
  }

  private getDelegate(action: string|null): () => void {
    switch (action) {
      case 'TYPO3.ModuleMenu.App.refreshMenu':
        return moduleMenuApp.App.refreshMenu.bind(moduleMenuApp);
      case 'TYPO3.Backend.Topbar.refresh':
        return viewportObject.Topbar.refresh.bind(viewportObject.Topbar);
      default:
        if (action === null) {
          console.error('Missing immediate action attribute');
        } else {
          console.warn('immediate action: ' + action + ' not found');
        }
        return (): void => {
          // do nothing
        };
    };
  }

  public static get tag(): string {
    return 'typo3-immediate-action';
  }
}

window.customElements.define(ImmediateActionElement.tag, ImmediateActionElement);

export = ImmediateActionElement;
