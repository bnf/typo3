import { render as V } from './Contrib/lit-html/lit-html.esm.js';
import './Contrib/lit/html.esm.js';

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
 * @internal
 */
const renderNodes = (result) => {
    const anvil = document.createElement('div');
    V(result, anvil);
    return anvil.childNodes;
};
/**
 * @internal
 */
const renderHTML = (result) => {
    const anvil = document.createElement('div');
    V(result, anvil);
    return anvil.innerHTML;
};
/**
 * @internal
 */
const lll = (key) => {
    if (!window.TYPO3 || !window.TYPO3.lang || typeof window.TYPO3.lang[key] !== 'string') {
        return '';
    }
    return window.TYPO3.lang[key];
};

export { lll, renderHTML, renderNodes };
