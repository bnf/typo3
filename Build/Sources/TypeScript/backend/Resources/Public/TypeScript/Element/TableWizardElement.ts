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

import {Template, html, unsafe} from 'TYPO3/CMS/Backend/Element/Template';
import SecurityUtility from 'TYPO3/CMS/Core/SecurityUtility';
import Icons = require('TYPO3/CMS/Backend/Icons');

const _lll = (key: string) => {
  return TYPO3.lang[key];
}

const _icon = (identifier: string): string => {
  const id = '@promise-' + (new SecurityUtility()).getRandomHexValue(20);
  Icons.getIcon(identifier, Icons.sizes.small).then((iconMarkup: string) => {
    document.getElementById(id).outerHTML = iconMarkup;
  });
  const proxy = document.createElement('span');
  proxy.id = id;
  return proxy.outerHTML;
}

/**
 * Module: TYPO3/CMS/Backend/Element/TableWizardElement
 *
 * @example
 * <typo3-backend-table-wizard table="[["quot;a"quot;,"quot;b"quot;],["quot;c"quot;,"quot;d"quot;]]">
 * </typo3-backend-table-wizard
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
export class TableWizardElement extends HTMLElement {
  private type: string = 'textarea';
  private table: string[][] = [];
  private appendRows: number = 1;
  private l10n: any = {};

  private get firstRow(): string[] {
    return this.table[0] || [];
  }

  /**
   * Observed attributes handled by `attributeChangedCallback`.
   */
  public static get observedAttributes(): string[] {
    return ['type', 'table', 'append-rows', 'l10n'];
  }

  public constructor() {
    super();
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  /**
   * Custom element life-cycle callback initializing attributes.
   */
  public attributeChangedCallback(name: string, oldValue: any, newValue: any): void {
    switch (name) {
      case 'type':
        this.type = newValue;
        break;
      case 'table':
        this.table = JSON.parse(newValue) || [];
        break;
      case 'append-rows':
        this.appendRows = parseInt(newValue, 10);
        break;
      case 'l10n':
        this.l10n = JSON.parse(newValue) || {};
        break;
      default:
    }
  }

  /**
   * Custom element life-cycle callback triggered when element
   * becomes available in document ("connected to DOM").
   */
  public connectedCallback(): void {
    this.render();
  }

  public render(): void {
    this.renderTemplate().mountTo(this.createRenderRoot(), true);
  }

  private provideMinimalTable(): void {
    if (this.table.length === 0 || this.firstRow.length === 0) {
      // create a table with one row and one column
      this.table = [
        ['']
      ];
    }
  }

  private modifyTable(evt: Event, rowIndex: number, colIndex: number): void {
    const target = evt.target as HTMLInputElement | HTMLTextAreaElement;
    this.table[rowIndex][colIndex] = target.value;
  }

  private toggleType(evt: Event): void {
    this.type = this.type === 'input' ? 'textare' : 'input';
    this.render();
  }

  private moveColumn(evt: Event, col: number, target: number): void {
    this.table = this.table.map((row: string[]): string[] => {
      const temp = row.splice(col, 1);
      row.splice(target, 0, ...temp);
      return row;
    });
    this.render();
  }

  private appendColumn(evt: Event, col: number): void {
    this.table = this.table.map((row: string[]): string[] => {
      row.splice(col + 1, 0, '');
      return row;
    });
    this.render();
  }

  private removeColumn(evt: Event, col: number): void {
    this.table = this.table.map((row: string[]): string[] => {
      row.splice(col, 1);
      return row;
    });
    this.render();
  }

  private moveRow(evt: Event, row: number, target: number): void {
    const temp = this.table.splice(row, 1);
    this.table.splice(target, 0, ...temp);
    this.render();
  }

  private appendRow(evt: Event, row: number): void {
    let columns = this.firstRow.concat().fill('');
    let rows = (new Array(this.appendRows)).fill(columns);
    this.table.splice(row + 1, 0, ...rows);
    this.render();
  }

  private removeRow(evt: Event, row: number): void {
    this.table.splice(row, 1);
    this.render();
  }

  private renderTemplate(): Template {
    const colIndexes = Object.keys(this.firstRow).map((item: string) => parseInt(item, 10));
    const lastColIndex = colIndexes[colIndexes.length - 1];
    const lastRowIndex = this.table.length - 1;

    return html`
      <style>
        :host, typo3-backend-table-wizard { display: inline-block; }
      </style>
      <div class="table-fit table-fit-inline-block">
        <table class="table table-center">
          <thead>
            <th>${this.renderTypeButton()}</th>
            ${colIndexes.map((colIndex: number) => html`
            <th>${this.renderColButtons(colIndex, lastColIndex)}</th>
            `)}
          </thead>
          <tbody>
            ${this.table.map((row: string[], rowIndex: number) => html`
            <tr>
              <th>${this.renderRowButtons(rowIndex, lastRowIndex)}</th>
              ${row.map((value: string, colIndex: number) => html`
              <td>${this.renderDataElement(value, rowIndex, colIndex)}</td>
              `)}
            </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderDataElement(value: string, rowIndex: number, colIndex: number): Template {
    const modifyTable = (evt: Event) => this.modifyTable(evt, rowIndex, colIndex);
    switch (this.type) {
      case 'input':
        return html`
          <input class="form-control" type="text" name="TABLE[c][${rowIndex}][${colIndex}]"
            @change="${modifyTable}" value="${value}">
        `;
      case 'textarea':
      default:
        let encodedValue = this.convertLineBreaks(value);
        return html`
          <textarea class="form-control" rows="6" name="TABLE[c][${rowIndex}][${colIndex}]"
            @change="${modifyTable}">${encodedValue}</textarea>
        `;
    }
  }

  private convertLineBreaks(value: string): Template {
    const newLine = String.fromCharCode(10);
    const pattern = new RegExp('<br[ ]*\\/?>', 'g');
    // `<script>...</script><br>okay` -->> `&lt;script&gt;...&lt;/script&gt;<br>okay`
    // (new-lines were converted again in DOM to `<br>` - however, XSS parts are encoded)
    const encodedValue = html`${value.replace(pattern, newLine)}`;
    // `&lt;script&gt;...&lt;/script&gt;<br>okay` -->> `&lt;script&gt;...&lt;/script&gt;{\n}okay`
    const encodedValueWithoutLineBreaks = encodedValue.getHtml().replace(pattern, newLine);
    // instruct template rendering to skip encoding
    return unsafe`${encodedValueWithoutLineBreaks}`;
  }

  private renderTypeButton(): Template {
    return html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${_lll('table_smallFields')}"
          @click="${(evt: Event) => this.toggleType(evt)}">
          ${_icon(this.type === 'input' ? 'actions-chevron-expand' : 'actions-chevron-contract')}
        </button>
      </span>
    `;
  }

  private renderColButtons(col: number, last: number): Template {
    const leftButton = {
      title: col === 0 ? _lll('table_end') : _lll('table_left'),
      class: col === 0 ? 'double-right' : 'left',
      target: col === 0 ? last : col - 1,
    };
    const rightButton = {
      title: col === last ? _lll('table_start') : _lll('table_right'),
      class: col === last ? 'double-left' : 'right',
      target: col === last ? 0 : col + 1,
    };
    return html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${leftButton.title}"
                @click="${(evt: Event) => this.moveColumn(evt, col, leftButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${leftButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${rightButton.title}"
                @click="${(evt: Event) => this.moveColumn(evt, col, rightButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${rightButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${_lll('table_removeColumn')}"
                @click="${(evt: Event) => this.removeColumn(evt, col)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${_lll('table_addColumn')}"
                @click="${(evt: Event) => this.appendColumn(evt, col)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `;
  }

  private renderRowButtons(row: number, last: number): Template {
    const topButton = {
      title: row === 0 ? _lll('table_bottom') : _lll('table_up'),
      class: row === 0 ? 'double-down' : 'up',
      target: row === 0 ? last : row - 1,
    };
    const bottomButton = {
      title: row === last ? _lll('table_top') : _lll('table_down'),
      class: row === last ? 'double-up' : 'down',
      target: row === last ? 0 : row + 1,
    };
    return html`
      <span class="btn-group${this.type === 'input' ? '' : '-vertical'}">
        <button class="btn btn-default" type="button" title="${topButton.title}"
                @click="${(evt: Event) => this.moveRow(evt, row, topButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${topButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${bottomButton.title}"
                @click="${(evt: Event) => this.moveRow(evt, row, bottomButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${bottomButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${_lll('table_removeRow')}"
                @click="${(evt: Event) => this.removeRow(evt, row)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${_lll('table_addRow')}"
                @click="${(evt: Event) => this.appendRow(evt, row)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `;
  }
}

window.customElements.define('typo3-backend-table-wizard', TableWizardElement);
