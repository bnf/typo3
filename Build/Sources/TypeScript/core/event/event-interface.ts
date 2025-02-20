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

export type Listener<K extends keyof HTMLElementEventMap, T extends EventTarget> = EventListenerWithTarget<K, T> | EventListener;

export interface EventListenerWithTarget<K extends keyof HTMLElementEventMap, T extends EventTarget> {
  (evt: HTMLElementEventMap[K], target?: T): void;
}

export interface EventInterface<T extends EventTarget> {
  bindTo(element: T): void;
  delegateTo(element: T, selector: string): void;
  release(): void;
}
