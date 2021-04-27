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

import {html, css, LitElement, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {until} from 'lit/directives/until';
import {ifDefined} from 'lit/directives/if-defined';
import {live} from 'lit/directives/live';
import {repeat} from 'lit/directives/repeat';
import {unsafeHTML} from 'lit/directives/unsafe-html';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';

import Loader = require('TYPO3/CMS/Backend/Viewport/Loader');
import {ModuleState} from 'TYPO3/CMS/Backend/Module/State';

import 'TYPO3/CMS/Backend/Element/Module';
import 'TYPO3/CMS/Backend/Element/ButtonElement';
import 'TYPO3/CMS/Backend/Element/SpinnerElement';

export const componentName = 'typo3-lowlevel-configuration-module';

/**
 * Module: TYPO3/CMS/Lowlevel/ConfigurationModule
 */
@customElement(componentName)
export class ConfigurationModule extends LitElement {
  @property({type: String, reflect: true}) endpoint: string = '';
  @property({type: String, reflect: true}) search: string = '';
  @property({type: Boolean, reflect: true}) regex: boolean = false;
  @property({type: Boolean}) active: boolean = false;

  @state() data: any = null;
  @state() loading: boolean = false;
  @state() load: boolean = false;

  public static styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadowRoot for now, to allow css classes to work
    return this;
  }

  public render(): TemplateResult {
    if ((this.data === null || this.load) && !this.loading) {
      this.loadData();
    }

    if (!this.data) {
      return html`
        <typo3-backend-module>
          <typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>
        </typo3-backend-module>
      `;
    }

    return html`
      <typo3-backend-module>
        <h1>${this.data.labels.configuration}</h1>
        ${this.renderData()}
      </typo3-backend-module>
    `;
  }

  public shouldUpdate(changedProperties: PropertyValues): boolean {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'endpoint') {
        this.load = true;
      }
      if (propName === 'active' && oldValue !== true) {
        this.load = true;
      }
    });
    return this.active;
  }

  public updated(changedProperties: PropertyValues): void {
    const url = this.endpoint;
    const module = 'system_config';
    console.log('config updated', changedProperties);
    let sendLoadEvent = false;
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'active' && oldValue !== true) {
        sendLoadEvent = true;
      }

      if (propName === 'endpoint') {
        sendLoadEvent = true;
      }

      if (propName === 'loading' && oldValue !== true) {
        Loader.start();
      }
      if (propName === 'loading' && oldValue === true) {
        // @todo use event, together with a counter in module-router
        Loader.finish();
        const event = new CustomEvent<ModuleState>('typo3-module-loaded', {
          bubbles: true,
          composed: true,
          detail: {
            url,
            module,
            title: 'Test'
          }
        });

        console.log('sending out config module loaded ' + url);
        this.dispatchEvent(event);
      }
    });

    if (sendLoadEvent) {
      const event = new CustomEvent<ModuleState>('typo3-module-load', {
        bubbles: true,
        composed: true,
        detail: {
          url,
          module
        }
      });
      this.dispatchEvent(event);
    }
  }

  private async loadData(): Promise<any> {
    let url = this.endpoint;
    if (this.search) {
      url += '&searchString=' + encodeURIComponent(this.search) + '&regexSearch=' + (this.regex ? 1 : 0);
    }

    this.loading = true;
    const reponse = await new AjaxRequest(url).get({cache: 'no-cache'});
    const data = await reponse.resolve();

    this.loading = false;
    this.load = false;
    this.data = data;
  }

  private renderData(): TemplateResult {
    const data = this.data;
    const labels = this.data.labels;

    return html`
      <span slot="docheader">
        <select @change="${({target}: {target: HTMLSelectElement}) => this.endpoint = target.options[target.selectedIndex].value}">
          ${repeat(data.items, (item: any) => item.url, (item: any) => html`<option value="${item.url}" selected="${ifDefined(item.active ? true : undefined)}">${item.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <typo3-backend-button slot="docheader-button-left">Left</typo3-backend-button>
      <typo3-backend-button slot="docheader-button-right">Right</typo3-backend-button>
      ${this.loading ? html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>` : ''}

      <h2>${data.treeName}</h2>
      <div id="lowlevel-config">
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
              <label for="lowlevel-searchString">${labels.enterSearchPhrase}</label>
              <input class="form-control" type="search" id="lowlevel-searchString" name="searchString" .value="${data.searchString}" />
          </div>
          <div class="form-group">
              <div class="checkbox">
                  <label for="lowlevel-regexSearch">
                      <input
                          type="checkbox"
                          class="checkbox"
                          name="regexSearch"
                          id="lowlevel-regexSearch"
                          value="1"
                          checked="${ifDefined(data.regexSearch ? 'checked' : undefined)}"
                      >
                      ${labels.useRegExp}
                  </label>
              </div>
          </div>
          <div class="form-group">
              <input class="btn btn-default" type="submit" name="search" id="search" value="${labels.search}"/>
          </div>
      </div>

      <div>
        ${this.renderTree(data.treeData)}
      </div>
    `;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const searchstring = (<HTMLInputElement>this.querySelector('input[type="search"]')).value;
    const regexsearch = (<HTMLInputElement>this.querySelector('input[type="checkbox"][name="regexSearch"]')).checked;

    this.search = searchstring ? searchstring : null;
    this.regex = regexsearch;
    this.load = true;
  }

  private renderTree(tree: any): TemplateResult {
    return html`
      <ul class="list-tree monospace">
        ${tree.map((element: any) => this.renderElement(element))}
      </ul>
    `;
  }

  private renderElement(element: any): TemplateResult {
    return html`
      <li class="${element.active ? 'active' : ''}">
        ${element.expandable ? html`<a class="list-tree-control ${element.expanded ? 'list-tree-control-open' : 'list-tree-control-closed'}" id="${element.id}" href="${element.toggle}" @click="${this._linkClick}"><i class="fa"></i></a>` : ''}
        <span class="list-tree-label">${element.label}</span>
        ${element.value ? html` = <span class="list-tree-value">${element.value}</span>`: ''}
        ${element.expanded ? this.renderTree(element.children) : ''}
      </li>
    `;
  }

  private _linkClick(e: Event) {
    e.preventDefault()
    const href = (e.target as HTMLElement).getAttribute('href');
    this.endpoint = href;
    this.removeAttribute('search');
    this.removeAttribute('regex');
  }
}
