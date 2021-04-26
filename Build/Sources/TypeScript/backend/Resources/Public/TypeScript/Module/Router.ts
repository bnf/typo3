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

interface Module {
  name: string;
  navigationComponentId: string;
  navigationFrameScript: string;
  navigationFrameScriptParam: string;
  link: string;
  element: string;
  elementModule: string;
}

/**
 * Module: TYPO3/CMS/Backend/Module/Router
 */
@customElement('typo3-backend-module-router')
export class ModuleRouter extends LitElement {

  @property({type: String, reflect: true}) module: string = '';
  @property({type: String, reflect: true}) endpoint: string = '';
  @property({type: String, attribute: 'state-tracker'}) stateTrackerUrl: string;

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

    this.addEventListener('typo3-module-load', (e: CustomEvent) => {
      const tagName = (e.target as HTMLElement).tagName.toLowerCase();

      console.log('[router] catched event:module-load from <' + tagName + '>', e, e.detail.url);

      if (tagName !== 'typo3-iframe-module') {
        const state = {
          tagName: tagName,
          detail: e.detail
        };
        // push dummy route to iframe. as this causes an implicit browser state update
        const url = this.stateTrackerUrl + '?state=' + encodeURIComponent(JSON.stringify(state));
        console.log('[router] Pushing state "' + url + '" to iframe-state-tracker due to event:load');
        const iframe = this.getModuleElement('typo3-iframe-module', 'TYPO3/CMS/Backend/Module/Iframe');
        if (iframe /*&& iframe.getAttribute('endpoint') !== url*/) {
          iframe.setAttribute('endpoint', url);
        }
      }

      /* Event came frame <typo3-iframe-module>, that means it may
       * a) have been triggered by an explicit iframe src attribute change
       * b) browser history backwards or forward navigation
       *
       * In case of b), the following code block manually updates the slot attribute
       */
      if (tagName === 'typo3-iframe-module') {
        let url = e.detail.url || '';
        const slot = this.shadowRoot.querySelector('slot');

        /* If url is the state-tracker url, but does not contain state,
        * a full page reload probably happended in between. (tested in chrome v88) */
        if (url.endsWith(this.stateTrackerUrl)) {
          const iframe = this.querySelector('typo3-iframe-module');
          if (iframe && iframe.getAttribute('endpoint')) {
            url = iframe.getAttribute('endpoint');
            console.log('[router] overwriting state tracker url with', url);
          }
        }

        if (url.includes(this.stateTrackerUrl + '?state=')) {
          const parts = url.split('?state=');
          const state = JSON.parse(decodeURIComponent(parts[1] || '{}'));
          if (slot && slot.getAttribute('name') !== state.tagName) {
            slot.setAttribute('name', state.tagName)
            const moduleElement = this.querySelector(state.tagName);
            if (moduleElement) {
              this.markActive(moduleElement, state.detail.url);
            }
            console.log('[router] history-navigation detected: updating slot to custom tag name', {tagName: state.tagName, endpoint: state.detail.url});
          }

          const moduleElement = this.querySelector(state.tagName);
          if (moduleElement && moduleElement.getAttribute('endpoint') !== state.detail.url) {
            this.markActive(moduleElement, state.detail.url);
            console.log('[router] history-navigation detected: updating endpoint for custom tag name', {tagName: state.tagName, endpoint: state.detail.url});
          }
          // HEADS UP: writing into the event, overwriting the original values
          e.detail.module = state.detail.module;
          e.detail.url = state.detail.url;
        } else if (slot && slot.getAttribute('name') !== 'typo3-iframe-module') {
          console.log('[router] history-navigation detected: updating slot name to typo3-iframe-module');
          if (url.includes(this.stateTrackerUrl)) {
            console.log('[router] history-navigation detected: but we do not set slot name');
          } else {
            const iframe = this.querySelector('typo3-iframe-module');
            if (iframe) {
              this.markActive(iframe, null);
            }
            slot.setAttribute('name', 'typo3-iframe-module')
          }
        }
      }

      this.setUrlFromState(e.detail);
    });

    this.addEventListener('typo3-module-loaded', (evt: CustomEvent) => {
      console.log('[router] catched typo3-module-loaded', evt.detail);
      this.setUrlFromState(evt.detail);
    });
  }

  public attributeChangedCallback(name: string, old: string, value: string) {
    console.log('[router] attribute change: ', name, value, old);
    super.attributeChangedCallback(name, old, value);

    if (name === 'module' || name === 'endpoint') {
      // Trigger a refresh, even if the attributes are re-set to the current value
      this.requestUpdate();
    }
  }

  public render(): TemplateResult {
    const moduleData = this.getRecordFromName(this.module);
    const tagName = moduleData.element || 'typo3-iframe-module';

    return html`<slot name="${tagName}"></slot>`;
  }

  protected updated(): void {
    const moduleData = this.getRecordFromName(this.module);
    const tagName = moduleData.element || 'typo3-iframe-module';
    const moduleElementModule = moduleData.elementModule || 'TYPO3/CMS/Backend/Module/Iframe';

    const element = this.getModuleElement(tagName, moduleElementModule);
    this.markActive(element, this.endpoint);
  }

  private getModuleElement(tagName: string, moduleName: string): Element {
    let element = this.querySelector(tagName);
    if (element !== null) {
      return element;
    }

    import(moduleName).catch((e) => console.error({msg: `Error importing ${moduleName} for <${tagName}>`, err: e}));

    element = document.createElement(tagName);
    element.setAttribute('slot', tagName);
    this.appendChild(element);

    return element;
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

  private setUrlFromState(state: any): void {
    const url = state.url || null;

    const urlParts = url.split('token=');
    console.log('[router] urlParts', urlParts);
    if (urlParts.length < 2) {
      // non token-urls (e.g. backend install tool) cannot be mapped by
      // the main backend controller right now
      return;
    }
    if (urlParts[0].includes('/install/backend-user-confirmation')) {
      // @todo: this is an ugly hack for the installtool backend
      // module controller
      return;
    }
    const niceUrl = (urlParts[0] + (urlParts[1].split('&', 2)[1] ?? '')).replace(/\?$/, '');

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
