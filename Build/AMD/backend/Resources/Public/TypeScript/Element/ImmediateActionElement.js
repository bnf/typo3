define(['exports', '../Viewport', '../ModuleMenu'], function (exports, Viewport, ModuleMenu) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/Element/ImmediateActionElement
     *
     * @example
     * <typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>
     *
     * This is based on W3C custom elements ("web components") specification, see
     * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
     */
    class ImmediateActionElement extends HTMLElement {
        static getDelegate(action) {
            switch (action) {
                case 'TYPO3.ModuleMenu.App.refreshMenu':
                    return ModuleMenu.App.refreshMenu.bind(ModuleMenu);
                case 'TYPO3.Backend.Topbar.refresh':
                    return Viewport.Topbar.refresh.bind(Viewport.Topbar);
                default:
                    throw Error('Unknown action "' + action + '"');
            }
        }
        /**
         * Observed attributes handled by `attributeChangedCallback`.
         */
        static get observedAttributes() {
            return ['action'];
        }
        /**
         * Custom element life-cycle callback initializing attributes.
         */
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'action') {
                this.action = newValue;
            }
        }
        /**
         * Custom element life-cycle callback triggered when element
         * becomes available in document ("connected to DOM").
         */
        connectedCallback() {
            if (!this.action) {
                throw new Error('Missing mandatory action attribute');
            }
            // @todo similar to ActionDispatcher, it might be required to pass custom arguments
            ImmediateActionElement.getDelegate(this.action).apply(null, []);
        }
    }
    window.customElements.define('typo3-immediate-action', ImmediateActionElement);

    exports.ImmediateActionElement = ImmediateActionElement;

    Object.defineProperty(exports, '__esModule', { value: true });

});
