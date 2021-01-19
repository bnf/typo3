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
    });

    this.loadData();
  }

  public attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name === 'src') {
      this.loadData();
    }
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
    const reponse = await new AjaxRequest(this.src).get({cache: 'no-cache'});
    const data = await reponse.resolve();

    this.data = data;
    //this.requestUpdate();
  }

  private async getData(): Promise<TemplateResult> {
    const reponse = await new AjaxRequest(this.src).get({cache: 'no-cache'});
    const data = await reponse.resolve();

    console.log(data);
    //${data.items.map((item: any, v: any) => html`<option value="${item.url}">${item.label}</option>`)}
    return html`
      <span slot="docheader">
        <select .value="${this.src}" @change="${({target}: {target: HTMLSelectElement}) => this.setAttribute('src', target.options[target.selectedIndex].value)}">
          ${repeat(data.items, (item: any) => item.url, (item: any) => html`<option value="${item.url}" selected="${ifDefined(item.active ? true : undefined)}">${item.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>

      ${this.renderTree(data.treeData)}
    `;
    //${unsafeHTML(data.tree)}
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

      ${this.renderTree(data.treeData)}
    `;
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
