import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { query as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import Persistent from '../Storage/Persistent.esm.js';
import '../Element/IconElement.esm.js';
import ElementBrowser from '../../../../../recordlist/Resources/Public/JavaScript/ElementBrowser.esm.js';
import LinkBrowser from '../../../../../recordlist/Resources/Public/JavaScript/LinkBrowser.esm.js';
import { FileStorageTree } from './FileStorageTree.esm.js';

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
const componentName = 'typo3-backend-component-filestorage-browser';
/**
 * Extension of the SVG Tree, allowing to show additional actions on the right hand of the tree to directly link
 * select a folder
 */
let FileStorageBrowserTree = class FileStorageBrowserTree extends FileStorageTree {
    updateNodeActions(nodesActions) {
        const nodes = super.updateNodeActions(nodesActions);
        if (this.settings.actions.includes('link')) {
            // Check if a node can be linked
            this.fetchIcon('actions-link');
            const linkAction = nodes
                .append('g')
                .on('click', (evt, node) => {
                this.linkItem(node);
            });
            this.createIconAreaForAction(linkAction, 'actions-link');
        }
        else if (this.settings.actions.includes('select')) {
            // Check if a node can be selected
            this.fetchIcon('actions-link');
            const linkAction = nodes
                .append('g')
                .on('click', (evt, node) => {
                this.selectItem(node);
            });
            this.createIconAreaForAction(linkAction, 'actions-link');
        }
        return nodes;
    }
    /**
     * Link to a folder - Link Handler specific
     */
    linkItem(node) {
        LinkBrowser.finalizeFunction('t3://folder?storage=' + node.storage + '&identifier=' + node.pathIdentifier);
    }
    /**
     * Element Browser specific
     */
    selectItem(node) {
        ElementBrowser.insertElement(node.itemType, node.identifier, node.name, node.identifier, true);
    }
};
FileStorageBrowserTree = __decorate([
    n('typo3-backend-component-filestorage-browser-tree')
], FileStorageBrowserTree);
let FileStorageBrowser = class FileStorageBrowser extends h {
    constructor() {
        super(...arguments);
        this.activeFolder = '';
        this.actions = [];
        this.triggerRender = () => {
            this.tree.dispatchEvent(new Event('svg-tree:visible'));
        };
        this.selectActiveNode = (evt) => {
            // Activate the current node
            let nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (decodeURIComponent(node.identifier) === this.activeFolder) {
                    node.checked = true;
                }
                return node;
            });
        };
        this.toggleExpandState = (evt) => {
            const node = evt.detail.node;
            if (node) {
                Persistent.set('BackendComponents.States.FileStorageTree.stateHash.' + node.stateIdentifier, (node.expanded ? '1' : '0'));
            }
        };
        /**
         * If a page is clicked, the content area needs to be updated
         */
        this.loadFolderDetails = (evt) => {
            const node = evt.detail.node;
            if (!node.checked) {
                return;
            }
            let contentsUrl = document.location.href + '&contentOnly=1&expandFolder=' + node.identifier;
            (new AjaxRequest(contentsUrl)).get()
                .then((response) => response.resolve())
                .then((response) => {
                const contentContainer = document.querySelector('.element-browser-main-content .element-browser-body');
                contentContainer.innerHTML = response;
            });
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:navigation:resized', this.triggerRender);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:navigation:resized', this.triggerRender);
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.activeFolder = this.getAttribute('active-folder') || '';
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        if (this.hasAttribute('tree-actions') && this.getAttribute('tree-actions').length) {
            this.actions = JSON.parse(this.getAttribute('tree-actions'));
        }
        const treeSetup = {
            dataUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_data,
            filterUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,
            showIcons: true,
            actions: this.actions
        };
        const initialized = () => {
            this.tree.dispatchEvent(new Event('svg-tree:visible'));
            this.tree.addEventListener('typo3:svg-tree:expand-toggle', this.toggleExpandState);
            this.tree.addEventListener('typo3:svg-tree:node-selected', this.loadFolderDetails);
            this.tree.addEventListener('typo3:svg-tree:nodes-prepared', this.selectActiveNode);
            // set up toolbar now with updated properties
            const toolbar = this.querySelector('typo3-backend-tree-toolbar');
            toolbar.tree = this.tree;
        };
        return T `
      <div class="svg-tree">
        <div>
          <typo3-backend-tree-toolbar .tree="${this.tree}" class="svg-toolbar"></typo3-backend-tree-toolbar>
          <div class="navigation-tree-container">
            <typo3-backend-component-filestorage-browser-tree class="svg-tree-wrapper" .setup=${treeSetup} @svg-tree:initialized=${initialized}></typo3-backend-component-page-browser-tree>
          </div>
        </div>
        <div class="svg-tree-loader">
          <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
        </div>
      </div>
    `;
    }
};
__decorate([
    o('.svg-tree-wrapper')
], FileStorageBrowser.prototype, "tree", void 0);
FileStorageBrowser = __decorate([
    n(componentName)
], FileStorageBrowser);

export { FileStorageBrowser };
