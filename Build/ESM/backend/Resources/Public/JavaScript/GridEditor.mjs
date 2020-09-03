import { SeverityEnum } from './Enum/Severity.mjs';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.mjs';
import Modal from './Modal.mjs';

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
 * Module: TYPO3/CMS/Backend/GridEditor
 * @exports TYPO3/CMS/Backend/GridEditor
 */
class GridEditor {
    /**
     *
     * @param {GridEditorConfigurationInterface} config
     */
    constructor(config = null) {
        this.colCount = 1;
        this.rowCount = 1;
        this.nameLabel = 'name';
        this.columnLabel = 'column label';
        this.defaultCell = { spanned: 0, rowspan: 1, colspan: 1, name: '', colpos: '', column: undefined };
        this.selectorEditor = '.t3js-grideditor';
        this.selectorAddColumn = '.t3js-grideditor-addcolumn';
        this.selectorRemoveColumn = '.t3js-grideditor-removecolumn';
        this.selectorAddRowTop = '.t3js-grideditor-addrow-top';
        this.selectorRemoveRowTop = '.t3js-grideditor-removerow-top';
        this.selectorAddRowBottom = '.t3js-grideditor-addrow-bottom';
        this.selectorRemoveRowBottom = '.t3js-grideditor-removerow-bottom';
        this.selectorLinkEditor = '.t3js-grideditor-link-editor';
        this.selectorLinkExpandRight = '.t3js-grideditor-link-expand-right';
        this.selectorLinkShrinkLeft = '.t3js-grideditor-link-shrink-left';
        this.selectorLinkExpandDown = '.t3js-grideditor-link-expand-down';
        this.selectorLinkShrinkUp = '.t3js-grideditor-link-shrink-up';
        this.selectorDocHeaderSave = '.t3js-grideditor-savedok';
        this.selectorDocHeaderSaveClose = '.t3js-grideditor-savedokclose';
        this.selectorConfigPreview = '.t3js-grideditor-preview-config';
        this.selectorConfigPreviewButton = '.t3js-grideditor-preview-button';
        /**
         *
         * @param {Event} e
         */
        this.modalButtonClickHandler = (e) => {
            const button = e.target;
            if (button.name === 'cancel') {
                Modal.currentModal.trigger('modal-dismiss');
            }
            else if (button.name === 'ok') {
                this.setName(Modal.currentModal.find('.t3js-grideditor-field-name').val(), Modal.currentModal.data('col'), Modal.currentModal.data('row'));
                this.setColumn(Modal.currentModal.find('.t3js-grideditor-field-colpos').val(), Modal.currentModal.data('col'), Modal.currentModal.data('row'));
                this.drawTable();
                this.writeConfig(this.export2LayoutRecord());
                Modal.currentModal.trigger('modal-dismiss');
            }
        };
        /**
         *
         * @param {Event} e
         */
        this.addColumnHandler = (e) => {
            e.preventDefault();
            this.addColumn();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeColumnHandler = (e) => {
            e.preventDefault();
            this.removeColumn();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.addRowTopHandler = (e) => {
            e.preventDefault();
            this.addRowTop();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.addRowBottomHandler = (e) => {
            e.preventDefault();
            this.addRowBottom();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeRowTopHandler = (e) => {
            e.preventDefault();
            this.removeRowTop();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeRowBottomHandler = (e) => {
            e.preventDefault();
            this.removeRowBottom();
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkEditorHandler = (e) => {
            e.preventDefault();
            const $element = jQuery(e.target);
            this.showOptions($element.data('col'), $element.data('row'));
        };
        /**
         *
         * @param {Event} e
         */
        this.linkExpandRightHandler = (e) => {
            e.preventDefault();
            const $element = jQuery(e.target);
            this.addColspan($element.data('col'), $element.data('row'));
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkShrinkLeftHandler = (e) => {
            e.preventDefault();
            const $element = jQuery(e.target);
            this.removeColspan($element.data('col'), $element.data('row'));
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkExpandDownHandler = (e) => {
            e.preventDefault();
            const $element = jQuery(e.target);
            this.addRowspan($element.data('col'), $element.data('row'));
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkShrinkUpHandler = (e) => {
            e.preventDefault();
            const $element = jQuery(e.target);
            this.removeRowspan($element.data('col'), $element.data('row'));
            this.drawTable();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.configPreviewButtonHandler = (e) => {
            e.preventDefault();
            const $preview = jQuery(this.selectorConfigPreview);
            const $button = jQuery(this.selectorConfigPreviewButton);
            if ($preview.is(':visible')) {
                $button.empty().append(TYPO3.lang['button.showPageTsConfig']);
                jQuery(this.selectorConfigPreview).slideUp();
            }
            else {
                $button.empty().append(TYPO3.lang['button.hidePageTsConfig']);
                jQuery(this.selectorConfigPreview).slideDown();
            }
        };
        const $element = jQuery(this.selectorEditor);
        this.colCount = $element.data('colcount');
        this.rowCount = $element.data('rowcount');
        this.field = jQuery('input[name="' + $element.data('field') + '"]');
        this.data = $element.data('data');
        this.nameLabel = config !== null ? config.nameLabel : 'Name';
        this.columnLabel = config !== null ? config.columnLabel : 'Column';
        this.targetElement = jQuery(this.selectorEditor);
        jQuery(this.selectorConfigPreview).hide();
        jQuery(this.selectorConfigPreviewButton).empty().append(TYPO3.lang['button.showPageTsConfig']);
        this.initializeEvents();
        this.drawTable();
        this.writeConfig(this.export2LayoutRecord());
    }
    /**
     * Remove all markup
     *
     * @param {String} input
     * @returns {string}
     */
    static stripMarkup(input) {
        input = input.replace(/<(.*)>/gi, '');
        return jQuery('<p>' + input + '</p>').text();
    }
    /**
     *
     */
    initializeEvents() {
        jQuery(document).on('click', this.selectorAddColumn, this.addColumnHandler);
        jQuery(document).on('click', this.selectorRemoveColumn, this.removeColumnHandler);
        jQuery(document).on('click', this.selectorAddRowTop, this.addRowTopHandler);
        jQuery(document).on('click', this.selectorAddRowBottom, this.addRowBottomHandler);
        jQuery(document).on('click', this.selectorRemoveRowTop, this.removeRowTopHandler);
        jQuery(document).on('click', this.selectorRemoveRowBottom, this.removeRowBottomHandler);
        jQuery(document).on('click', this.selectorLinkEditor, this.linkEditorHandler);
        jQuery(document).on('click', this.selectorLinkExpandRight, this.linkExpandRightHandler);
        jQuery(document).on('click', this.selectorLinkShrinkLeft, this.linkShrinkLeftHandler);
        jQuery(document).on('click', this.selectorLinkExpandDown, this.linkExpandDownHandler);
        jQuery(document).on('click', this.selectorLinkShrinkUp, this.linkShrinkUpHandler);
        jQuery(document).on('click', this.selectorConfigPreviewButton, this.configPreviewButtonHandler);
    }
    /**
     * Create a new cell from defaultCell
     * @returns {Object}
     */
    getNewCell() {
        return jQuery.extend({}, this.defaultCell);
    }
    /**
     * write data back to hidden field
     *
     * @param data
     */
    writeConfig(data) {
        this.field.val(data);
        const configLines = data.split('\n');
        let config = '';
        for (const line of configLines) {
            if (line) {
                config += '\t\t\t' + line + '\n';
            }
        }
        jQuery(this.selectorConfigPreview).find('code').empty().append('mod.web_layout.BackendLayouts {\n' +
            '  exampleKey {\n' +
            '    title = Example\n' +
            '    icon = EXT:example_extension/Resources/Public/Images/BackendLayouts/default.gif\n' +
            '    config {\n' +
            config.replace(new RegExp('\t', 'g'), '  ') +
            '    }\n' +
            '  }\n' +
            '}\n');
    }
    /**
     * Add a new row at the top
     */
    addRowTop() {
        const newRow = [];
        for (let i = 0; i < this.colCount; i++) {
            const newCell = this.getNewCell();
            newCell.name = i + 'x' + this.data.length;
            newRow[i] = newCell;
        }
        this.data.unshift(newRow);
        this.rowCount++;
    }
    /**
     * Add a new row at the bottom
     */
    addRowBottom() {
        const newRow = [];
        for (let i = 0; i < this.colCount; i++) {
            const newCell = this.getNewCell();
            newCell.name = i + 'x' + this.data.length;
            newRow[i] = newCell;
        }
        this.data.push(newRow);
        this.rowCount++;
    }
    /**
     * Removes the first row of the grid and adjusts all cells that might be effected
     * by that change. (Removing colspans)
     */
    removeRowTop() {
        if (this.rowCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 1; rowIndex < this.rowCount; rowIndex++) {
            newData.push(this.data[rowIndex]);
        }
        // fix rowspan in former last row
        for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
            if (this.data[0][colIndex].spanned === 1) {
                this.findUpperCellWidthRowspanAndDecreaseByOne(colIndex, 0);
            }
        }
        this.data = newData;
        this.rowCount--;
        return true;
    }
    /**
     * Removes the last row of the grid and adjusts all cells that might be effected
     * by that change. (Removing colspans)
     */
    removeRowBottom() {
        if (this.rowCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 0; rowIndex < this.rowCount - 1; rowIndex++) {
            newData.push(this.data[rowIndex]);
        }
        // fix rowspan in former last row
        for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
            if (this.data[this.rowCount - 1][colIndex].spanned === 1) {
                this.findUpperCellWidthRowspanAndDecreaseByOne(colIndex, this.rowCount - 1);
            }
        }
        this.data = newData;
        this.rowCount--;
        return true;
    }
    /**
     * Takes a cell and looks above it if there are any cells that have colspans that
     * spans into the given cell. This is used when a row was removed from the grid
     * to make sure that no cell with wrong colspans exists in the grid.
     *
     * @param {number} col
     * @param {number} row integer
     */
    findUpperCellWidthRowspanAndDecreaseByOne(col, row) {
        const upperCell = this.getCell(col, row - 1);
        if (!upperCell) {
            return false;
        }
        if (upperCell.spanned === 1) {
            this.findUpperCellWidthRowspanAndDecreaseByOne(col, row - 1);
        }
        else {
            if (upperCell.rowspan > 1) {
                this.removeRowspan(col, row - 1);
            }
        }
        return true;
    }
    /**
     * Removes the outermost right column from the grid.
     */
    removeColumn() {
        if (this.colCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
            const newRow = [];
            for (let colIndex = 0; colIndex < this.colCount - 1; colIndex++) {
                newRow.push(this.data[rowIndex][colIndex]);
            }
            if (this.data[rowIndex][this.colCount - 1].spanned === 1) {
                this.findLeftCellWidthColspanAndDecreaseByOne(this.colCount - 1, rowIndex);
            }
            newData.push(newRow);
        }
        this.data = newData;
        this.colCount--;
        return true;
    }
    /**
     * Checks if there are any cells on the left side of a given cell with a
     * rowspan that spans over the given cell.
     *
     * @param {number} col
     * @param {number} row
     */
    findLeftCellWidthColspanAndDecreaseByOne(col, row) {
        const leftCell = this.getCell(col - 1, row);
        if (!leftCell) {
            return false;
        }
        if (leftCell.spanned === 1) {
            this.findLeftCellWidthColspanAndDecreaseByOne(col - 1, row);
        }
        else {
            if (leftCell.colspan > 1) {
                this.removeColspan(col - 1, row);
            }
        }
        return true;
    }
    /**
     * Adds a column at the right side of the grid.
     */
    addColumn() {
        for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
            const newCell = this.getNewCell();
            newCell.name = this.colCount + 'x' + rowIndex;
            this.data[rowIndex].push(newCell);
        }
        this.colCount++;
    }
    /**
     * Draws the grid as table into a given container.
     * It also adds all needed links and bindings to the cells to make it editable.
     */
    drawTable() {
        const $colgroup = jQuery('<colgroup>');
        for (let col = 0; col < this.colCount; col++) {
            const percent = 100 / this.colCount;
            $colgroup.append(jQuery('<col>').css({
                width: parseInt(percent.toString(), 10) + '%',
            }));
        }
        const $table = jQuery('<table id="base" class="table editor">');
        $table.append($colgroup);
        for (let row = 0; row < this.rowCount; row++) {
            const rowData = this.data[row];
            if (rowData.length === 0) {
                continue;
            }
            const $row = jQuery('<tr>');
            for (let col = 0; col < this.colCount; col++) {
                const cell = this.data[row][col];
                if (cell.spanned === 1) {
                    continue;
                }
                const percentRow = 100 / this.rowCount;
                const percentCol = 100 / this.colCount;
                const $cell = jQuery('<td>').css({
                    height: parseInt(percentRow.toString(), 10) * cell.rowspan + '%',
                    width: parseInt(percentCol.toString(), 10) * cell.colspan + '%',
                });
                const $container = jQuery('<div class="cell_container">');
                $cell.append($container);
                const $anchor = jQuery('<a href="#" data-col="' + col + '" data-row="' + row + '">');
                $container.append($anchor
                    .clone()
                    .attr('class', 't3js-grideditor-link-editor link link_editor')
                    .attr('title', TYPO3.lang.grid_editCell));
                if (this.cellCanSpanRight(col, row)) {
                    $container.append($anchor
                        .clone()
                        .attr('class', 't3js-grideditor-link-expand-right link link_expand_right')
                        .attr('title', TYPO3.lang.grid_mergeCell));
                }
                if (this.cellCanShrinkLeft(col, row)) {
                    $container.append($anchor
                        .clone()
                        .attr('class', 't3js-grideditor-link-shrink-left link link_shrink_left')
                        .attr('title', TYPO3.lang.grid_splitCell));
                }
                if (this.cellCanSpanDown(col, row)) {
                    $container.append($anchor
                        .clone()
                        .attr('class', 't3js-grideditor-link-expand-down link link_expand_down')
                        .attr('title', TYPO3.lang.grid_mergeCell));
                }
                if (this.cellCanShrinkUp(col, row)) {
                    $container.append($anchor
                        .clone()
                        .attr('class', 't3js-grideditor-link-shrink-up link link_shrink_up')
                        .attr('title', TYPO3.lang.grid_splitCell));
                }
                $cell.append(jQuery('<div class="cell_data">')
                    .html(TYPO3.lang.grid_name + ': '
                    + (cell.name ? GridEditor.stripMarkup(cell.name) : TYPO3.lang.grid_notSet)
                    + '<br />'
                    + TYPO3.lang.grid_column + ': '
                    + (typeof cell.column === 'undefined' || isNaN(cell.column)
                        ? TYPO3.lang.grid_notSet
                        : parseInt(cell.column, 10))));
                if (cell.colspan > 1) {
                    $cell.attr('colspan', cell.colspan);
                }
                if (cell.rowspan > 1) {
                    $cell.attr('rowspan', cell.rowspan);
                }
                $row.append($cell);
            }
            $table.append($row);
        }
        jQuery(this.targetElement).empty().append($table);
    }
    /**
     * Sets the name of a certain grid element.
     *
     * @param {String} newName
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    setName(newName, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.name = GridEditor.stripMarkup(newName);
        return true;
    }
    /**
     * Sets the column field for a certain grid element. This is NOT the column of the
     * element itself.
     *
     * @param {number} newColumn
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    setColumn(newColumn, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.column = parseInt(newColumn.toString(), 10);
        return true;
    }
    /**
     * Creates an Modal with two input fields and shows it. On save, the data
     * is written into the grid element.
     *
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    showOptions(col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        let colPos;
        if (cell.column === 0) {
            colPos = 0;
        }
        else if (cell.column) {
            colPos = parseInt(cell.column.toString(), 10);
        }
        else {
            colPos = '';
        }
        const $markup = jQuery('<div>');
        const $formGroup = jQuery('<div class="form-group">');
        const $label = jQuery('<label>');
        const $input = jQuery('<input>');
        $markup.append([
            $formGroup
                .clone()
                .append([
                $label
                    .clone()
                    .text(TYPO3.lang.grid_nameHelp),
                $input
                    .clone()
                    .attr('type', 'text')
                    .attr('class', 't3js-grideditor-field-name form-control')
                    .attr('name', 'name')
                    .val(GridEditor.stripMarkup(cell.name) || ''),
            ]),
            $formGroup
                .clone()
                .append([
                $label
                    .clone()
                    .text(TYPO3.lang.grid_columnHelp),
                $input
                    .clone()
                    .attr('type', 'text')
                    .attr('class', 't3js-grideditor-field-colpos form-control')
                    .attr('name', 'column')
                    .val(colPos),
            ]),
        ]);
        const $modal = Modal.show(TYPO3.lang.grid_windowTitle, $markup, SeverityEnum.notice, [
            {
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
                text: jQuery(this).data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
            },
            {
                btnClass: 'btn-primary',
                name: 'ok',
                text: jQuery(this).data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
            },
        ]);
        $modal.data('col', col);
        $modal.data('row', row);
        $modal.on('button.clicked', this.modalButtonClickHandler);
        return true;
    }
    /**
     * Returns a cell element from the grid.
     *
     * @param {number} col
     * @param {number} row
     */
    getCell(col, row) {
        if (col > this.colCount - 1) {
            return false;
        }
        if (row > this.rowCount - 1) {
            return false;
        }
        if (this.data.length > row - 1 && this.data[row].length > col - 1) {
            return this.data[row][col];
        }
        return null;
    }
    /**
     * Checks whether a cell can span to the right or not. A cell can span to the right
     * if it is not in the last column and if there is no cell beside it that is
     * already overspanned by some other cell.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanSpanRight(col, row) {
        if (col === this.colCount - 1) {
            return false;
        }
        const cell = this.getCell(col, row);
        let checkCell;
        if (cell.rowspan > 1) {
            for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
                checkCell = this.getCell(col + cell.colspan, rowIndex);
                if (!checkCell || checkCell.spanned === 1 || checkCell.colspan > 1 || checkCell.rowspan > 1) {
                    return false;
                }
            }
        }
        else {
            checkCell = this.getCell(col + cell.colspan, row);
            if (!checkCell || cell.spanned === 1 || checkCell.spanned === 1 || checkCell.colspan > 1
                || checkCell.rowspan > 1) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks whether a cell can span down or not.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanSpanDown(col, row) {
        if (row === this.rowCount - 1) {
            return false;
        }
        const cell = this.getCell(col, row);
        let checkCell;
        if (cell.colspan > 1) {
            // we have to check all cells on the right side for the complete colspan
            for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
                checkCell = this.getCell(colIndex, row + cell.rowspan);
                if (!checkCell || checkCell.spanned === 1 || checkCell.colspan > 1 || checkCell.rowspan > 1) {
                    return false;
                }
            }
        }
        else {
            checkCell = this.getCell(col, row + cell.rowspan);
            if (!checkCell || cell.spanned === 1 || checkCell.spanned === 1 || checkCell.colspan > 1
                || checkCell.rowspan > 1) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if a cell can shrink to the left. It can shrink if the colspan of the
     * cell is bigger than 1.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanShrinkLeft(col, row) {
        return (this.data[row][col].colspan > 1);
    }
    /**
     * Returns if a cell can shrink up. This is the case if a cell has at least
     * a rowspan of 2.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanShrinkUp(col, row) {
        return (this.data[row][col].rowspan > 1);
    }
    /**
     * Adds a colspan to a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    addColspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanSpanRight(col, row)) {
            return false;
        }
        for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
            this.data[rowIndex][col + cell.colspan].spanned = 1;
        }
        cell.colspan += 1;
        return true;
    }
    /**
     * Adds a rowspan to grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    addRowspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanSpanDown(col, row)) {
            return false;
        }
        for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
            this.data[row + cell.rowspan][colIndex].spanned = 1;
        }
        cell.rowspan += 1;
        return true;
    }
    /**
     * Removes a colspan from a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    removeColspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanShrinkLeft(col, row)) {
            return false;
        }
        cell.colspan -= 1;
        for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
            this.data[rowIndex][col + cell.colspan].spanned = 0;
        }
        return true;
    }
    /**
     * Removes a rowspan from a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    removeRowspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanShrinkUp(col, row)) {
            return false;
        }
        cell.rowspan -= 1;
        for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
            this.data[row + cell.rowspan][colIndex].spanned = 0;
        }
        return true;
    }
    /**
     * Exports the current grid to a TypoScript notation that can be read by the
     * page module and is human readable.
     *
     * @returns {String}
     */
    export2LayoutRecord() {
        let result = 'backend_layout {\n\tcolCount = ' + this.colCount + '\n\trowCount = ' + this.rowCount + '\n\trows {\n';
        for (let row = 0; row < this.rowCount; row++) {
            result += '\t\t' + (row + 1) + ' {\n';
            result += '\t\t\tcolumns {\n';
            let colIndex = 0;
            for (let col = 0; col < this.colCount; col++) {
                const cell = this.getCell(col, row);
                if (cell) {
                    if (!cell.spanned) {
                        colIndex++;
                        result += '\t\t\t\t' + (colIndex) + ' {\n';
                        result += '\t\t\t\t\tname = ' + ((!cell.name) ? col + 'x' + row : cell.name) + '\n';
                        if (cell.colspan > 1) {
                            result += '\t\t\t\t\tcolspan = ' + cell.colspan + '\n';
                        }
                        if (cell.rowspan > 1) {
                            result += '\t\t\t\t\trowspan = ' + cell.rowspan + '\n';
                        }
                        if (typeof (cell.column) === 'number') {
                            result += '\t\t\t\t\tcolPos = ' + cell.column + '\n';
                        }
                        result += '\t\t\t\t}\n';
                    }
                }
            }
            result += '\t\t\t}\n';
            result += '\t\t}\n';
        }
        result += '\t}\n}\n';
        return result;
    }
}

export { GridEditor };
