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

import {html, css, customElement, property, internalProperty, LitElement, TemplateResult, CSSResult, PropertyValues} from 'lit-element';
import {until} from 'lit-html/directives/until';
import {ifDefined} from 'lit-html/directives/if-defined';
import {live} from 'lit-html/directives/live';
import {repeat} from 'lit-html/directives/repeat';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';

import Loader = require('TYPO3/CMS/Backend/Viewport/Loader');

import 'TYPO3/CMS/Backend/Element/Module';
import 'TYPO3/CMS/Backend/Element/SpinnerElement';

/**
 * Module: TYPO3/CMS/Lowlevel/ConfigurationModule
 */
@customElement('typo3-lowlevel-configuration-module')
export class ConfigurationModule extends LitElement {
  @property({type: String, reflect: true}) src: string = '';
  @property({type: String, reflect: true}) search: string = '';
  @property({type: Boolean, reflect: true}) regex: boolean = false;
  @property({type: Boolean}) active: boolean = false;

  @internalProperty() data: any = null;
  @internalProperty() loading: boolean = false;
  @internalProperty() load: boolean = false;

  public static get styles(): CSSResult
  {
    return css`
      :host {
        display: block;
        height: 100%;
      }
    `;
  }

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

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name !== 'active') {
      this.load = true;
    }
  }

  public shouldUpdate(changedProperties: PropertyValues): boolean {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'active' && oldValue !== true) {
        this.load = true;
      }
    });
    return this.active;
  }

  public updated(changedProperties: PropertyValues): void {
    const url = this.src;
    const module = 'system_config';
    console.log('config updated', changedProperties);
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'active' && oldValue !== true) {
        const event = new CustomEvent('typo3-module-load', {
          bubbles: true,
          composed: true,
          detail: {
            module,
            url,
            decorate: false
          }
        });
        console.log('sending out config module load, because of active attr ' + this.src);
        this.dispatchEvent(event);
      }
      if (propName === 'loading' && oldValue !== true) {
        Loader.start();
      }
      if (propName === 'loading' && oldValue === true) {
        // @todo use event, together with a counter in module-router
        Loader.finish();
        const event = new CustomEvent('typo3-module-loaded', {
          bubbles: true,
          composed: true,
          detail: {
            url,
            module
          }
        });

        console.log('sending out config module loaded ' + url);
        this.dispatchEvent(event);
      }
    });
  }

  private async loadData(): Promise<any> {
    let url = this.src;
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
        <select @change="${({target}: {target: HTMLSelectElement}) => this.setAttribute('src', target.options[target.selectedIndex].value)}">
          ${repeat(data.items, (item: any) => item.url, (item: any) => html`<option value="${item.url}" selected="${ifDefined(item.active ? true : undefined)}">${item.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>
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
    this.setAttribute('src', href);
    this.removeAttribute('search');
    this.removeAttribute('regex');
  }
}
