import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { css as i } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/css-tag.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { query as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import { getRecordFromName } from '../Module.esm.js';

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
const IFRAME_COMPONENT = 'TYPO3/CMS/Backend/Module/Iframe';
// Trigger a render cycle, even if property has been reset to
// the current value (this is to trigger a module refresh).
const alwaysUpdate = (newVal, oldVal) => true;
/**
 * Module: TYPO3/CMS/Backend/Module/Router
 */
let ModuleRouter = class ModuleRouter extends h {
    constructor() {
        super();
        this.module = '';
        this.endpoint = '';
        this.addEventListener('typo3-module-load', ({ target, detail }) => {
            const slotName = target.getAttribute('slot');
            this.pushState({ slotName, detail });
        });
        this.addEventListener('typo3-module-loaded', ({ detail }) => {
            this.updateBrowserState(detail);
        });
        this.addEventListener('typo3-iframe-load', ({ detail }) => {
            let state = {
                slotName: IFRAME_COMPONENT,
                detail: detail
            };
            if (state.detail.url.includes(this.stateTrackerUrl + '?state=')) {
                const parts = state.detail.url.split('?state=');
                state = JSON.parse(decodeURIComponent(parts[1] || '{}'));
            }
            /*
             * Event came frame <typo3-iframe-module>, that means it may have been triggered by an
             * a) explicit iframe src attribute change or by
             * b) browser history backwards or forward navigation
             *
             * In case of b), the following code block manually synchronizes the slot attribute
             */
            if (this.slotElement.getAttribute('name') !== state.slotName) {
                // The "name" attribute of <slot> gets of out sync
                // due to browser history backwards or forward navigation.
                // Synchronize to the state as advertised by the iframe event.
                this.slotElement.setAttribute('name', state.slotName);
            }
            // Mark active and sync endpoint attribute for modules.
            // Do not reset endpoint for iframe modules as the URL has already been
            // updated and a reset would trigger a reload and another event cycle.
            this.markActive(state.slotName, this.slotElement.getAttribute('name') === IFRAME_COMPONENT ? null : state.detail.url, false);
            this.updateBrowserState(state.detail);
            // Send load event (e.g. to be handled by ModuleMenu).
            // Dispated via parent element to prevent routers own event handlers to be invoked.
            // @todo: Introduce a separate event (name) to prevent the parentElement workaround?
            this.parentElement.dispatchEvent(new CustomEvent('typo3-module-load', {
                bubbles: true,
                composed: true,
                detail: state.detail
            }));
        });
        this.addEventListener('typo3-iframe-loaded', ({ detail }) => {
            this.updateBrowserState(detail);
            this.parentElement.dispatchEvent(new CustomEvent('typo3-module-loaded', {
                bubbles: true,
                composed: true,
                detail
            }));
        });
    }
    render() {
        const moduleData = getRecordFromName(this.module);
        const jsModule = moduleData.component || IFRAME_COMPONENT;
        return T `<slot name="${jsModule}"></slot>`;
    }
    updated() {
        const moduleData = getRecordFromName(this.module);
        const jsModule = moduleData.component || IFRAME_COMPONENT;
        this.markActive(jsModule, this.endpoint);
    }
    async markActive(jsModule, endpoint, forceEndpointReset = true) {
        const element = await this.getModuleElement(jsModule);
        if (endpoint && (forceEndpointReset || element.getAttribute('endpoint') !== endpoint)) {
            element.setAttribute('endpoint', endpoint);
        }
        if (!element.hasAttribute('active')) {
            element.setAttribute('active', '');
        }
        for (let previous = element.previousElementSibling; previous !== null; previous = previous.previousElementSibling) {
            previous.removeAttribute('active');
        }
        for (let next = element.nextElementSibling; next !== null; next = next.nextElementSibling) {
            next.removeAttribute('active');
        }
    }
    async getModuleElement(moduleName) {
        let element = this.querySelector(`*[slot="${moduleName}"]`);
        if (element !== null) {
            return element;
        }
        try {
            const module = await import(moduleName);
            // @todo: Check if .componentName exists
            element = document.createElement(module.componentName);
        }
        catch (e) {
            console.error({ msg: `Error importing ${moduleName} as backend module`, err: e });
            throw e;
        }
        element.setAttribute('slot', moduleName);
        this.appendChild(element);
        return element;
    }
    async pushState(state) {
        const url = this.stateTrackerUrl + '?state=' + encodeURIComponent(JSON.stringify(state));
        // push dummy route to iframe. to trigger an implicit browser state update
        const component = await this.getModuleElement(IFRAME_COMPONENT);
        component.setAttribute('endpoint', url);
    }
    updateBrowserState(state) {
        const url = new URL(state.url || '', window.location.origin);
        const params = new URLSearchParams(url.search);
        const title = 'title' in state ? state.title : '';
        // update/reset document.title if state.title is not null
        // (state.title === null indicates "keep current title")
        if (title !== null) {
            const titleComponents = [this.sitename];
            if (title !== '') {
                titleComponents.unshift(title);
            }
            if (this.sitenameFirst) {
                titleComponents.reverse();
            }
            document.title = titleComponents.join(' · ');
        }
        if (!params.has('token')) {
            // non token-urls (e.g. backend install tool) cannot be mapped by
            // the main backend controller right now
            return;
        }
        params.delete('token');
        url.search = params.toString();
        const niceUrl = url.toString();
        window.history.replaceState(state, '', niceUrl);
    }
};
ModuleRouter.styles = i `
    :host {
      width: 100%;
      min-height: 100%;
      flex: 1 0 auto;
      display: flex;
      flex-direction: row;
    }
    ::slotted(*) {
      min-height: 100%;
      width: 100%;
    }
  `;
__decorate([
    e({ type: String, hasChanged: alwaysUpdate })
], ModuleRouter.prototype, "module", void 0);
__decorate([
    e({ type: String, hasChanged: alwaysUpdate })
], ModuleRouter.prototype, "endpoint", void 0);
__decorate([
    e({ type: String, attribute: 'state-tracker' })
], ModuleRouter.prototype, "stateTrackerUrl", void 0);
__decorate([
    e({ type: String, attribute: 'sitename' })
], ModuleRouter.prototype, "sitename", void 0);
__decorate([
    e({ type: Boolean, attribute: 'sitename-first' })
], ModuleRouter.prototype, "sitenameFirst", void 0);
__decorate([
    o('slot', true)
], ModuleRouter.prototype, "slotElement", void 0);
ModuleRouter = __decorate([
    n('typo3-backend-module-router')
], ModuleRouter);

export { ModuleRouter };
