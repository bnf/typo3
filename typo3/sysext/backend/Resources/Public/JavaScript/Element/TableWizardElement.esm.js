import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { property, customElement } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lib/decorators.esm.js';
import { LitElement } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import { lll, icon } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';

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
/**
 * Module: TYPO3/CMS/Backend/Element/TableWizardElement
 *
 * @example
 * <typo3-backend-table-wizard table="[["quot;a"quot;,"quot;b"quot;],["quot;c"quot;,"quot;d"quot;]]">
 * </typo3-backend-table-wizard>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
let TableWizardElement = class TableWizardElement extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'textarea';
        this.table = [];
        this.appendRows = 1;
        this.l10n = {};
    }
    get firstRow() {
        return this.table[0] || [];
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
    render() {
        return this.renderTemplate();
    }
    provideMinimalTable() {
        if (this.table.length === 0 || this.firstRow.length === 0) {
            // create a table with one row and one column
            this.table = [
                ['']
            ];
        }
    }
    modifyTable(evt, rowIndex, colIndex) {
        const target = evt.target;
        this.table[rowIndex][colIndex] = target.value;
        this.requestUpdate();
    }
    toggleType(evt) {
        this.type = this.type === 'input' ? 'textarea' : 'input';
    }
    moveColumn(evt, col, target) {
        this.table = this.table.map((row) => {
            const temp = row.splice(col, 1);
            row.splice(target, 0, ...temp);
            return row;
        });
        this.requestUpdate();
    }
    appendColumn(evt, col) {
        this.table = this.table.map((row) => {
            row.splice(col + 1, 0, '');
            return row;
        });
        this.requestUpdate();
    }
    removeColumn(evt, col) {
        this.table = this.table.map((row) => {
            row.splice(col, 1);
            return row;
        });
        this.requestUpdate();
    }
    moveRow(evt, row, target) {
        const temp = this.table.splice(row, 1);
        this.table.splice(target, 0, ...temp);
        this.requestUpdate();
    }
    appendRow(evt, row) {
        let columns = this.firstRow.concat().fill('');
        let rows = (new Array(this.appendRows)).fill(columns);
        this.table.splice(row + 1, 0, ...rows);
        this.requestUpdate();
    }
    removeRow(evt, row) {
        this.table.splice(row, 1);
        this.requestUpdate();
    }
    renderTemplate() {
        const colIndexes = Object.keys(this.firstRow).map((item) => parseInt(item, 10));
        const lastColIndex = colIndexes[colIndexes.length - 1];
        const lastRowIndex = this.table.length - 1;
        return html `
      <style>
        :host, typo3-backend-table-wizard { display: inline-block; }
      </style>
      <div class="table-fit table-fit-inline-block">
        <table class="table table-center">
          <thead>
            <th>${this.renderTypeButton()}</th>
            ${colIndexes.map((colIndex) => html `
            <th>${this.renderColButtons(colIndex, lastColIndex)}</th>
            `)}
          </thead>
          <tbody>
            ${this.table.map((row, rowIndex) => html `
            <tr>
              <th>${this.renderRowButtons(rowIndex, lastRowIndex)}</th>
              ${row.map((value, colIndex) => html `
              <td>${this.renderDataElement(value, rowIndex, colIndex)}</td>
              `)}
            </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
    }
    renderDataElement(value, rowIndex, colIndex) {
        const modifyTable = (evt) => this.modifyTable(evt, rowIndex, colIndex);
        switch (this.type) {
            case 'input':
                return html `
          <input class="form-control" type="text" name="TABLE[c][${rowIndex}][${colIndex}]"
            @change="${modifyTable}" .value="${value.replace(/\n/g, '<br>')}">
        `;
            case 'textarea':
            default:
                return html `
          <textarea class="form-control" rows="6" name="TABLE[c][${rowIndex}][${colIndex}]"
            @change="${modifyTable}" .value="${value.replace(/<br[ ]*\/?>/g, '\n')}"></textarea>
        `;
        }
    }
    renderTypeButton() {
        return html `
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${lll('table_smallFields')}"
          @click="${(evt) => this.toggleType(evt)}">
          ${icon(this.type === 'input' ? 'actions-chevron-expand' : 'actions-chevron-contract')}
        </button>
      </span>
    `;
    }
    renderColButtons(col, last) {
        const leftButton = {
            title: col === 0 ? lll('table_end') : lll('table_left'),
            class: col === 0 ? 'double-right' : 'left',
            target: col === 0 ? last : col - 1,
        };
        const rightButton = {
            title: col === last ? lll('table_start') : lll('table_right'),
            class: col === last ? 'double-left' : 'right',
            target: col === last ? 0 : col + 1,
        };
        return html `
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${leftButton.title}"
                @click="${(evt) => this.moveColumn(evt, col, leftButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${leftButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${rightButton.title}"
                @click="${(evt) => this.moveColumn(evt, col, rightButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${rightButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${lll('table_removeColumn')}"
                @click="${(evt) => this.removeColumn(evt, col)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${lll('table_addColumn')}"
                @click="${(evt) => this.appendColumn(evt, col)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `;
    }
    renderRowButtons(row, last) {
        const topButton = {
            title: row === 0 ? lll('table_bottom') : lll('table_up'),
            class: row === 0 ? 'double-down' : 'up',
            target: row === 0 ? last : row - 1,
        };
        const bottomButton = {
            title: row === last ? lll('table_top') : lll('table_down'),
            class: row === last ? 'double-up' : 'down',
            target: row === last ? 0 : row + 1,
        };
        return html `
      <span class="btn-group${this.type === 'input' ? '' : '-vertical'}">
        <button class="btn btn-default" type="button" title="${topButton.title}"
                @click="${(evt) => this.moveRow(evt, row, topButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${topButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${bottomButton.title}"
                @click="${(evt) => this.moveRow(evt, row, bottomButton.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${bottomButton.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${lll('table_removeRow')}"
                @click="${(evt) => this.removeRow(evt, row)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${lll('table_addRow')}"
                @click="${(evt) => this.appendRow(evt, row)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `;
    }
};
__decorate([
    property({ type: String })
], TableWizardElement.prototype, "type", void 0);
__decorate([
    property({ type: Array })
], TableWizardElement.prototype, "table", void 0);
__decorate([
    property({ type: Number, attribute: 'append-rows' })
], TableWizardElement.prototype, "appendRows", void 0);
__decorate([
    property({ type: Object })
], TableWizardElement.prototype, "l10n", void 0);
TableWizardElement = __decorate([
    customElement('typo3-backend-table-wizard')
], TableWizardElement);

export { TableWizardElement };
