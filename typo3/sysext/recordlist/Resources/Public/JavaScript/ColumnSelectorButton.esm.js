import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import Severity from '../../../../backend/Resources/Public/JavaScript/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import NotificationService from '../../../../backend/Resources/Public/JavaScript/Notification.esm.js';
import { lll } from '../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';

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
var ColumnSelectorButton_1;
var Selectors;
(function (Selectors) {
    Selectors["columnsSelector"] = ".t3js-record-column-selector";
    Selectors["columnsContainerSelector"] = ".t3js-column-selector-container";
    Selectors["columnsFilterSelector"] = "input[name=\"columns-filter\"]";
    Selectors["columnsSelectorActionsSelector"] = ".t3js-record-column-selector-actions";
})(Selectors || (Selectors = {}));
var SelectorActions;
(function (SelectorActions) {
    SelectorActions["toggle"] = "select-toggle";
    SelectorActions["all"] = "select-all";
    SelectorActions["none"] = "select-none";
})(SelectorActions || (SelectorActions = {}));
/**
 * Module: TYPO3/CMS/Recordlist/ColumnSelectorButton
 *
 * @example
 * <typo3-recordlist-column-selector-button
 *    url="/url/to/column/selector/form"
 *    target="/url/to/go/after/column/selection"
 *    title="Show columns"
 *    ok="Update"
 *    close="Cancel"
 *    close="Error"
 * >
 *   <button>Show columns/button>
 * </typo3-recordlist-column-selector-button>
 */
let ColumnSelectorButton = ColumnSelectorButton_1 = class ColumnSelectorButton extends h {
    constructor() {
        super();
        this.title = 'Show columns';
        this.ok = lll('button.ok') || 'Update';
        this.close = lll('button.close') || 'Close';
        this.error = 'Could not update columns';
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showColumnSelectorModal();
        });
    }
    /**
     * Toggle selector actions state (enabled or disabled) depending
     * on the columns state (checked, unchecked, displayed or hidden)
     *
     * @param columns The columns
     * @param selectAll The "select all" action button
     * @param selectNone The "select none" action button
     * @param initialize Whether this is the initialize call - don't check hidden
     *                   state as all columns are displayed on initialization
     * @private
     */
    static toggleSelectorActions(columns, selectAll, selectNone, initialize = false) {
        selectAll.classList.add('disabled');
        for (let i = 0; i < columns.length; i++) {
            if (!columns[i].disabled
                && !columns[i].checked
                && (initialize || !ColumnSelectorButton_1.isColumnHidden(columns[i]))) {
                selectAll.classList.remove('disabled');
                break;
            }
        }
        selectNone.classList.add('disabled');
        for (let i = 0; i < columns.length; i++) {
            if (!columns[i].disabled
                && columns[i].checked
                && (initialize || !ColumnSelectorButton_1.isColumnHidden(columns[i]))) {
                selectNone.classList.remove('disabled');
                break;
            }
        }
    }
    /**
     * Check if the given column is hidden by looking at it's container element
     *
     * @param column The column to check for
     * @private
     */
    static isColumnHidden(column) {
        var _a;
        return (_a = column.closest(Selectors.columnsContainerSelector)) === null || _a === void 0 ? void 0 : _a.classList.contains('hidden');
    }
    /**
     * Check each column if it matches the current search term.
     * If not, hide its outer container to not break the grid.
     *
     * @param columnsFilter The columns filter
     * @param columns The columns to check
     * @private
     */
    static filterColumns(columnsFilter, columns) {
        columns.forEach((column) => {
            var _a;
            const columnContainer = column.closest(Selectors.columnsContainerSelector);
            if (!column.disabled && columnContainer !== null) {
                const filterValue = (_a = columnContainer.querySelector('.form-check-label-text')) === null || _a === void 0 ? void 0 : _a.textContent;
                if (filterValue && filterValue.length) {
                    columnContainer.classList.toggle('hidden', columnsFilter.value !== '' && !RegExp(columnsFilter.value, 'i').test(filterValue.trim().replace(/\[\]/g, '').replace(/\s+/g, ' ')));
                }
            }
        });
    }
    render() {
        return T `<slot></slot>`;
    }
    showColumnSelectorModal() {
        if (!this.url || !this.target) {
            // Don't render modal in case no url or target is given
            return;
        }
        Modal.advanced({
            content: this.url,
            title: this.title,
            severity: SeverityEnum.notice,
            size: Modal.sizes.medium,
            type: Modal.types.ajax,
            buttons: [
                {
                    text: this.close,
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => Modal.dismiss(),
                },
                {
                    text: this.ok,
                    btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.info),
                    name: 'update',
                    trigger: () => this.proccessSelection(Modal.currentModal[0])
                }
            ],
            ajaxCallback: () => this.handleModalContentLoaded(Modal.currentModal[0])
        });
    }
    proccessSelection(currentModal) {
        const form = currentModal.querySelector('form');
        if (form === null) {
            this.abortSelection();
            return;
        }
        (new AjaxRequest(TYPO3.settings.ajaxUrls.record_show_columns))
            .post('', { body: new FormData(form) })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                // @todo This does not jump to the anchor (#t3-table-some_table) after the reload!!!
                this.ownerDocument.location.href = this.target;
                this.ownerDocument.location.reload(true);
            }
            else {
                NotificationService.error(data.message || 'No update was performed');
            }
            Modal.dismiss();
        })
            .catch(() => {
            this.abortSelection();
        });
    }
    handleModalContentLoaded(currentModal) {
        const form = currentModal.querySelector('form');
        if (form === null) {
            // Early return if modal content does not include a form
            return;
        }
        // Prevent the form from being submitted as the form data will be send via an ajax request
        form.addEventListener('submit', (e) => { e.preventDefault(); });
        const columns = currentModal.querySelectorAll(Selectors.columnsSelector);
        const columnsFilter = currentModal.querySelector(Selectors.columnsFilterSelector);
        const columnsSelectorActions = currentModal.querySelector(Selectors.columnsSelectorActionsSelector);
        const selectAll = columnsSelectorActions.querySelector('button[data-action="' + SelectorActions.all + '"]');
        const selectNone = columnsSelectorActions.querySelector('button[data-action="' + SelectorActions.none + '"]');
        if (!columns.length || columnsFilter === null || selectAll === null || selectNone === null) {
            // Return in case required elements do not exist in the modal content
            return;
        }
        // First initialize select-all / select-none buttons
        ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone, true);
        // Add event listener for each column to toggle the selector actions after change
        columns.forEach((column) => {
            column.addEventListener('change', () => {
                ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
            });
        });
        // Add event listener for keydown event for the columns filter, so we
        // can catch the "Escape" key, which would otherwise close the modal.
        columnsFilter.addEventListener('keydown', (e) => {
            const target = e.target;
            if (e.code === 'Escape') {
                e.stopImmediatePropagation();
                target.value = '';
            }
        });
        // Add event listener for keydown event for the columns filter, allowing the "live filtering"
        columnsFilter.addEventListener('keyup', (e) => {
            ColumnSelectorButton_1.filterColumns(e.target, columns);
            ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
        });
        // Catch browser specific "search" event, triggered on clicking the "clear" button
        columnsFilter.addEventListener('search', (e) => {
            ColumnSelectorButton_1.filterColumns(e.target, columns);
            ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
        });
        // Add event listener for all columns select actions. querySelectorAll will return
        // at least two actions (selectAll and selectNone) which we checked above already
        columnsSelectorActions.querySelectorAll('button[data-action]').forEach((action) => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                if (!target.dataset.action) {
                    // Return if we don't deal with a valid action (No action defined)
                    return;
                }
                // Perform requested action
                switch (target.dataset.action) {
                    case SelectorActions.toggle:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = !column.checked;
                            }
                        });
                        break;
                    case SelectorActions.all:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = true;
                            }
                        });
                        break;
                    case SelectorActions.none:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = false;
                            }
                        });
                        break;
                    default:
                        // Unknown action
                        NotificationService.warning('Unknown selector action');
                }
                // After performing the action always toggle selector actions
                ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
            });
        });
    }
    abortSelection() {
        NotificationService.error(this.error);
        Modal.dismiss();
    }
};
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "url", void 0);
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "target", void 0);
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "title", void 0);
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "ok", void 0);
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "close", void 0);
__decorate([
    e({ type: String })
], ColumnSelectorButton.prototype, "error", void 0);
ColumnSelectorButton = ColumnSelectorButton_1 = __decorate([
    n('typo3-recordlist-column-selector-button')
], ColumnSelectorButton);
