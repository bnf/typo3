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

import Utility from 'TYPO3/CMS/Backend/Utility';

/**
 * Module: TYPO3/CMS/Backend/WindowManager
 */
class WindowManager {
  private windows: {[key: string]: Window} = {};

  // alias for `localOpen`
  public open = (...args: any[]): Window => this._localOpen.apply(this, args);
  // @todo Not implemented, yet
  public globalOpen = (...args: any[]): Window => this._localOpen.apply(this, args);

  public localOpen = (uri: string, switchFocus?: boolean, windowName: string = 'newTYPO3frontendWindow', windowFeatures: string = ''): Window | null => this._localOpen(uri, switchFocus, windowName, windowFeatures);

  private _localOpen(uri: string, switchFocus?: boolean, windowName: string = 'newTYPO3frontendWindow', windowFeatures: string = ''): Window | null {
    if (!uri) {
      return null;
    }
    if (switchFocus === null) {
      // @todo Check how this would happen, taken from legacy code
      switchFocus = !window.opener;
    } else if (switchFocus === undefined) {
      switchFocus = true;
    }
    const existingWindow = this.windows[windowName] ?? window.open('', windowName, windowFeatures);
    let isInstanceOfWindow = false;
    try {
      // Note: `existingWindow instanceof Window` wouldn't work here as `existingWindow` is from another browser context/window.
      // Note: this will still fail if `existingWindow` points to a cross-origin frame
      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof#instanceof_and_multiple_realms
      isInstanceOfWindow = existingWindow.constructor.name === 'Window';
    } catch (DOMException) {
      // Intended fall-thru
      // DOMException is thrown if existingWindow points to a cross-origin frame which we're not allowed to access
    }
    const existingUri = isInstanceOfWindow && !existingWindow.closed ? existingWindow.location.href : null;

    if (Utility.urlsPointToSameServerSideResource(uri, existingUri)) {
      existingWindow.location.replace(uri);
      existingWindow.location.reload();
      return existingWindow;
    }
    const newWindow = window.open(uri, windowName, windowFeatures);
    this.windows[windowName] = newWindow;
    if (switchFocus) {
      newWindow.focus();
    }
    return newWindow;
  }
}

const windowManager = new WindowManager();

if (!top.TYPO3.WindowManager) {
  if (top.document === window.document) {
    // our instance is available in top/global scope
    top.TYPO3.WindowManager = windowManager;
  } else {
    // ensure there is an instance in top/global scope
    top.TYPO3.WindowManager = new WindowManager();
  }
}

export = windowManager;
