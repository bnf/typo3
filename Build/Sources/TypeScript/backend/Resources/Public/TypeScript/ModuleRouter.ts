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

class Location {
  public propertyChangedCallback: (property: string) => void;
  private _href: string = '';

  constructor(propertyChangedCallback: (property: string) => void) {
    this.propertyChangedCallback = propertyChangedCallback;
  }

  get href() {
    return this._href;
  }

  set href(val: string) {
    this._href = val;
    this.propertyChangedCallback('href');
  }
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

  // for iframe.location backwards compatibility
  //@property({type: Object, attribute: false}) location: Location;
  public location: Location;

  public static get styles(): CSSResult
  {
    return css`
      :host {
        display: block;
        height: 100%;
      }
    `;
  }

  constructor() {
    super();

    // for iframe.location backwards compatibility, e.g.
    // code that uses `top.list_frame.location.href = '…'`
    // see PHP method goto_altDoc()
    (window as any).list_frame = this;
    this.location = new Location((property: string) => this.requestUpdate());

    // For backwards compatibility
    this.setAttribute('id', 'typo3-contentIframe');
    this.classList.add('t3js-scaffold-content-module-iframe');
    // @todo contentWindow e.g. for iFrame.contentWindow.location.reload
    // add get() method?
    //ScaffoldIdentifierEnum.contentModuleIframe
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadowRoot for now, to allow modules to use topmost
    // Note: It is suggested that modules use shadowRoot(!)
    return this;
  }

  public render(): TemplateResult {

    const href = this.location && this.location.href;
    const moduleData = this.moduleData || this.getRecordFromName(this.module);
    let moduleElement = moduleData.element || 'typo3-iframe-module';
    let moduleElementModule = moduleData.elementModule || 'TYPO3/CMS/Backend/Module/Iframe';

    console.log('iframe moduledata', moduleData, this.module);
    let src = href || this.src || moduleData.link || '';


    if (top.nextLoadModuleUrl) {
      moduleElement = 'typo3-iframe-module';
      moduleElementModule = 'TYPO3/CMS/Backend/Module/Iframe';
      top.nextLoadModuleUrl = '';
    }

    console.log('rendering module', {moduleElement, href, src});

    const template = document.createElement('template');
    const element = document.createElement(moduleElement);
    element.setAttribute('src', src);
    element.setAttribute('params', this.params);
    template.content.appendChild(element);

    import(moduleElementModule);

    return html`${templateContent(template)}`;
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
