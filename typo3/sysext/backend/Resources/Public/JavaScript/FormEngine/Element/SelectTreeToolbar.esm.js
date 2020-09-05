import { Tooltip } from '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import { __decorate } from '../../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import { lll } from '../../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';

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
let SelectTreeToolbar = class SelectTreeToolbar extends h {
    constructor() {
        super(...arguments);
        this.settings = {
            collapseAllBtn: 'collapse-all-btn',
            expandAllBtn: 'expand-all-btn',
            searchInput: 'search-input',
            toggleHideUnchecked: 'hide-unchecked-btn'
        };
        /**
         * State of the hide unchecked toggle button
         *
         * @type {boolean}
         */
        this.hideUncheckedState = false;
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    firstUpdated() {
        this.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
    }
    render() {
        return T `
      <div class="tree-toolbar btn-toolbar">
        <div class="input-group">
          <span class="input-group-addon input-group-icon filter">
            <typo3-backend-icon identifier="actions-filter" size="small"></typo3-backend-icon>
          </span>
          <input type="text" class="form-control ${this.settings.searchInput}" placeholder="${lll('tcatree.findItem')}" @input="${(evt) => this.filter(evt)}">
        </div>
        <div class="btn-group">
          <button type="button" data-bs-toggle="tooltip" class="btn btn-default ${this.settings.expandAllBtn}" title="${lll('tcatree.expandAll')}" @click="${() => this.expandAll()}">
            <typo3-backend-icon identifier="apps-pagetree-category-expand-all" size="small"></typo3-backend-icon>
          </button>
          <button type="button" data-bs-toggle="tooltip" class="btn btn-default ${this.settings.collapseAllBtn}" title="${lll('tcatree.collapseAll')}" @click="${() => this.collapseAll()}">
            <typo3-backend-icon identifier="apps-pagetree-category-collapse-all" size="small"></typo3-backend-icon>
          </button>
          <button type="button" data-bs-toggle="tooltip" class="btn btn-default ${this.settings.toggleHideUnchecked}" title="${lll('tcatree.toggleHideUnchecked')}" @click="${() => this.toggleHideUnchecked()}">
            <typo3-backend-icon identifier="apps-pagetree-category-toggle-hide-checked" size="small"></typo3-backend-icon>
          </button>
        </div>
      </div>
    `;
    }
    /**
     * Collapse children of root node
     */
    collapseAll() {
        this.tree.collapseAll();
    }
    /**
     * Expand all nodes
     */
    expandAll() {
        this.tree.expandAll();
    }
    filter(event) {
        const inputEl = event.target;
        this.tree.filter(inputEl.value.trim());
    }
    /**
     * Show only checked items
     */
    toggleHideUnchecked() {
        this.hideUncheckedState = !this.hideUncheckedState;
        if (this.hideUncheckedState) {
            this.tree.nodes.forEach((node) => {
                if (node.checked) {
                    this.tree.showParents(node);
                    node.expanded = true;
                    node.hidden = false;
                }
                else {
                    node.hidden = true;
                    node.expanded = false;
                }
            });
        }
        else {
            this.tree.nodes.forEach((node) => node.hidden = false);
        }
        this.tree.prepareDataForVisibleNodes();
        this.tree.updateVisibleNodes();
    }
};
SelectTreeToolbar = __decorate([
    n('typo3-backend-form-selecttree-toolbar')
], SelectTreeToolbar);

export { SelectTreeToolbar };
