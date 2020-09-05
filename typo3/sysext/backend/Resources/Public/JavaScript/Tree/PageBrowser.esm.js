import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { query as o$1 } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import Persistent from '../Storage/Persistent.esm.js';
import { lll } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';
import { until as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/directives/until.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/directives/until.esm.js';
import '../Element/IconElement.esm.js';
import { PageTree } from '../PageTree/PageTree.esm.js';
import ElementBrowser from '../../../../../recordlist/Resources/Public/JavaScript/ElementBrowser.esm.js';
import LinkBrowser from '../../../../../recordlist/Resources/Public/JavaScript/LinkBrowser.esm.js';

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
const componentName = 'typo3-backend-component-page-browser';
/**
 * Extension of the SVG Tree, allowing to show additional actions on the right hand of the tree to directly link
 * select a page
 */
let PageBrowserTree = class PageBrowserTree extends PageTree {
    /**
     * Check if the page is linkable, if not, let's grey it out.
     */
    appendTextElement(nodes) {
        return super.appendTextElement(nodes).attr('opacity', (node) => {
            if (!this.settings.actions.includes('link')) {
                return 1;
            }
            if (this.isLinkable(node)) {
                return 1;
            }
            return 0.5;
        });
    }
    updateNodeActions(nodesActions) {
        const nodes = super.updateNodeActions(nodesActions);
        if (this.settings.actions.includes('link')) {
            // Check if a node can be linked
            this.fetchIcon('actions-link');
            const linkAction = this.nodesActionsContainer.selectAll('.node-action')
                .append('g')
                .attr('visibility', (node) => {
                return this.isLinkable(node) ? 'visible' : 'hidden';
            })
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
     * Page Link Handler specific
     */
    linkItem(node) {
        LinkBrowser.finalizeFunction('t3://page?uid=' + node.identifier);
    }
    /**
     * The following page doktypes can be browsed, but not directly added as "action":
     * - Spacer
     * - SysFolder
     * - Recycler
     */
    isLinkable(node) {
        const nonLinkableDoktypes = ['199', '254', '255'];
        return nonLinkableDoktypes.includes(String(node.type)) === false;
    }
    /**
     * Element Browser specific
     */
    selectItem(node) {
        ElementBrowser.insertElement(node.itemType, node.identifier, node.name, node.identifier, true);
    }
};
PageBrowserTree = __decorate([
    n('typo3-backend-component-page-browser-tree')
], PageBrowserTree);
/**
 * The actual element used in the HTML composing the tree and the toolbar
 */
let PageBrowser = class PageBrowser extends h {
    constructor() {
        super(...arguments);
        this.mountPointPath = null;
        this.activePageId = 0;
        // selectPage
        this.actions = [];
        this.configuration = null;
        this.triggerRender = () => {
            this.tree.dispatchEvent(new Event('svg-tree:visible'));
        };
        this.selectActivePageInTree = (evt) => {
            // Activate the current node
            let nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (parseInt(node.identifier, 10) === this.activePageId) {
                    node.checked = true;
                }
                return node;
            });
        };
        this.toggleExpandState = (evt) => {
            const node = evt.detail.node;
            if (node) {
                Persistent.set('BackendComponents.States.Pagetree.stateHash.' + node.stateIdentifier, (node.expanded ? '1' : '0'));
            }
        };
        /**
         * If a page is clicked, the content area needs to be updated
         */
        this.loadRecordsOfPage = (evt) => {
            const node = evt.detail.node;
            if (!node.checked) {
                return;
            }
            let contentsUrl = document.location.href + '&contentOnly=1&expandPage=' + node.identifier;
            (new AjaxRequest(contentsUrl)).get()
                .then((response) => response.resolve())
                .then((response) => {
                const contentContainer = document.querySelector('.element-browser-main-content .element-browser-body');
                contentContainer.innerHTML = response;
            });
        };
        this.setMountPoint = (e) => {
            this.setTemporaryMountPoint(e.detail.pageId);
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:navigation:resized', this.triggerRender);
        document.addEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:navigation:resized', this.triggerRender);
        document.removeEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.activePageId = parseInt(this.getAttribute('active-page'), 10);
        this.actions = JSON.parse(this.getAttribute('tree-actions'));
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    getConfiguration() {
        if (this.configuration !== null) {
            return Promise.resolve(this.configuration);
        }
        const configurationUrl = top.TYPO3.settings.ajaxUrls.page_tree_browser_configuration;
        const alternativeEntryPoints = this.hasAttribute('alternative-entry-points') ? JSON.parse(this.getAttribute('alternative-entry-points')) : [];
        let request = new AjaxRequest(configurationUrl);
        if (alternativeEntryPoints.length) {
            request = request.withQueryArguments('alternativeEntryPoints=' + encodeURIComponent(alternativeEntryPoints));
        }
        return request.get()
            .then(async (response) => {
            const configuration = await response.resolve('json');
            configuration.actions = this.actions;
            this.configuration = configuration;
            this.mountPointPath = configuration.temporaryMountPoint || null;
            return configuration;
        });
    }
    render() {
        return T `
      <div class="svg-tree">
        ${o(this.renderTree(), this.renderLoader())}
      </div>
    `;
    }
    renderTree() {
        return this.getConfiguration()
            .then((configuration) => {
            const initialized = () => {
                this.tree.dispatchEvent(new Event('svg-tree:visible'));
                this.tree.addEventListener('typo3:svg-tree:expand-toggle', this.toggleExpandState);
                this.tree.addEventListener('typo3:svg-tree:node-selected', this.loadRecordsOfPage);
                this.tree.addEventListener('typo3:svg-tree:nodes-prepared', this.selectActivePageInTree);
                // set up toolbar now with updated properties
                const toolbar = this.querySelector('typo3-backend-tree-toolbar');
                toolbar.tree = this.tree;
            };
            return T `
          <div>
            <typo3-backend-tree-toolbar .tree="${this.tree}" class="svg-toolbar"></typo3-backend-tree-toolbar>
            <div class="navigation-tree-container">
              ${this.renderMountPoint()}
              <typo3-backend-component-page-browser-tree id="typo3-pagetree-tree" class="svg-tree-wrapper" .setup=${configuration} @svg-tree:initialized=${initialized}></typo3-backend-component-page-browser-tree>
            </div>
          </div>
          ${this.renderLoader()}
        `;
        });
    }
    renderLoader() {
        return T `
      <div class="svg-tree-loader">
        <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
      </div>
    `;
    }
    unsetTemporaryMountPoint() {
        this.mountPointPath = null;
        Persistent.unset('pageTree_temporaryMountPoint').then(() => {
            this.tree.refreshTree();
        });
    }
    renderMountPoint() {
        if (this.mountPointPath === null) {
            return T ``;
        }
        return T `
      <div class="node-mount-point">
        <div class="node-mount-point__icon"><typo3-backend-icon identifier="actions-document-info" size="small"></typo3-backend-icon></div>
        <div class="node-mount-point__text">${this.mountPointPath}</div>
        <div class="node-mount-point__icon mountpoint-close" @click="${() => this.unsetTemporaryMountPoint()}" title="${lll('labels.temporaryDBmount')}">
          <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
        </div>
      </div>
    `;
    }
    setTemporaryMountPoint(pid) {
        (new AjaxRequest(this.configuration.setTemporaryMountPointUrl))
            .post('pid=' + pid, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((response) => response.resolve())
            .then((response) => {
            if (response && response.hasErrors) {
                this.tree.errorNotification(response.message, true);
                this.tree.updateVisibleNodes();
            }
            else {
                this.mountPointPath = response.mountPointPath;
                this.tree.refreshOrFilterTree();
            }
        })
            .catch((error) => {
            this.tree.errorNotification(error, true);
        });
    }
};
__decorate([
    e({ type: String })
], PageBrowser.prototype, "mountPointPath", void 0);
__decorate([
    o$1('.svg-tree-wrapper')
], PageBrowser.prototype, "tree", void 0);
PageBrowser = __decorate([
    n(componentName)
], PageBrowser);

export { PageBrowser };
