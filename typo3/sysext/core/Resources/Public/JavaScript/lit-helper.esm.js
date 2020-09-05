import Icons from '../../../../backend/Resources/Public/JavaScript/Icons.esm.js';
import { render } from './Contrib/lit-html/lib/render.esm.js';
import { html } from './Contrib/lit-html/lit-html.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Element/SpinnerElement.esm.js';
import { unsafeHTML } from './Contrib/lit-html/directives/unsafe-html.esm.js';
import { until } from './Contrib/lit-html/directives/until.esm.js';

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
const renderHTML = (result) => {
    const anvil = document.createElement('div');
    render(result, anvil);
    return anvil.innerHTML;
};
const lll = (key) => {
    if (!window.TYPO3 || !window.TYPO3.lang || typeof window.TYPO3.lang[key] !== 'string') {
        return '';
    }
    return window.TYPO3.lang[key];
};
const icon = (identifier, size = 'small') => {
    // @todo Fetched and resolved icons should be stored in a session repository in `Icons`
    const icon = Icons.getIcon(identifier, size).then((markup) => html `${unsafeHTML(markup)}`);
    return html `${until(icon, html `<typo3-backend-spinner size="${size}"></typo3-backend-spinner>`)}`;
};

export { icon, lll, renderHTML };
