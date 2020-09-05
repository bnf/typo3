import '../../Element/IconElement.esm.js';
import './SelectTree.esm.js';
import './SelectTreeToolbar.esm.js';

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
class SelectTreeElement {
    constructor(treeWrapperId, treeRecordFieldId, callback) {
        this.recordField = null;
        this.tree = null;
        this.selectNode = (evt) => {
            const node = evt.detail.node;
            this.updateAncestorsIndeterminateState(node);
            // check all nodes again, to ensure correct display of indeterminate state
            this.calculateIndeterminate(this.tree.nodes);
            this.saveCheckboxes();
            this.tree.setup.input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        };
        /**
         * Resets the node.indeterminate for the whole tree.
         * It's done once after loading data.
         * Later indeterminate state is updated just for the subset of nodes
         */
        this.loadDataAfter = () => {
            this.tree.nodes = this.tree.nodes.map((node) => {
                node.indeterminate = false;
                return node;
            });
            this.calculateIndeterminate(this.tree.nodes);
        };
        /**
         * Sets a comma-separated list of selected nodes identifiers to configured input
         */
        this.saveCheckboxes = () => {
            if (typeof this.recordField === 'undefined') {
                return;
            }
            this.recordField.value = this.tree.getSelectedNodes().map((node) => node.identifier).join(',');
        };
        this.recordField = document.getElementById(treeRecordFieldId);
        const treeWrapper = document.getElementById(treeWrapperId);
        this.tree = document.createElement('typo3-backend-form-selecttree');
        this.tree.classList.add('svg-tree-wrapper');
        this.tree.addEventListener('typo3:svg-tree:nodes-prepared', this.loadDataAfter);
        this.tree.addEventListener('typo3:svg-tree:node-selected', this.selectNode);
        this.tree.addEventListener('typo3:svg-tree:node-selected', () => { callback(); });
        const settings = {
            id: treeWrapperId,
            dataUrl: this.generateRequestUrl(),
            readOnlyMode: parseInt(this.recordField.dataset.readOnly, 10) === 1,
            input: this.recordField,
            exclusiveNodesIdentifiers: this.recordField.dataset.treeExclusiveKeys,
            validation: JSON.parse(this.recordField.dataset.formengineValidationRules)[0],
            expandUpToLevel: this.recordField.dataset.treeExpandUpToLevel,
            unselectableElements: []
        };
        this.tree.addEventListener('svg-tree:initialized', () => {
            if (this.recordField.dataset.treeShowToolbar) {
                const toolbarElement = document.createElement('typo3-backend-form-selecttree-toolbar');
                toolbarElement.tree = this.tree;
                this.tree.prepend(toolbarElement);
            }
        });
        this.tree.setup = settings;
        treeWrapper.append(this.tree);
        this.listenForVisibleTree();
    }
    /**
     * If the Select item is in an invisible tab, it needs to be rendered once the tab
     * becomes visible.
     */
    listenForVisibleTree() {
        if (!this.tree.offsetParent) {
            // Search for the parents that are tab containers
            let idOfTabContainer = this.tree.closest('.tab-pane').getAttribute('id');
            if (idOfTabContainer) {
                let btn = document.querySelector('[aria-controls="' + idOfTabContainer + '"]');
                btn.addEventListener('shown.bs.tab', () => { this.tree.dispatchEvent(new Event('svg-tree:visible')); });
            }
        }
    }
    generateRequestUrl() {
        const params = {
            tableName: this.recordField.dataset.tablename,
            fieldName: this.recordField.dataset.fieldname,
            uid: this.recordField.dataset.uid,
            recordTypeValue: this.recordField.dataset.recordtypevalue,
            dataStructureIdentifier: this.recordField.dataset.datastructureidentifier,
            flexFormSheetName: this.recordField.dataset.flexformsheetname,
            flexFormFieldName: this.recordField.dataset.flexformfieldname,
            flexFormContainerName: this.recordField.dataset.flexformcontainername,
            flexFormContainerIdentifier: this.recordField.dataset.flexformcontaineridentifier,
            flexFormContainerFieldName: this.recordField.dataset.flexformcontainerfieldname,
            flexFormSectionContainerIsNew: this.recordField.dataset.flexformsectioncontainerisnew,
            command: this.recordField.dataset.command,
        };
        return TYPO3.settings.ajaxUrls.record_tree_data + '&' + new URLSearchParams(params);
    }
    /**
     * Updates the indeterminate state for ancestors of the current node
     */
    updateAncestorsIndeterminateState(node) {
        // foreach ancestor except node itself
        let indeterminate = false;
        node.parents.forEach((index) => {
            const node = this.tree.nodes[index];
            node.indeterminate = (node.checked || node.indeterminate || indeterminate);
            // check state for the next level
            indeterminate = (node.checked || node.indeterminate || node.checked || node.indeterminate);
        });
    }
    /**
     * Sets indeterminate state for a subtree.
     * It relays on the tree to have indeterminate state reset beforehand.
     */
    calculateIndeterminate(nodes) {
        nodes.forEach((node) => {
            if ((node.checked || node.indeterminate) && node.parents && node.parents.length > 0) {
                node.parents.forEach((parentNodeIndex) => {
                    nodes[parentNodeIndex].indeterminate = true;
                });
            }
        });
    }
}

export { SelectTreeElement };
