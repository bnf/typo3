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

function waitForComponentToRender(tag: string) {
  return new Promise<HTMLElement>((resolve: Function) => {
    function requestComponent() {
      const element = document.querySelector(tag);
      if (element) {
        resolve(element);
      } else {
        window.requestAnimationFrame(requestComponent);
      }
    }
    requestComponent();
  });
}

describe('TYPO3/CMS/Backend/Element/ImmediateActionElement:', () => {
  it('dispatches action when created via createElement', () => {
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

    document.body.appendChild(element).remove();
    waitForComponentToRender(ImmediateActionElement.tag).then(() => {
      expect(observer.callback).toHaveBeenCalled();
    });
  });

  it('dispatches action when created from string', () => {
    const observer = {
      callback: (): void => {
        return;
      },
    };
    spyOn(observer, 'callback').and.callThrough();

    moduleMenuApp.App.refreshMenu = observer.callback;
    const element = document.createRange().createContextualFragment('<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>').querySelector('typo3-immediate-action');
    expect(observer.callback).not.toHaveBeenCalled();
    document.body.appendChild(element).remove();
    waitForComponentToRender(ImmediateActionElement.tag).then(() => {
      expect(observer.callback).toHaveBeenCalled();
    });
  });

  it('dispatches action when created via innerHTML', () => {
    const observer = {
      callback: (): void => {
        return;
      },
    };
    moduleMenuApp.App.refreshMenu = observer.callback;
    document.body.innerHTML += '<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>';
    waitForComponentToRender(ImmediateActionElement.tag).then((element: HTMLElement) => {
      expect(observer.callback).toHaveBeenCalled();
      element.remove();
    });
  });
});
