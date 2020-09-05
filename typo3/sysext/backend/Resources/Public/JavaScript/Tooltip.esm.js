import { Tooltip as Tooltip$1 } from '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
 * The main tooltip object
 *
 * Hint: Due to the current usage of tooltips, this class can't be static right now
 */
class Tooltip {
    static applyAttributes(attributes, node) {
        for (const [attribute, value] of Object.entries(attributes)) {
            node.setAttribute(attribute, value);
        }
    }
    constructor() {
        documentService.ready().then(() => {
            this.initialize('[data-bs-toggle="tooltip"]');
        });
    }
    initialize(selector, options = {}) {
        if (Object.entries(options).length === 0) {
            options = {
                container: 'body',
                trigger: 'hover',
                delay: {
                    show: 500,
                    hide: 100
                }
            };
        }
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            // @ts-ignore
            // todo this method is missing in types/bootstrap.
            // todo see: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/54289
            // todo Remove ts-ignore, when it is added.
            // Ensure elements are not initialized multiple times.
            Tooltip$1.getOrCreateInstance(element, options);
        }
    }
    /**
     * Show tooltip on element(s)
     *
     * @param {NodeListOf<HTMLElement>|HTMLElement|JQuery} elements
     * @param {String} title
     */
    show(elements, title) {
        const attributes = {
            'data-bs-placement': 'auto',
            title: title
        };
        if (!(elements instanceof NodeList || elements instanceof HTMLElement)) {
            console.warn('Passing an jQuery object to Tooltip.show() has been marked as deprecated. Either pass a NodeList or an HTMLElement.');
            for (const [attribute, value] of Object.entries(attributes)) {
                elements.attr(attribute, value);
            }
            elements.tooltip('show');
            return;
        }
        if (elements instanceof NodeList) {
            for (const node of elements) {
                Tooltip.applyAttributes(attributes, node);
                Tooltip$1.getInstance(node).show();
            }
            return;
        }
        if (elements instanceof HTMLElement) {
            Tooltip.applyAttributes(attributes, elements);
            Tooltip$1.getInstance(elements).show();
            return;
        }
    }
    /**
     * Hide tooltip on element(s)
     *
     * @param {NodeListOf<HTMLElement>|HTMLElement|JQuery} elements
     */
    hide(elements) {
        if (!(elements instanceof NodeList || elements instanceof HTMLElement)) {
            console.warn('Passing an jQuery object to Tooltip.hide() has been marked as deprecated. Either pass a NodeList or an HTMLElement.');
            elements.tooltip('hide');
            return;
        }
        if (elements instanceof NodeList) {
            for (const node of elements) {
                const instance = Tooltip$1.getInstance(node);
                if (instance !== null) {
                    instance.hide();
                }
            }
            return;
        }
        if (elements instanceof HTMLElement) {
            Tooltip$1.getInstance(elements).hide();
            return;
        }
    }
}
const tooltipObject = new Tooltip();
// expose as global object
TYPO3.Tooltip = tooltipObject;

export default tooltipObject;
