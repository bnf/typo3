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

import { html, css, nothing, LitElement, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { Task } from '@lit/task';
//import { ifDefined } from 'lit/directives/if-defined';
//import { live } from 'lit/directives/live';
//import { repeat } from 'lit/directives/repeat';
import AjaxRequest from '@typo3/core/ajax/ajax-request';

import Loader from '@typo3/backend/viewport/loader';
import { ModuleState } from '@typo3/backend/module';

import '@typo3/backend/element/module';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/spinner-element';

import '@typo3/backend/tree/tree-node-toggle';
import '@typo3/backend/utility/collapse-state-persister';
import '@typo3/backend/utility/collapse-state-search';

export const componentName = 'typo3-lowlevel-configuration-module';

// Trigger a render cycle, even if property has been reset to
// the current value (this is to trigger a module refresh).
//const alwaysUpdate = () => true;

type ConfigurationTree = any;

/**
 * Module: @typo3/lowlevel/configuration-module
 */
@customElement(componentName)
export class ConfigurationModule extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;

  @property({ type: Boolean }) active: boolean = false;
  //@property({ type: String, reflect: true, hasChanged: alwaysUpdate }) endpoint: string = '';
  //@property({ type: String, reflect: true, hasChanged: () => this.active }) endpoint: string = '';
  @property({ type: String, reflect: true }) endpoint: string = '';
  @property({ type: String, reflect: true }) search: string = '';
  //@property({ type: Boolean, reflect: true }) regex: boolean = false;

  @state() data: any = null;

  //@state() loading: boolean = false;
  //@state() load: boolean = false;

  private readonly task = new Task(this, {
    task: async ([endpoint]: [string], { signal }): Promise<string> => {
      const response = await new AjaxRequest(endpoint).get({ cache: 'no-cache', signal });
      //return await response.json();
      return await response.resolve();
    },
    args: () => [this.endpoint]
  });

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadowRoot for now, to allow css classes to work
    return this;
  }

  protected render(): TemplateResult {
    const url = this.endpoint;
    const module = 'system_config';
    const content = this.task.render({
      pending: () => {
        Loader.start();
        const event = new CustomEvent<ModuleState>('typo3-module-load', {
          bubbles: true,
          composed: true,
          detail: {
            url,
            module
          }
        });
        this.dispatchEvent(event);
        return html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-size>`;
      },
      complete: (data: any) => {
        this.updateComplete.then(() => {
          Loader.finish();
          const event = new CustomEvent<ModuleState>('typo3-module-loaded', {
            bubbles: true,
            composed: true,
            detail: {
              url,
              module,
              title: data ? `${data.labels.moduleTitle}: ${data.treeName}` : undefined
            }
          });
          console.log('sending out config module loaded ' + url, event);
          this.dispatchEvent(event);
        });
        return this.renderData(data);
      },
      error: () => {
        this.updateComplete.then(() => Loader.finish());
        return html`Failed to Load configuration module`;
      },
    })
    return html`<typo3-backend-module>${content}</typo3-backend-module>`;
  }

  protected shouldUpdate(): boolean {
    return this.active;
  }

  protected updated(changedProperties: PropertyValues): void {
    //const url = this.endpoint;
    //const module = 'system_config';
    console.log('config updated', changedProperties);
    //let sendLoadEvent = false;
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'active' && oldValue !== true) {
        //this.load = true;
        this.task.run();
        //sendLoadEvent = true;
      }

      /*
      if (propName === 'endpoint') {
        //this.load = true;
        this.task.run();
        sendLoadEvent = true;
      }
      */

      /*
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
            title: this.data ? `${this.data.labels.moduleTitle}: ${this.data.treeName}` : undefined
          }
        });

        console.log('sending out config module loaded ' + url);
        this.dispatchEvent(event);
      }
      */
    });

    /*
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
    */
  }

  /*
  private async loadData(): Promise<any> {
    let url = this.endpoint;
    if (this.search) {
      url += '&searchString=' + encodeURIComponent(this.search) + '&regexSearch=' + (this.regex ? 1 : 0);
    }

    console.log('loadData', url);
    this.loading = true;
    const response = await new AjaxRequest(url).get({ cache: 'no-cache' });
    const data = await response.resolve();

    this.loading = false;
    this.load = false;
    this.data = data;
  }
  */

  private createShortcut(data: any) {
    top.TYPO3.ShortcutMenu.createShortcut(
      data.shortcut.routeIdentifier,
      data.shortcut.routeArguments,
      data.shortcut.displayName,
      'Create\u0020a\u0020bookmark\u0020to\u0020this\u0020page',
      this.renderRoot.querySelector('#shortcut-button')
    );
    return false;
  }

  private renderData(data: any): TemplateResult {
    this.data = data;
    const labels = data.labels;

    /*
      <span slot="docheader">
        <select .value=${live(data.self)}
                class="form-select form-select-sm"
                @change="${({ target }: {target: HTMLSelectElement}) => this.endpoint = target.options[target.selectedIndex].value}">
          ${repeat(data.items, (item: any) => item.url, (item: any) => html`<option selected="${ifDefined(item.active ? true : undefined)}" value="${item.url}">${item.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>

      <a href="#" slot="docheader-button-right"
         id="shortcut-button"
         class="btn btn-default btn-sm"
         @click="${() => this.createShortcut(data)}"
         title="Create a bookmark to this page">
        <typo3-backend-icon identifier="actions-system-shortcut-new" size="small"></typo3-backend-icon>
      </a>

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
      */


    return html`
      <form action="" id="ConfigurationView" method="post">
        <h1>${data.labels.moduleTitle}</h1>

        <h2>${data.treeName}</h2>

        <div id="lowlevel-config" class="form-row">
          <div class="form-group">
            <form>
              <label for="searchValue" class="form-label">
                ${labels.enterSearchPhrase}
              </label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control form-control-clearable t3js-collapse-search-term"
                  name="searchValue"
                  id="searchValue"
                  data-persist-collapse-search-key="collapse-search-term-lowlevel-configuration-{treeLabelHash}"
                  value=""
                  minlength="3"
                />
                <button type="submit" class="btn btn-default" aria-label="${labels.searchTitle}" disabled>
                  <typo3-backend-icon identifier="actions-search"></typo3-backend-icon>
                </button>
              </div>
            </form>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge badge-success hidden t3js-collapse-states-search-numberOfSearchMatches"></span>
          </div>
        </div>

        ${data.tree ? html`
          <div class="t3js-collapse-states-search-tree">
            ${this.renderTree(data.tree, data.treeLabelHash)}
          </div>
        ` : nothing}
      </form>
    `;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const searchstring = (<HTMLInputElement>this.querySelector('input[type="search"]')).value;
    //const regexsearch = (<HTMLInputElement>this.querySelector('input[type="checkbox"][name="regexSearch"]')).checked;

    this.search = searchstring ? searchstring : null;
    //this.regex = regexsearch;
    //this.load = true;
    this.task.run();
  }


  private renderTree(tree: ConfigurationTree, labelHash: string, incomingIdentifier: string = ''): TemplateResult {
    const mapper = (key: string, value: string|object|unknown): TemplateResult => {
      if (value === null) {
        return html`
          <li>
            <span class="treelist-group treelist-group-monospace">
              <span class="treelist-label">${key}</span>
              <span class="treelist-operator">=</span>
            </span>
          </li>
        `;
      }

      if (typeof value === 'object') {
        const newId = 'hash-' + hashCode(incomingIdentifier + key);

        return html`
          <li>
            <typo3-backend-tree-node-toggle
              class="treelist-control collapsed"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-list-${newId}"
              aria-expanded="false">
            </typo3-backend-tree-node-toggle>

            <span class="treelist-group treelist-group-monospace">
              <span class="treelist-label">${key}</span>
            </span>

            <div
              class="treelist-collapse collapse"
              data-persist-collapse-state="true"
              data-persist-collapse-state-suffix="lowlevel-configuration-${labelHash}"
              data-persist-collapse-state-if-state="shown"
              data-persist-collapse-state-not-if-search="true"
              id="collapse-list-${newId}"
              >
                ${this.renderTree(value, labelHash, newId)}
            </div>
          </li>
        `;
      }


      return html`
        <li>
          <span class="treelist-group treelist-group-monospace">
            <span class="treelist-label">${key}</span>
            <span class="treelist-operator">=</span>
            <span class="treelist-value">${value}</span>
          </span>
        </li>
      `;
    };

    console.log(tree);
    const content = Array.isArray(tree) ?
      tree.map((value, index) => mapper(index.toString(), value)) :
      Object.entries(tree).map(([key, value]) => mapper(key, value));

    return html`<ul class="treelist">${content}</ul>`;
  }


  /*
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
        <span class="list-tree-group">
          ${element.expandable ? html`
            <a class="list-tree-control ${element.expanded ? 'list-tree-control-open' : 'list-tree-control-closed'}" id="${element.id}" href="${element.toggle}" @click="${this._linkClick}">
              <typo3-backend-icon identifier="${element.expanded ? 'actions-caret-down' : 'actions-caret-right'}" size="small"></typo3-backend-icon>
            </a>` : ''}
          <span class="list-tree-label">${element.label}</span>
          ${element.value ? html` = <span class="list-tree-value">${element.value}</span>` : ''}
          ${element.expanded ? this.renderTree(element.children) : ''}
        </span>
      </li>
    `;
  }

  private _linkClick(e: Event) {
    e.preventDefault()
    const href = (e.currentTarget as HTMLElement).getAttribute('href');
    console.log('setting endpoint to ', href);
    this.endpoint = href;
    this.removeAttribute('search');
    this.removeAttribute('regex');
  }
  */
}

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
