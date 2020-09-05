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
 * Module: TYPO3/CMS/Backend/WindowManager
 */
class WindowManager {
    constructor() {
        this.windows = {};
        // alias for `localOpen`
        this.open = (...args) => this._localOpen.apply(this, args);
        // @todo Not implemented, yet
        this.globalOpen = (...args) => this._localOpen.apply(this, args);
        this.localOpen = (uri, switchFocus, windowName = 'newTYPO3frontendWindow', windowFeatures = '') => this._localOpen(uri, switchFocus, windowName, windowFeatures);
    }
    _localOpen(uri, switchFocus, windowName = 'newTYPO3frontendWindow', windowFeatures = '') {
        if (!uri) {
            return null;
        }
        if (switchFocus === null) {
            // @todo Check how this would happen, taken from legacy code
            switchFocus = !window.opener;
        }
        else if (switchFocus === undefined) {
            switchFocus = true;
        }
        const existingWindow = this.windows[windowName];
        const existingUri = existingWindow instanceof Window && !existingWindow.closed ? existingWindow.location.href : null;
        if (existingUri === uri) {
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
    }
    else {
        // ensure there is an instance in top/global scope
        top.TYPO3.WindowManager = new WindowManager();
    }
}

export default windowManager;
