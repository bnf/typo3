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

import {html, css, customElement, property, LitElement, TemplateResult, CSSResult} from 'lit-element';

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
 * Module: TYPO3/CMS/Backend/ModuleRouter
 */
@customElement('typo3-backend-module-router')
export class ModuleRouter extends LitElement {
  @property({type: String, reflect: true}) module: string = '';
  @property({type: String, reflect: true}) src: string = '';
  //@property({type: String}) params: string = '';
  //@property({type: Object}) moduleData: any = null;

  private decorate: boolean = false;
  private popstateHandler: (e: PopStateEvent) => void;

  private element: HTMLElement = null;

  public static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        min-height: 100%;
      }
    `;
  }

  constructor() {
    super();

    this.popstateHandler = (e: PopStateEvent) => {
      this._handlePopstate(e);
    }

    this.addEventListener('typo3-module-load', (e: CustomEvent) => {

      const tagName = (e.target as HTMLElement).tagName.toLowerCase();

      console.log('catched load from "' + tagName + '" in module-router', e);

      if (tagName !== 'typo3-iframe-module') {
        const state = {
          tagName: tagName,
          detail: e.detail
        };
        // push dummy route to iframe. as this causes an implicit browser state update
        const url = this.getAttribute('state-tracker') + '?state=' + encodeURIComponent(JSON.stringify(state));
        console.log('setting "' + url + '" on iframe-module in load');
        const iframe = this.querySelector('typo3-iframe-module');
        if (iframe && iframe.getAttribute('src') !== url) {
          iframe.setAttribute('src', url);
        }

        e.stopImmediatePropagation();
        return;
      }

      if (tagName === 'typo3-iframe-module') {
        const url = e.detail.url;
        const slot = this.shadowRoot.querySelector('slot');
        if (url.includes(this.getAttribute('state-tracker'))) {
          const parts = url.split('?state=');
          const state = JSON.parse(decodeURIComponent(parts[1] || ''));
          if (slot && slot.getAttribute('name') !== state.tagName) {
            slot.setAttribute('name', state.tagName)
            const moduleElement = this.querySelector(state.tagName);
            if (moduleElement) {
              moduleElement.setAttribute('src', state.detail.url);
            }
          }
          e.detail.module  = state.detail.module;
          e.detail.url = state.detail.url;
        } else {
          if (slot && slot.getAttribute('name') !== 'typo3-iframe-module') {
            slot.setAttribute('name', 'typo3-iframe-module')
          }
        }
      }

      e.detail.decorate = true;
      if (this.decorate) {
        //e.stopImmediatePropagation();
        e.detail.decorate = true;
        this.decorate = false;
      }
    });
    this.addEventListener('typo3-module-loaded', (e) => {
      console.log('sending load event from module-router', e);
      //this.dispatchEvent(new CustomEvent('load'));
      this.dispatchEvent(new Event('load'));
    });
  }

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    console.log('attribute change: ', name, newval, oldval);
    super.attributeChangedCallback(name, oldval, newval);

    if (name === 'module' || name === 'src') {
      // Trigger refresh, also when attribute is updated with same value
      this.requestUpdate();
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('popstate', this.popstateHandler);
  }

  public disconnectedCallback(): void {
    window.addEventListener('popstate', this.popstateHandler);
    super.disconnectedCallback();
  }

  public render(): TemplateResult {
    const moduleData = this.getRecordFromName(this.module);
    const moduleElement = moduleData.element || 'typo3-iframe-module';

    let element = this.querySelector(moduleElement);
    if (element === null) {
      const moduleElementModule = moduleData.elementModule || 'TYPO3/CMS/Backend/Module/Iframe';
      import(moduleElementModule).catch((e) => console.error('Error importing ' + moduleElementModule + ' for <' + moduleElement + '>'));
      element = document.createElement(moduleElement);
      element.setAttribute('slot', moduleElement);
      this.appendChild(element);
    }

    element.setAttribute('src', this.src);
    element.setAttribute('active', '');
    for (let previous = element.previousElementSibling; previous !== null; previous = previous.previousElementSibling) {
      previous.removeAttribute('active');
    }
    for (let next = element.nextElementSibling; next !== null; next = next.nextElementSibling) {
      next.removeAttribute('active');
    }

    return html`<slot name="${moduleElement}"></slot>`;
    //return html`${immutable(this.element)}`;
  }

  private _handlePopstate(event: PopStateEvent) {
    console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
    if (event.state === null) {
      return;
    }
    if (event.state.module) {
      // @todo avoid pushing new state that originates from this change
      this.setAttribute('module', event.state.module);
      this.decorate = true;
    } else {
      this.removeAttribute('module');
    }
    if (event.state.url) {
      this.setAttribute('src', event.state.url);
      this.decorate = true;
    } else {
      this.removeAttribute('src');
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
