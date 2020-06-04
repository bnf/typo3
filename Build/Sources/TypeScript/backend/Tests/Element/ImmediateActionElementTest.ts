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

import ImmediateActionElement = require('TYPO3/CMS/Backend/Element/ImmediateActionElement');
import moduleMenuApp = require('TYPO3/CMS/Backend/ModuleMenu');
import viewportObject = require('TYPO3/CMS/Backend/Viewport');

// Setup the test harness. This will get cleaned out with every test.
const container = document.createElement('div');
document.body.appendChild(container);
let root: HTMLElement; // This will hold the actual element under test.

describe('TYPO3/CMS/Backend/Element/ImmediateActionElement:', () => {

  beforeEach((): void => {
    root = document.createElement('div');
    container.appendChild(root);
  });

  afterEach((): void => {
    container.innerHTML = '';
    root = null;
  });

  it('dispatches action when created via createElement', async () => {
    const observer = {
      callback: (): void => {
        return;
      },
    };
    spyOn(observer, 'callback').and.callThrough();
    viewportObject.Topbar.refresh = observer.callback;
    const element = <ImmediateActionElement>document.createElement('typo3-immediate-action');
    element.setAttribute('action', 'TYPO3.Backend.Topbar.refresh');
    expect(observer.callback).not.toHaveBeenCalled();

    root.appendChild(element);
    await new Promise(window.requestAnimationFrame);
    expect(observer.callback).toHaveBeenCalled();
  });

  it('dispatches action when created from string', async () => {
    const observer = {
      callback: (): void => {
        return;
      },
    };
    spyOn(observer, 'callback').and.callThrough();
    moduleMenuApp.App.refreshMenu = observer.callback;
    const element = document.createRange().createContextualFragment('<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>').querySelector('typo3-immediate-action');
    expect(observer.callback).not.toHaveBeenCalled();

    root.appendChild(element);
    await new Promise(window.requestAnimationFrame);
    expect(observer.callback).toHaveBeenCalled();
  });

  it('dispatches action when created via innerHTML', async () => {
    const observer = {
      callback: (): void => {
        return;
      },
    };
    spyOn(observer, 'callback').and.callThrough();
    moduleMenuApp.App.refreshMenu = observer.callback;

    root.innerHTML += '<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>';
    await new Promise(window.requestAnimationFrame);
    expect(observer.callback).toHaveBeenCalled();
  });
});
