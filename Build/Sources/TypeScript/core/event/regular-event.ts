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

import type { EventInterface, Listener } from './event-interface';

class RegularEvent<K extends keyof HTMLElementEventMap, T extends EventTarget> implements EventInterface<T> {
  protected eventName: string;
  protected callback: Listener;
  protected options: AddEventListenerOptions | boolean;
  private boundElement: T;

  constructor(eventName: K, callback: Listener<T>, options: AddEventListenerOptions | boolean = false) {
    this.eventName = eventName;
    this.callback = callback;
    this.options = options;
  }

  public bindTo(element: T): void {
    if (!element) {
      console.warn(`Binding event ${this.eventName} failed, element was not found.`);
      return;
    }
    this.boundElement = element;
    element.addEventListener(this.eventName, this.callback, this.options);
  }

  public delegateTo(element: EventTarget, selector: string): void {
    if (!element) {
      console.warn(`Delegating event ${this.eventName} failed, element was not found.`);
      return;
    }
    this.boundElement = element;
    element.addEventListener(this.eventName, (e: Event): void => {
      for (let targetElement = <HTMLElement>e.target; targetElement && targetElement !== this.boundElement; targetElement = targetElement.parentElement) {
        if (targetElement.matches(selector)) {
          this.callback.call(targetElement, e, targetElement);
          break;
        }
      }
    }, this.options);
  }

  public release(): void {
    this.boundElement.removeEventListener(this.eventName, this.callback);
  }
}

export default RegularEvent;
