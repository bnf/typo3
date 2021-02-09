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

import type {TemplateResult, AttributePart} from 'lit-html';
import {html, render, directive, noChange} from 'lit-html';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {until} from 'lit-html/directives/until';
import Icons = require('TYPO3/CMS/Backend/Icons');

/**
 * @internal
 */
export const renderNodes = (result: TemplateResult): NodeList => {
  const anvil = document.createElement('div');
  render(result, anvil);
  return anvil.childNodes;
};

/**
 * @internal
 */
export const renderHTML = (result: TemplateResult): string => {
  const anvil = document.createElement('div');
  render(result, anvil);
  return anvil.innerHTML;
}

/**
 * @internal
 */
export const lll = (key: string): string => {
  if (!window.TYPO3 || !window.TYPO3.lang || typeof window.TYPO3.lang[key] !== 'string') {
    return '';
  }
  return window.TYPO3.lang[key];
};

/**
 * @internal
 */
export const icon = (identifier: string, size: any = 'small', overlayIdentifier: string = null) => {
  // @todo Fetched and resolved icons should be stored in a session repository in `Icons`
  const icon = Icons.getIcon(identifier, size, overlayIdentifier).then((markup: string) => html`${unsafeHTML(markup)}`);
  return html`${until(icon, html`<typo3-backend-spinner size="${size}"></typo3-backend-spinner>`)}`;
};


/**
 * Based on https://github.com/open-wc/open-wc/blob/master/packages/lit-helpers/src/spread.js
 */
const prevCache: WeakMap<AttributePart, { [key: string]: unknown }> = new WeakMap();
/**
 * @internal
 */
export const spread = directive((spreadData: { [key: string]: unknown }) => (
  part: AttributePart,
) => {
  const prevData = prevCache.get(part);
  if (prevData === spreadData) {
    return;
  }
  prevCache.set(part, spreadData);

  // set new spread data
  if (spreadData) {
    // for in is faster than Object.entries().forEach
    // eslint-disable-next-line guard-for-in
    for (const key in spreadData) {
      const value = spreadData[key];
      if (value === noChange) {
        continue;
      }

      const prefix = key[0];
      const element: any = part.committer.element;

      // event listener
      if (prefix === '@') {
        const prevHandler = prevData && prevData[key];
        if (!prevHandler || prevHandler !== value) {
          const name = key.slice(1);
          if (prevHandler) {
            // @ts-ignore
            element.removeEventListener(name, prevHandler);
          }
          // @ts-ignore
          element.addEventListener(name, value);
        }
        continue;
      }

      // property
      if (prefix === '.') {
        if (!prevData || prevData[key] !== value) {
          element[key.slice(1)] = value;
        }
        continue;
      }

      // boolean attribute
      if (prefix === '?') {
        if (!prevData || prevData[key] !== value) {
          const name = key.slice(1);
          if (value) {
            element.setAttribute(name, '');
          } else {
            element.removeAttribute(name);
          }
        }
        continue;
      }

      // attribute
      if (!prevData || prevData[key] !== value) {
        if (value != null) {
          element.setAttribute(key, String(value));
        } else {
          element.removeAttribute(key);
        }
      }
    }
  }

  // remove previously set spread data if they were removed
  if (prevData) {
    // for in is faster than Object.entries().forEach
    // eslint-disable-next-line guard-for-in
    for (const key in prevData) {
      if (!spreadData || !(key in spreadData)) {
        const prefix = key[0];
        const element: any = part.committer.element;

        // event listener
        if (prefix === '@') {
          // @ts-ignore
          element.removeEventListener(key.slice(1), prevData[key]);
          continue;
        }

        // property
        if (prefix === '.') {
          element[key.slice(1)] = undefined;
          continue;
        }

        // boolean attribute
        if (prefix === '?') {
          element.removeAttribute(key.slice(1));
          continue;
        }

        // attribute
        element.removeAttribute(key);
      }
    }
  }
});
