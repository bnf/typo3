import Utility from '../Utility.esm.js';

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
    constructor() {
        super(...arguments);
        this.args = [];
    }
    static async getDelegate(action) {
        switch (action) {
            case 'TYPO3.ModuleMenu.App.refreshMenu':
                const moduleMenuApp = await import('../ModuleMenu.esm.js');
                return moduleMenuApp.default.App.refreshMenu.bind(moduleMenuApp.default.App);
            case 'TYPO3.Backend.Topbar.refresh':
                const viewportObject = await import('../Viewport.esm.js');
                return viewportObject.default.Topbar.refresh.bind(viewportObject.default.Topbar);
            case 'TYPO3.WindowManager.localOpen':
                const windowManager = await import('../WindowManager.esm.js');
                return windowManager.default.localOpen.bind(windowManager);
            case 'TYPO3.Backend.Storage.ModuleStateStorage.update':
                return (await import('../Storage/ModuleStateStorage.esm.js')).ModuleStateStorage.update;
            case 'TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount':
                return (await import('../Storage/ModuleStateStorage.esm.js')).ModuleStateStorage.updateWithCurrentMount;
            default:
                throw Error('Unknown action "' + action + '"');
        }
    }
    /**
     * Observed attributes handled by `attributeChangedCallback`.
     */
    static get observedAttributes() {
        return ['action', 'args', 'args-list'];
    }
    /**
     * Custom element life-cycle callback initializing attributes.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'action') {
            this.action = newValue;
        }
        else if (name === 'args') {
            // `&quot;` is the only literal of a PHP `json_encode` that needs to be substituted
            // all other payload values are expected to be serialized to unicode literals
            const json = newValue.replace(/&quot;/g, '"');
            const args = JSON.parse(json);
            this.args = args instanceof Array ? Utility.trimItems(args) : [];
        }
        else if (name === 'args-list') {
            const args = newValue.split(',');
            this.args = Utility.trimItems(args);
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
        ImmediateActionElement.getDelegate(this.action).then((callback) => callback.apply(null, this.args));
    }
}
window.customElements.define('typo3-immediate-action', ImmediateActionElement);

export { ImmediateActionElement };
