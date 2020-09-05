import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { query as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import { lll } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';

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
 * Module: TYPO3/CMS/Backend/Module/Iframe
 */
const componentName = 'typo3-iframe-module';
let IframeModuleElement = class IframeModuleElement extends h {
    constructor() {
        super(...arguments);
        this.endpoint = '';
    }
    createRenderRoot() {
        // Disable shadow root as <iframe> needs to be accessible
        // via top.list_frame for legacy-code and backwards compatibility.
        return this;
    }
    render() {
        if (!this.endpoint) {
            return T ``;
        }
        return T `
      <iframe
        src="${this.endpoint}"
        name="list_frame"
        id="typo3-contentIframe"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        title="${lll('iframe.listFrame')}"
        scrolling="no"
        @load="${this._loaded}"
      ></iframe>
    `;
    }
    attributeChangedCallback(name, old, value) {
        super.attributeChangedCallback(name, old, value);
        if (name === 'endpoint' && value === old) {
            // Trigger explicit reload if value has been reset to current value,
            // lit doesn't re-set the attribute in this case.
            this.iframe.setAttribute('src', value);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.endpoint) {
            this.dispatch('typo3-iframe-load', { url: this.endpoint, title: null });
        }
    }
    registerUnloadHandler(iframe) {
        try {
            iframe.contentWindow.addEventListener('unload', (e) => this._unload(e, iframe), { once: true });
        }
        catch (e) {
            console.error('Failed to access contentWindow of module iframe – using a foreign origin?');
            throw e;
        }
    }
    retrieveModuleStateFromIFrame(iframe) {
        var _a;
        try {
            return {
                url: iframe.contentWindow.location.href,
                title: iframe.contentDocument.title,
                module: (_a = iframe.contentDocument.body.querySelector('.module[data-module-name]')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-module-name')
            };
        }
        catch (e) {
            console.error('Failed to access contentWindow of module iframe – using a foreign origin?');
            return { url: this.endpoint, title: null };
        }
    }
    _loaded({ target }) {
        const iframe = target;
        // The event handler for the "unload" event needs to be attached
        // after every iframe load (for the current iframes's contentWindow).
        this.registerUnloadHandler(iframe);
        const state = this.retrieveModuleStateFromIFrame(iframe);
        this.dispatch('typo3-iframe-loaded', state);
    }
    _unload(e, iframe) {
        // Asynchronous execution needed because the URL changes immediately after
        // the `unload` event is dispatched, but has not been changed right now.
        new Promise((resolve) => window.setTimeout(resolve, 0)).then(() => {
            if (iframe.contentWindow !== null) {
                this.dispatch('typo3-iframe-load', { url: iframe.contentWindow.location.href, title: null });
            }
        });
    }
    dispatch(type, state) {
        this.dispatchEvent(new CustomEvent(type, { detail: state, bubbles: true, composed: true }));
    }
};
__decorate([
    e({ type: String })
], IframeModuleElement.prototype, "endpoint", void 0);
__decorate([
    o('iframe', true)
], IframeModuleElement.prototype, "iframe", void 0);
IframeModuleElement = __decorate([
    n(componentName)
], IframeModuleElement);

export { IframeModuleElement, componentName };
