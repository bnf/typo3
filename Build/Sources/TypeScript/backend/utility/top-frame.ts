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

let topWindow: Window = window;
let topTYPO3: typeof TYPO3 = window.TYPO3;

try {
  // fetch from opening window
  if (window.opener && 'TYPO3' in window.opener) {
    topWindow = window.opener;
  }

  // fetch from parent
  if (window.parent && 'TYPO3' in window.parent) {
    topWindow = window.parent;
  }

  // fetch object from outer frame
  if (window.top && 'TYPO3' in window.top) {
    topWindow = window.top;
  }
} catch (e) {
  // This only happens if the opener, parent or top is some other url (eg a local file)
  // which loaded the current window. Then the browser's cross domain policy jumps in
  // and raises an exception.
  // For this case we are safe and we can create our global object below.
}

type TYPO3type = typeof TYPO3;

if ('TYPO3' in topWindow && typeof topWindow.TYPO3 === 'object') {
  topTYPO3 = topWindow.TYPO3;
} else {
  topTYPO3 = topWindow.TYPO3 = <TYPO3type>{};
}

type ServiceName = keyof TYPO3type;

function getInstance<T extends ServiceName>(
  service: T,
  factory: () => TYPO3type[T],
  frameInitializer: ((instance: TYPO3type[T]) => unknown) = null
): TYPO3type[T] {
  let instance: TYPO3type[T];

  if (service in topTYPO3) {
    instance = topTYPO3[service];
  } else {
    instance = factory();
    topTYPO3[service] = instance;
  }

  if (window.TYPO3 !== topTYPO3 && !(service in window.TYPO3)) {
    window.TYPO3[service] = instance;
    if (frameInitializer !== null) {
      frameInitializer(instance);
    }
  }

  return instance;
}

export {
  topWindow,
  topTYPO3,
  getInstance
};
