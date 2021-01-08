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
import {templateContent} from 'lit-html/directives/template-content'
import {lll} from 'TYPO3/CMS/Core/lit-helper';

import {BroadcastMessage} from 'TYPO3/CMS/Backend/BroadcastMessage';
import BroadcastService = require('TYPO3/CMS/Backend/BroadcastService');

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
  @property({type: String}) module: string = '';
  @property({type: String}) src: string = '';
  @property({type: String}) params: string = '';
  @property({type: Object}) moduleData: any = null;

  // for iframe contentWindow.location backwards compatibility
  public contentWindow: { location: { href: string, reload: Function } };

  private decorate: boolean = false;
  private popstateHandler: (e: PopStateEvent) => void;
  private url: HTMLAnchorElement;

  public static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        height: 100%;
      }
    `;
  }

  constructor() {
    super();

    this.popstateHandler = (e: PopStateEvent) => {
      this._handlePopstate(e);
    }

    this.addEventListener('typo3-module-load', (e: CustomEvent) => {
      console.log('catched load in module-router', e);

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

    // Setup iframe.contentWindow.location backwards compatibility, e.g.
    // for code that uses `top.list_frame.location.href = '…'`
    // see PHP method goto_altDoc()
    this.classList.add('t3js-scaffold-content-module-iframe');
    this.setAttribute('id', 'typo3-contentIframe');
    this.setAttribute('name', 'list_frame');
    this.url = document.createElement('a');
    (window as any).list_frame = this.contentWindow = Object.create(Object.prototype, {
      location: {
        value: Object.create(Object.prototype, {
          href: {
            get: () => this.src,
            set: (val) => {
              this.setAttribute('src', val);
              this.removeAttribute('module');
            }
          },
          reload: {
            value: () => {
              this.requestUpdate();
            }
          },
          replace: {
            value: (value: string) => {
              this.setAttribute('src', value);
              // iframe.contentWindow.location.replace() does not push
              // browser state automatically, therefore this change
              // should use pushState. @todo: Test code, where
              // this is actually used. (seems not to be used
              // for iframes in core)
              this.decorate = true;
            }
          },
          hash: { get: () => this.url.hash },
          host: { get: () => this.url.host },
          hostname: { get: () => this.url.hostname },
          origin: { get: () => this.url.origin },
          password: { get: () => this.url.password },
          pathname: { get: () => this.url.pathname },
          port: { get: () => this.url.port },
          protocol: { get: () => this.url.protocol },
          search: { get: () => this.url.search },
          username: { get: () => this.url.username },
          toString: { value: () => this.src },
        })
      },
      // For file list context menu actions, which use
      // `list_frame.document.location`
      document: {
        value: Object.create(Object.prototype, {
          location: {
            get: () => this.contentWindow.location
          }
        })
      },
    });
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadowRoot for now, to allow modules to use topmost
    // Note: It is suggested that modules use shadowRoot(!)
    return this;
  }

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    console.log('attribute change: ', name, newval, oldval);
    super.attributeChangedCallback(name, oldval, newval);
    if (name === 'src' || name === 'module') {
      // Trigger refresh when attribute is updated with same value
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

    const moduleData = this.moduleData || this.getRecordFromName(this.module);
    let moduleElement = moduleData.element || 'typo3-iframe-module';
    let moduleElementModule = moduleData.elementModule || 'TYPO3/CMS/Backend/Module/Iframe';

    console.log('iframe moduledata', moduleData, this.module);
    let src = this.src || moduleData.link || '';


    if (top.nextLoadModuleUrl) {
      moduleElement = 'typo3-iframe-module';
      moduleElementModule = 'TYPO3/CMS/Backend/Module/Iframe';
      src = top.nextLoadModuleUrl;
      top.nextLoadModuleUrl = '';
    }

    console.log('rendering module', {moduleElement, src});

    // Helper for iframe BC (this.contentWindow.location…)
    this.url.href = src;

    const template = document.createElement('template');
    const element = document.createElement(moduleElement);
    element.setAttribute('src', src);
    element.setAttribute('params', this.params);
    template.content.appendChild(element);

    import(moduleElementModule);

    return html`${templateContent(template)}`;
  }

  private _handlePopstate(event: PopStateEvent) {
    console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
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
