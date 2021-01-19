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

import {html, css, customElement, property, internalProperty, LitElement, TemplateResult, CSSResult} from 'lit-element';
import {until} from 'lit-html/directives/until';
import {ifDefined} from 'lit-html/directives/if-defined';
import {live} from 'lit-html/directives/live';
import {repeat} from 'lit-html/directives/repeat';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {lll} from 'TYPO3/CMS/Core/lit-helper';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';

import 'TYPO3/CMS/Backend/Element/Module';

/**
 * Module: TYPO3/CMS/Lowlevel/ConfigurationModule
 */
@customElement('typo3-lowlevel-configuration-module')
export class ConfigurationModule extends LitElement {
  @property({type: String}) src: string = '';
  @property({type: String}) search: string = '';
  @property({type: Boolean}) regex: boolean = false;

  @internalProperty() data: any = null;

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
    if (!this.data) {
      return html`<typo3-backend-module>Loading…</typo3-backend-module>`;
    }

    return html`
      <typo3-backend-module>
        <h1>${lll('configuration')}</h1>
        ${this.renderData()}
      </typo3-backend-module>
    `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    const url = this.src;
    const event = new CustomEvent('typo3-module-load', {
      bubbles: true,
      composed: true,
      detail: {
        url,
        decorate: false
      }
    });
    console.log('sending out config module load ' + url);
    this.dispatchEvent(event);

    this.addEventListener('click', (e) => {
      console.log('click', e);
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      const anchor = e.composedPath().filter(
        n => (n as HTMLElement).tagName === 'A'
      )[0] as HTMLAnchorElement | undefined;
      if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') {
        return;
      }

      const href = anchor.href;
      if (!href || href.indexOf('mailto:') !== -1) {
        return;
      }

      e.preventDefault()
      this.setAttribute('src', href.replace(/#.*/, ''));
      this.removeAttribute('search');
      this.removeAttribute('regex');
    });

    this.loadData();
  }

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval);
    this.loadData();
  }

  public updated(): void {
    const url = this.src;
    const module = 'system_config';
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

  private async loadData(): Promise<any> {
    let url = this.src;
    if (this.search) {
      url += '&searchString=' + encodeURIComponent(this.search);
    }
    if (this.regex) {
      url += '&regexSearch=1';
    }

    const reponse = await new AjaxRequest(url).get({cache: 'no-cache'});
    const data = await reponse.resolve();

    this.data = data;
    //this.requestUpdate();
  }

  private renderData(): TemplateResult {
    const data = this.data;

    return html`
      <span slot="docheader">
        <select @change="${({target}: {target: HTMLSelectElement}) => this.setAttribute('src', target.options[target.selectedIndex].value)}">
          ${repeat(data.items, (item: any) => item.url, (item: any) => html`<option value="${item.url}" selected="${ifDefined(item.active ? true : undefined)}">${item.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>

      <h2>${data.treeName}</h2>
      <div id="lowlevel-config">
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
              <label for="lowlevel-searchString">${lll('enterSearchPhrase')}</label>
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
                      ${lll('useRegExp')}
                  </label>
              </div>
          </div>
          <div class="form-group">
              <input class="btn btn-default" type="submit" name="search" id="search" value="${lll('search')}"/>
          </div>
      </div>

      <div class="nowrap">
        ${this.renderTree(data.treeData)}
      </div>
    `;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const searchstring = (<HTMLInputElement>this.querySelector('input[type="search"]')).value;
    const regexsearch = (<HTMLInputElement>this.querySelector('input[type="checkbox"][name="regexSearch"]')).checked;

    if (searchstring) {
      this.setAttribute('search', searchstring);
    } else {
      this.removeAttribute('search');
    }

    if (regexsearch) {
      this.setAttribute('regex', '');
    } else {
      this.removeAttribute('regex');
    }
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
        ${element.expandable ? html`<a class="list-tree-control ${element.expanded ? 'list-tree-control-open' : 'list-tree-control-closed'}" id="${element.goto}" href="${element.toggle}"><i class="fa"></i></a>` : ''}
        <span class="list-tree-label">${element.label}</span>
        ${element.value ? html` = <span class="list-tree-value">${element.value}</span>`: ''}
        ${element.expanded ? this.renderTree(element.children) : ''}
      </li>
    `;
  }
}
