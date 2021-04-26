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

import {html, css, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators';
import {ModuleState} from './State';

const IFRAME_COMPONENT = 'TYPO3/CMS/Backend/Module/Iframe';

interface Module {
  name: string;
  navigationComponentId: string;
  navigationFrameScript: string;
  navigationFrameScriptParam: string;
  link: string;
  element: string;
  elementModule: string;
}

interface DecoratedModuleState {
  slotName: string;
  detail: ModuleState;
}

// Trigger a render cycle, even if property has been reset to
// the current value (this is to trigger a module refresh).
const alwaysUpdate = (newVal: string, oldVal: string) => true;

/**
 * Module: TYPO3/CMS/Backend/Module/Router
 */
@customElement('typo3-backend-module-router')
export class ModuleRouter extends LitElement {

  @property({type: String, hasChanged: alwaysUpdate})
  module: string = '';

  @property({type: String, hasChanged: alwaysUpdate})
  endpoint: string = '';

  @property({type: String, attribute: 'state-tracker'})
  stateTrackerUrl: string;

  public static styles = css`
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

  constructor() {
    super();

    this.addEventListener('typo3-module-load', (e: CustomEvent<ModuleState>) => {
      const slotName = (e.target as HTMLElement).getAttribute('slot');

      console.log('[router] catched event:module-load from <' + slotName + '>', e, e.detail.url);

      const state: DecoratedModuleState = {
        slotName: slotName,
        detail: e.detail
      };
      // push dummy route to iframe. as this causes an implicit browser state update
      const url = this.stateTrackerUrl + '?state=' + encodeURIComponent(JSON.stringify(state));
      console.log('[router] Pushing state "' + url + '" to iframe-state-tracker due to event:load');
      this.getModuleElement(IFRAME_COMPONENT)
        .then(component => component.setAttribute('endpoint', url));
    });

    this.addEventListener('typo3-module-loaded', (evt: CustomEvent<ModuleState>) => {
      console.log('[router] catched typo3-module-loaded', evt.detail);
      this.updateBrowserState(evt.detail);
    });

    this.addEventListener('typo3-iframe-load', (e: CustomEvent<ModuleState>) => {
      const slotName = (e.target as HTMLElement).getAttribute('slot');
      const slot = this.shadowRoot.querySelector('slot');
      const state: ModuleState = e.detail;
      let url = state.url;
      let module = state.module || undefined;
      let title = state.title || undefined;

      console.log('[router] catched event:iframe-load from <' + slotName + '>', e, url);

      /*
       * Event came frame <typo3-iframe-module>, that means it may
       * a) have been triggered by an explicit iframe src attribute change
       * b) browser history backwards or forward navigation
       *
       * In case of b), the following code block manually updates the slot attribute
       */

      /* If url is the state-tracker url, but does not contain state,
      * a full page reload probably happended in between. (tested in chrome v88) */
     /*
      if (url.endsWith(this.stateTrackerUrl)) {
        const iframe = this.querySelector('typo3-iframe-module');
        if (iframe && iframe.getAttribute('endpoint')) {
          url = iframe.getAttribute('endpoint');
          console.log('[router] overwriting state tracker url with', url);
        }
      }
     */

      if (url.includes(this.stateTrackerUrl + '?state=')) {
        const parts = url.split('?state=');
        const state: DecoratedModuleState = JSON.parse(decodeURIComponent(parts[1] || '{}'));

        url = state.detail.url;
        module = state.detail.module || undefined;
        title = state.detail.title || undefined;

        if (slot && slot.getAttribute('name') !== state.slotName) {
          slot.setAttribute('name', state.slotName)
          this.getModuleElement(state.slotName)
            .then(element => this.markActive(element, state.detail.url));
          console.log('[router] history-navigation detected: updating slot to custom tag name', {slotName: state.slotName, endpoint: state.detail.url});
        }

        this.getModuleElement(state.slotName)
          .then(element => {
            if (element.getAttribute('endpoint') !== state.detail.url) {
              this.markActive(element, state.detail.url);
              console.log('[router] history-navigation detected: updating endpoint for custom tag name', {slotName: state.slotName, endpoint: state.detail.url});
            }
          });

      } else if (slot && slot.getAttribute('name') !== IFRAME_COMPONENT) {
        console.log('[router] history-navigation detected: updating slot name to ' + IFRAME_COMPONENT);
        if (url.includes(this.stateTrackerUrl)) {
          console.log('[router] history-navigation detected: but we do not set slot name');
        } else {
          slot.setAttribute('name', IFRAME_COMPONENT)
          this.getModuleElement(IFRAME_COMPONENT)
            .then(element => this.markActive(element, null));
        }
      }

      const detail: ModuleState = {
        url,
        module,
        title
      };
      this.updateBrowserState(detail);
      this.parentElement.dispatchEvent(new CustomEvent<ModuleState>('typo3-module-load', {
        bubbles: true,
        composed: true,
        detail
      }));
    });

    this.addEventListener('typo3-iframe-loaded', (evt: CustomEvent<ModuleState>) => {
      console.log('[router] catched typo3-iframe-loaded', evt.detail);
      this.updateBrowserState(evt.detail);
      this.parentElement.dispatchEvent(new CustomEvent<ModuleState>('typo3-module-loaded', {
        bubbles: true,
        composed: true,
        detail: evt.detail
      }));
    });
  }

  public render(): TemplateResult {
    const moduleData = this.getRecordFromName(this.module);
    const jsModule = moduleData.elementModule || IFRAME_COMPONENT;

    return html`<slot name="${jsModule}"></slot>`;
  }

  protected updated(): void {
    const moduleData = this.getRecordFromName(this.module);
    const jsModule = moduleData.elementModule || IFRAME_COMPONENT;

    this.getModuleElement(jsModule)
      .then(element => this.markActive(element, this.endpoint));
  }

  private getModuleElement(moduleName: string): Promise<Element> {
    const element = this.querySelector(`*[slot="${moduleName}"]`);
    if (element !== null) {
      return Promise.resolve(element);
    }

    return import(moduleName)
      .then((module): Element => {
        // @todo: Check if .componentName exists
        const element = document.createElement(module.componentName);
        element.setAttribute('slot', moduleName);
        this.appendChild(element);
        return element;
      })
      .catch((e) => {
        console.error({msg: `Error importing ${moduleName} as backend module`, err: e})
        throw e;
      });
  }

  private markActive(element: Element, endpoint: string|null): void {
    if (endpoint) {
      element.setAttribute('endpoint', endpoint);
    }
    element.setAttribute('active', '');
    for (let previous = element.previousElementSibling; previous !== null; previous = previous.previousElementSibling) {
      previous.removeAttribute('active');
    }
    for (let next = element.nextElementSibling; next !== null; next = next.nextElementSibling) {
      next.removeAttribute('active');
    }
  }

  private updateBrowserState(state: ModuleState): void {
    const url = new URL(state.url || '', window.location.origin);
    const params = new URLSearchParams(url.search);

    if (!params.has('token')) {
      // non token-urls (e.g. backend install tool) cannot be mapped by
      // the main backend controller right now
      return;
    }

    params.delete('token');
    url.search = params.toString();

    const niceUrl = url.toString();
    window.history.replaceState(state, '', niceUrl);

    const title = state.title || null;
    if (title) {
      document.title = title;
    }
  }

  /**
   * Gets the module properties from module menu markup (data attributes)
   *
   * @param {string} name
   * @returns {Module}
   */
  private getRecordFromName(name: string): Module {
    const subModuleElement = document.getElementById(name);
    if (!subModuleElement) {
      return {
        name: '',
        navigationComponentId: '',
        navigationFrameScript: '',
        navigationFrameScriptParam: '',
        link: '',
        element: '',
        elementModule: ''
      };
    }
    return {
      name: name,
      navigationComponentId: subModuleElement.dataset.navigationcomponentid,
      navigationFrameScript: subModuleElement.dataset.navigationframescript,
      navigationFrameScriptParam: subModuleElement.dataset.navigationframescriptparameters,
      link: subModuleElement.dataset.link,
      element: subModuleElement.dataset.element,
      elementModule: subModuleElement.dataset.elementModule,
    };
  }
}
