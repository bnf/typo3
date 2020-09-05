import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Severity from '../Severity.esm.js';
import Modal from '../Modal.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { query as o$1 } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import Persistent from '../Storage/Persistent.esm.js';
import { ModuleStateStorage } from '../Storage/ModuleStateStorage.esm.js';
import ContextMenu from '../ContextMenu.esm.js';
import { lll } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';
import { until as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/directives/until.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/directives/until.esm.js';
import { KeyTypesEnum } from '../Enum/KeyTypes.esm.js';
import { selectAll, select } from '../../../../../core/Resources/Public/JavaScript/Contrib/d3-selection.esm.js';
import { Toolbar } from '../SvgTree.esm.js';
import { PageTree } from './PageTree.esm.js';
import { DragDrop, DraggablePositionEnum } from '../Tree/DragDrop.esm.js';

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
 * This module defines the Custom Element for rendering the navigation component for an editable page tree
 * including drag+drop, deletion, in-place editing and a custom toolbar for this component.
 *
 * It is used as custom element via "<typo3-backend-navigation-component-pagetree>".
 *
 * The navigationComponentName export is used by the NavigationContainer in order to
 * create an instance of PageTreeNavigationComponent via document.createElement().
 */
const navigationComponentName = 'typo3-backend-navigation-component-pagetree';
/**
 * PageTree which allows for drag+drop, and in-place editing, as well as
 * tree highlighting from the outside
 */
let EditablePageTree = class EditablePageTree extends PageTree {
    selectFirstNode() {
        this.selectNode(this.nodes[0], true);
    }
    sendChangeCommand(data) {
        let params = '';
        let targetUid = 0;
        if (data.target) {
            targetUid = data.target.identifier;
            if (data.position === 'after') {
                targetUid = -targetUid;
            }
        }
        if (data.command === 'new') {
            params = '&data[pages][NEW_1][pid]=' + targetUid +
                '&data[pages][NEW_1][title]=' + encodeURIComponent(data.name) +
                '&data[pages][NEW_1][doktype]=' + data.type;
        }
        else if (data.command === 'edit') {
            params = '&data[pages][' + data.uid + '][' + data.nameSourceField + ']=' + encodeURIComponent(data.title);
        }
        else {
            if (data.command === 'delete') {
                // @todo currently it's "If uid of deleted record (data.uid) is still selected, randomly select the first node"
                const moduleStateStorage = ModuleStateStorage.current('web');
                if (data.uid === moduleStateStorage.identifier) {
                    this.selectFirstNode();
                }
                params = '&cmd[pages][' + data.uid + '][delete]=1';
            }
            else {
                params = 'cmd[pages][' + data.uid + '][' + data.command + ']=' + targetUid;
            }
        }
        this.requestTreeUpdate(params).then((response) => {
            if (response && response.hasErrors) {
                this.errorNotification(response.messages, false);
                this.nodesContainer.selectAll('.node').remove();
                this.updateVisibleNodes();
                this.nodesRemovePlaceholder();
            }
            else {
                this.refreshOrFilterTree();
            }
        });
    }
    /**
     * Make the DOM element of the node given as parameter focusable and focus it
     */
    switchFocusNode(node) {
        // Focus node only if it's not currently in edit mode
        if (!this.nodeIsEdit) {
            this.switchFocus(this.getNodeElement(node));
        }
    }
    nodesUpdate(nodes) {
        return super.nodesUpdate.call(this, nodes).call(this.initializeDragForNode());
    }
    updateNodeBgClass(nodeBg) {
        return super.updateNodeBgClass.call(this, nodeBg).call(this.initializeDragForNode());
    }
    /**
     * Initializes a drag&drop when called on the page tree. Should be moved somewhere else at some point
     */
    initializeDragForNode() {
        return this.dragDrop.connectDragHandler(new PageTreeNodeDragHandler(this, this.dragDrop));
    }
    removeEditedText() {
        const inputWrapper = selectAll('.node-edit');
        if (inputWrapper.size()) {
            try {
                inputWrapper.remove();
                this.nodeIsEdit = false;
            }
            catch (e) {
                // ...
            }
        }
    }
    /**
     * Event handler for double click on a node's label
     */
    appendTextElement(nodes) {
        let clicks = 0;
        return super.appendTextElement(nodes)
            .on('click', (event, node) => {
            if (node.identifier === '0') {
                this.selectNode(node, true);
                return;
            }
            if (++clicks === 1) {
                setTimeout(() => {
                    if (clicks === 1) {
                        this.selectNode(node, true);
                    }
                    else {
                        this.editNodeLabel(node);
                    }
                    clicks = 0;
                }, 300);
            }
        });
    }
    sendEditNodeLabelCommand(node) {
        const params = '&data[pages][' + node.identifier + '][' + node.nameSourceField + ']=' + encodeURIComponent(node.newName);
        this.requestTreeUpdate(params, node)
            .then((response) => {
            if (response && response.hasErrors) {
                this.errorNotification(response.messages, false);
            }
            else {
                node.name = node.newName;
            }
            this.refreshOrFilterTree();
        });
    }
    requestTreeUpdate(params, node = null) {
        // remove old node from svg tree
        this.nodesAddPlaceholder(node);
        return (new AjaxRequest(top.TYPO3.settings.ajaxUrls.record_process))
            .post(params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((response) => {
            return response.resolve();
        })
            .catch((error) => {
            this.errorNotification(error, true);
        });
    }
    editNodeLabel(node) {
        if (!node.allowEdit) {
            return;
        }
        this.removeEditedText();
        this.nodeIsEdit = true;
        select(this.svg.node().parentNode)
            .append('input')
            .attr('class', 'node-edit')
            .style('top', () => {
            const top = node.y + this.settings.marginTop;
            return top + 'px';
        })
            .style('left', (node.x + this.textPosition + 5) + 'px')
            .style('width', this.settings.width - (node.x + this.textPosition + 20) + 'px')
            .style('height', this.settings.nodeHeight + 'px')
            .attr('type', 'text')
            .attr('value', node.name)
            .on('keydown', (event) => {
            // @todo Migrate to `evt.code`, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
            const code = event.keyCode;
            if (code === KeyTypesEnum.ENTER || code === KeyTypesEnum.TAB) {
                const target = event.target;
                const newName = target.value.trim();
                this.nodeIsEdit = false;
                this.removeEditedText();
                if (newName.length && (newName !== node.name)) {
                    node.nameSourceField = node.nameSourceField || 'title';
                    node.newName = newName;
                    this.sendEditNodeLabelCommand(node);
                }
            }
            else if (code === KeyTypesEnum.ESCAPE) {
                this.nodeIsEdit = false;
                this.removeEditedText();
            }
        })
            .on('blur', (evt) => {
            if (!this.nodeIsEdit) {
                return;
            }
            const target = evt.target;
            const newName = target.value.trim();
            if (newName.length && (newName !== node.name)) {
                node.nameSourceField = node.nameSourceField || 'title';
                node.newName = newName;
                this.sendEditNodeLabelCommand(node);
            }
            this.removeEditedText();
        })
            .node()
            .select();
    }
};
EditablePageTree = __decorate([
    n('typo3-backend-navigation-component-pagetree-tree')
], EditablePageTree);
let PageTreeNavigationComponent = class PageTreeNavigationComponent extends h {
    constructor() {
        super(...arguments);
        this.mountPointPath = null;
        this.configuration = null;
        this.refresh = () => {
            this.tree.refreshOrFilterTree();
        };
        this.setMountPoint = (e) => {
            this.setTemporaryMountPoint(e.detail.pageId);
        };
        this.selectFirstNode = () => {
            this.tree.selectFirstNode();
        };
        this.toggleExpandState = (evt) => {
            const node = evt.detail.node;
            if (node) {
                Persistent.set('BackendComponents.States.Pagetree.stateHash.' + node.stateIdentifier, (node.expanded ? '1' : '0'));
            }
        };
        this.loadContent = (evt) => {
            const node = evt.detail.node;
            if (!(node === null || node === void 0 ? void 0 : node.checked)) {
                return;
            }
            //remember the selected page in the global state
            ModuleStateStorage.update('web', node.identifier, true, node.stateIdentifier.split('_')[0]);
            if (evt.detail.propagate === false) {
                return;
            }
            let separator = '?';
            if (top.window.currentSubScript.indexOf('?') !== -1) {
                separator = '&';
            }
            top.TYPO3.Backend.ContentContainer.setUrl(top.window.currentSubScript + separator + 'id=' + node.identifier);
        };
        this.showContextMenu = (evt) => {
            const node = evt.detail.node;
            if (!node) {
                return;
            }
            ContextMenu.show(node.itemType, parseInt(node.identifier, 10), 'tree', '', '', this.tree.getNodeElement(node));
        };
        /**
         * Event listener called for each loaded node,
         * here used to mark node remembered in ModuleState as selected
         */
        this.selectActiveNode = (evt) => {
            const selectedNodeIdentifier = ModuleStateStorage.current('web').selection;
            let nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (node.stateIdentifier === selectedNodeIdentifier) {
                    node.checked = true;
                }
                return node;
            });
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:pagetree:refresh', this.refresh);
        document.addEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
        document.addEventListener('typo3:pagetree:selectFirstNode', this.selectFirstNode);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:pagetree:refresh', this.refresh);
        document.removeEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
        document.removeEventListener('typo3:pagetree:selectFirstNode', this.selectFirstNode);
        super.disconnectedCallback();
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        return T `
      <div id="typo3-pagetree" class="svg-tree">
        ${o(this.renderTree(), this.renderLoader())}
      </div>
    `;
    }
    getConfiguration() {
        if (this.configuration !== null) {
            return Promise.resolve(this.configuration);
        }
        const configurationUrl = top.TYPO3.settings.ajaxUrls.page_tree_configuration;
        return (new AjaxRequest(configurationUrl)).get()
            .then(async (response) => {
            const configuration = await response.resolve('json');
            this.configuration = configuration;
            this.mountPointPath = configuration.temporaryMountPoint || null;
            return configuration;
        });
    }
    renderTree() {
        return this.getConfiguration()
            .then((configuration) => {
            // Initialize the toolbar once the tree was rendered
            const initialized = () => {
                this.tree.dragDrop = new PageTreeDragDrop(this.tree);
                this.toolbar.tree = this.tree;
                this.tree.addEventListener('typo3:svg-tree:expand-toggle', this.toggleExpandState);
                this.tree.addEventListener('typo3:svg-tree:node-selected', this.loadContent);
                this.tree.addEventListener('typo3:svg-tree:node-context', this.showContextMenu);
                this.tree.addEventListener('typo3:svg-tree:nodes-prepared', this.selectActiveNode);
            };
            return T `
          <div>
            <typo3-backend-navigation-component-pagetree-toolbar id="typo3-pagetree-toolbar" class="svg-toolbar" .tree="${this.tree}"></typo3-backend-navigation-component-pagetree-toolbar>
            <div id="typo3-pagetree-treeContainer" class="navigation-tree-container">
              ${this.renderMountPoint()}
              <typo3-backend-navigation-component-pagetree-tree id="typo3-pagetree-tree" class="svg-tree-wrapper" .setup=${configuration} @svg-tree:initialized=${initialized}></typo3-backend-navigation-component-pagetree-tree>
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
], PageTreeNavigationComponent.prototype, "mountPointPath", void 0);
__decorate([
    o$1('.svg-tree-wrapper')
], PageTreeNavigationComponent.prototype, "tree", void 0);
__decorate([
    o$1('typo3-backend-navigation-component-pagetree-toolbar')
], PageTreeNavigationComponent.prototype, "toolbar", void 0);
PageTreeNavigationComponent = __decorate([
    n(navigationComponentName)
], PageTreeNavigationComponent);
let PageTreeToolbar = class PageTreeToolbar extends Toolbar {
    constructor() {
        super(...arguments);
        this.tree = null;
    }
    initializeDragDrop(dragDrop) {
        var _a, _b, _c;
        if ((_c = (_b = (_a = this.tree) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.doktypes) === null || _c === void 0 ? void 0 : _c.length) {
            this.tree.settings.doktypes.forEach((item) => {
                if (item.icon) {
                    const htmlElement = this.querySelector('[data-tree-icon="' + item.icon + '"]');
                    select(htmlElement).call(this.dragToolbar(item, dragDrop));
                }
                else {
                    console.warn('Missing icon definition for doktype: ' + item.nodeType);
                }
            });
        }
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            if (propName === 'tree' && this.tree !== null) {
                this.initializeDragDrop(this.tree.dragDrop);
            }
        });
    }
    render() {
        var _a, _b, _c;
        /* eslint-disable @typescript-eslint/indent */
        return T `
      <div class="tree-toolbar">
        <div class="svg-toolbar__menu">
          <div class="svg-toolbar__search">
              <input type="text" class="form-control form-control-sm search-input" placeholder="${lll('tree.searchTermInfo')}">
          </div>
          <button class="btn btn-default btn-borderless btn-sm" @click="${() => this.refreshTree()}" data-tree-icon="actions-refresh" title="${lll('labels.refresh')}">
              <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
          </button>
        </div>
        <div class="svg-toolbar__submenu">
          ${((_c = (_b = (_a = this.tree) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.doktypes) === null || _c === void 0 ? void 0 : _c.length) ? this.tree.settings.doktypes.map((item) => {
            return T `
                <div class="svg-toolbar__drag-node" data-tree-icon="${item.icon}" data-node-type="${item.nodeType}"
                     title="${item.title}" tooltip="${item.tooltip}">
                  <typo3-backend-icon identifier="${item.icon}" size="small"></typo3-backend-icon>
                </div>
              `;
        })
            : ''}
        </div>
      </div>
    `;
    }
    /**
     * Register Drag and drop for new elements of toolbar
     * Returns method from d3drag
     */
    dragToolbar(item, dragDrop) {
        return dragDrop.connectDragHandler(new ToolbarDragHandler(item, this.tree, dragDrop));
    }
};
__decorate([
    e({ type: EditablePageTree })
], PageTreeToolbar.prototype, "tree", void 0);
PageTreeToolbar = __decorate([
    n('typo3-backend-navigation-component-pagetree-toolbar')
], PageTreeToolbar);
/**
 * Extends Drag&Drop functionality for Page Tree positioning when dropping
 */
class PageTreeDragDrop extends DragDrop {
    changeNodePosition(droppedNode, command = '') {
        const nodes = this.tree.nodes;
        const uid = this.tree.settings.nodeDrag.identifier;
        let position = this.tree.settings.nodeDragPosition;
        let target = droppedNode || this.tree.settings.nodeDrag;
        if (uid === target.identifier && command !== 'delete') {
            return null;
        }
        if (position === DraggablePositionEnum.BEFORE) {
            const index = nodes.indexOf(droppedNode);
            const positionAndTarget = this.setNodePositionAndTarget(index);
            if (positionAndTarget === null) {
                return null;
            }
            position = positionAndTarget.position;
            target = positionAndTarget.target;
        }
        return {
            node: this.tree.settings.nodeDrag,
            uid: uid,
            target: target,
            position: position,
            command: command // element is copied or moved
        };
    }
    /**
     * Returns Array of position and target node
     *
     * @param {number} index of node which is over mouse
     * @returns {Array} [position, target]
     * @todo this should be moved into PageTree.js
     */
    setNodePositionAndTarget(index) {
        const nodes = this.tree.nodes;
        const nodeOver = nodes[index];
        const nodeOverDepth = nodeOver.depth;
        if (index > 0) {
            index--;
        }
        const nodeBefore = nodes[index];
        const nodeBeforeDepth = nodeBefore.depth;
        const target = this.tree.nodes[index];
        if (nodeBeforeDepth === nodeOverDepth) {
            return { position: DraggablePositionEnum.AFTER, target };
        }
        else if (nodeBeforeDepth < nodeOverDepth) {
            return { position: DraggablePositionEnum.INSIDE, target };
        }
        else {
            for (let i = index; i >= 0; i--) {
                if (nodes[i].depth === nodeOverDepth) {
                    return { position: DraggablePositionEnum.AFTER, target: this.tree.nodes[i] };
                }
                else if (nodes[i].depth < nodeOverDepth) {
                    return { position: DraggablePositionEnum.AFTER, target: nodes[i] };
                }
            }
        }
        return null;
    }
}
/**
 * Main Handler for the toolbar when creating new items
 */
class ToolbarDragHandler {
    constructor(item, tree, dragDrop) {
        this.startDrag = false;
        this.startPageX = 0;
        this.startPageY = 0;
        this.id = '';
        this.name = '';
        this.tooltip = '';
        this.icon = '';
        this.isDragged = false;
        this.id = item.nodeType;
        this.name = item.title;
        this.tooltip = item.tooltip;
        this.icon = item.icon;
        this.tree = tree;
        this.dragDrop = dragDrop;
    }
    dragStart(event) {
        this.isDragged = false;
        this.startDrag = false;
        this.startPageX = event.sourceEvent.pageX;
        this.startPageY = event.sourceEvent.pageY;
        return true;
    }
    dragDragged(event) {
        if (this.dragDrop.isDragNodeDistanceMore(event, this)) {
            this.startDrag = true;
        }
        else {
            return false;
        }
        // Add the draggable element
        if (this.isDragged === false) {
            this.isDragged = true;
            this.dragDrop.createDraggable('#icon-' + this.icon, this.name);
        }
        this.dragDrop.openNodeTimeout();
        this.dragDrop.updateDraggablePosition(event);
        this.dragDrop.changeNodeClasses(event);
        return true;
    }
    dragEnd(event) {
        if (!this.startDrag) {
            return false;
        }
        this.isDragged = false;
        this.dragDrop.removeNodeDdClass();
        if (this.tree.settings.allowDragMove !== true || !this.tree.hoveredNode || !this.tree.isOverSvg) {
            return false;
        }
        if (this.tree.settings.canNodeDrag) {
            this.addNewNode({
                type: this.id,
                name: this.name,
                tooltip: this.tooltip,
                icon: this.icon,
                position: this.tree.settings.nodeDragPosition,
                target: this.tree.hoveredNode
            });
        }
        return true;
    }
    /**
     * Add new node to the tree (used in drag+drop)
     *
     * @type {Object} options
     * @private
     */
    addNewNode(options) {
        const target = options.target;
        let index = this.tree.nodes.indexOf(target);
        const newNode = {};
        newNode.command = 'new';
        newNode.type = options.type;
        newNode.identifier = '-1';
        newNode.target = target;
        newNode.parents = target.parents;
        newNode.parentsStateIdentifier = target.parentsStateIdentifier;
        newNode.depth = target.depth;
        newNode.position = options.position;
        newNode.name = (typeof options.title !== 'undefined') ? options.title : TYPO3.lang['tree.defaultPageTitle'];
        newNode.y = newNode.y || newNode.target.y;
        newNode.x = newNode.x || newNode.target.x;
        this.tree.nodeIsEdit = true;
        if (options.position === DraggablePositionEnum.INSIDE) {
            newNode.depth++;
            newNode.parents.unshift(index);
            newNode.parentsStateIdentifier.unshift(this.tree.nodes[index].stateIdentifier);
            this.tree.nodes[index].hasChildren = true;
            this.tree.showChildren(this.tree.nodes[index]);
        }
        if (options.position === DraggablePositionEnum.INSIDE || options.position === DraggablePositionEnum.AFTER) {
            index++;
        }
        if (options.icon) {
            newNode.icon = options.icon;
        }
        if (newNode.position === DraggablePositionEnum.BEFORE) {
            const positionAndTarget = this.dragDrop.setNodePositionAndTarget(index);
            // @todo Check whether an error should be thrown in case of `null`
            if (positionAndTarget !== null) {
                newNode.position = positionAndTarget.position;
                newNode.target = positionAndTarget.target;
            }
        }
        this.tree.nodes.splice(index, 0, newNode);
        this.tree.setParametersNode();
        this.tree.prepareDataForVisibleNodes();
        this.tree.updateVisibleNodes();
        this.tree.removeEditedText();
        select(this.tree.svg.node().parentNode)
            .append('input')
            .attr('class', 'node-edit')
            .style('top', newNode.y + this.tree.settings.marginTop + 'px')
            .style('left', newNode.x + this.tree.textPosition + 5 + 'px')
            .style('width', this.tree.settings.width - (newNode.x + this.tree.textPosition + 20) + 'px')
            .style('height', this.tree.settings.nodeHeight + 'px')
            .attr('text', 'text')
            .attr('value', newNode.name)
            .on('keydown', (evt) => {
            const target = evt.target;
            const code = evt.keyCode;
            if (code === 13 || code === 9) { // enter || tab
                this.tree.nodeIsEdit = false;
                const newName = target.value.trim();
                if (newName.length) {
                    newNode.name = newName;
                    this.tree.removeEditedText();
                    this.tree.sendChangeCommand(newNode);
                }
                else {
                    this.removeNode(newNode);
                }
            }
            else if (code === 27) { // esc
                this.tree.nodeIsEdit = false;
                this.removeNode(newNode);
            }
        })
            .on('blur', (evt) => {
            if (this.tree.nodeIsEdit && (this.tree.nodes.indexOf(newNode) > -1)) {
                const target = evt.target;
                const newName = target.value.trim();
                if (newName.length) {
                    newNode.name = newName;
                    this.tree.removeEditedText();
                    this.tree.sendChangeCommand(newNode);
                }
                else {
                    this.removeNode(newNode);
                }
            }
        })
            .node()
            .select();
    }
    removeNode(newNode) {
        let index = this.tree.nodes.indexOf(newNode);
        // if newNode is only one child
        if (this.tree.nodes[index - 1].depth != newNode.depth
            && (!this.tree.nodes[index + 1] || this.tree.nodes[index + 1].depth != newNode.depth)) {
            this.tree.nodes[index - 1].hasChildren = false;
        }
        this.tree.nodes.splice(index, 1);
        this.tree.setParametersNode();
        this.tree.prepareDataForVisibleNodes();
        this.tree.updateVisibleNodes();
        this.tree.removeEditedText();
    }
    ;
}
/**
 * Drag and drop for nodes (copy/move) including the deleting / drop functionality.
 */
class PageTreeNodeDragHandler {
    constructor(tree, dragDrop) {
        this.startDrag = false;
        this.startPageX = 0;
        this.startPageY = 0;
        this.isDragged = false;
        this.nodeIsOverDelete = false;
        this.tree = tree;
        this.dragDrop = dragDrop;
    }
    dragStart(event) {
        const node = event.subject;
        if (this.tree.settings.allowDragMove !== true || node.depth === 0) {
            return false;
        }
        this.dropZoneDelete = null;
        if (node.allowDelete) {
            this.dropZoneDelete = this.tree.nodesContainer
                .select('.node[data-state-id="' + node.stateIdentifier + '"]')
                .append('g')
                .attr('class', 'nodes-drop-zone')
                .attr('height', this.tree.settings.nodeHeight);
            this.nodeIsOverDelete = false;
            this.dropZoneDelete.append('rect')
                .attr('height', this.tree.settings.nodeHeight)
                .attr('width', '50px')
                .attr('x', 0)
                .attr('y', 0)
                .on('mouseover', () => {
                this.nodeIsOverDelete = true;
            })
                .on('mouseout', () => {
                this.nodeIsOverDelete = false;
            });
            this.dropZoneDelete.append('text')
                .text(TYPO3.lang.deleteItem)
                .attr('dx', 5)
                .attr('dy', 15);
            this.dropZoneDelete.node().dataset.open = 'false';
            this.dropZoneDelete.node().style.transform = this.getDropZoneCloseTransform(node);
        }
        this.startPageX = event.sourceEvent.pageX;
        this.startPageY = event.sourceEvent.pageY;
        this.startDrag = false;
        return true;
    }
    ;
    dragDragged(event) {
        const node = event.subject;
        if (this.dragDrop.isDragNodeDistanceMore(event, this)) {
            this.startDrag = true;
        }
        else {
            return false;
        }
        if (this.tree.settings.allowDragMove !== true || node.depth === 0) {
            return false;
        }
        this.tree.settings.nodeDrag = node;
        const nodeBg = this.tree.svg.node().querySelector('.node-bg[data-state-id="' + node.stateIdentifier + '"]');
        const nodeDd = this.tree.svg.node().parentNode.querySelector('.node-dd');
        // Create the draggable
        if (!this.isDragged) {
            this.isDragged = true;
            this.dragDrop.createDraggable(this.tree.getIconId(node), node.name);
            nodeBg.classList.add('node-bg--dragging');
        }
        this.tree.settings.nodeDragPosition = false;
        this.dragDrop.openNodeTimeout();
        this.dragDrop.updateDraggablePosition(event);
        if (node.isOver
            || (this.tree.hoveredNode && this.tree.hoveredNode.parentsStateIdentifier.indexOf(node.stateIdentifier) !== -1)
            || !this.tree.isOverSvg) {
            this.dragDrop.addNodeDdClass(nodeDd, 'nodrop');
            if (!this.tree.isOverSvg) {
                this.tree.nodesBgContainer.selectAll('.node-bg__border').style('display', 'none');
            }
            if (this.dropZoneDelete && this.dropZoneDelete.node().dataset.open !== 'true' && this.tree.isOverSvg) {
                this.animateDropZone('show', this.dropZoneDelete.node(), node);
            }
        }
        else if (!this.tree.hoveredNode) {
            this.dragDrop.addNodeDdClass(nodeDd, 'nodrop');
            this.tree.nodesBgContainer.selectAll('.node-bg__border').style('display', 'none');
        }
        else if (this.dropZoneDelete && this.dropZoneDelete.node().dataset.open !== 'false') {
            this.animateDropZone('hide', this.dropZoneDelete.node(), node);
        }
        this.dragDrop.changeNodeClasses(event);
        return true;
    }
    dragEnd(event) {
        const node = event.subject;
        if (this.dropZoneDelete && this.dropZoneDelete.node().dataset.open === 'true') {
            const dropZone = this.dropZoneDelete;
            this.animateDropZone('hide', this.dropZoneDelete.node(), node, () => {
                dropZone.remove();
                this.dropZoneDelete = null;
            });
        }
        else if (this.dropZoneDelete && this.dropZoneDelete.node().dataset.open === 'false') {
            this.dropZoneDelete.remove();
            this.dropZoneDelete = null;
        }
        else {
            this.dropZoneDelete = null;
        }
        if (!this.startDrag || this.tree.settings.allowDragMove !== true || node.depth === 0) {
            return false;
        }
        const droppedNode = this.tree.hoveredNode;
        this.isDragged = false;
        this.dragDrop.removeNodeDdClass();
        if (!(node.isOver
            || (droppedNode && droppedNode.parentsStateIdentifier.indexOf(node.stateIdentifier) !== -1)
            || !this.tree.settings.canNodeDrag
            || !this.tree.isOverSvg)) {
            const options = this.dragDrop.changeNodePosition(droppedNode, '');
            if (options === null) {
                return false;
            }
            let modalText = options.position === DraggablePositionEnum.INSIDE ? TYPO3.lang['mess.move_into'] : TYPO3.lang['mess.move_after'];
            modalText = modalText.replace('%s', options.node.name).replace('%s', options.target.name);
            Modal.confirm(TYPO3.lang.move_page, modalText, Severity.warning, [
                {
                    text: TYPO3.lang['labels.cancel'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel'
                },
                {
                    text: TYPO3.lang['cm.copy'] || 'Copy',
                    btnClass: 'btn-warning',
                    name: 'copy'
                },
                {
                    text: TYPO3.lang['labels.move'] || 'Move',
                    btnClass: 'btn-warning',
                    name: 'move'
                }
            ])
                .on('button.clicked', (e) => {
                const target = e.target;
                if (target.name === 'move') {
                    options.command = 'move';
                    this.tree.sendChangeCommand(options);
                }
                else if (target.name === 'copy') {
                    options.command = 'copy';
                    this.tree.sendChangeCommand(options);
                }
                Modal.dismiss();
            });
        }
        else if (this.nodeIsOverDelete) {
            const options = this.dragDrop.changeNodePosition(droppedNode, 'delete');
            if (options === null) {
                return false;
            }
            if (this.tree.settings.displayDeleteConfirmation) {
                const $modal = Modal.confirm(TYPO3.lang.deleteItem, TYPO3.lang['mess.delete'].replace('%s', options.node.name), Severity.warning, [
                    {
                        text: TYPO3.lang['labels.cancel'] || 'Cancel',
                        active: true,
                        btnClass: 'btn-default',
                        name: 'cancel'
                    },
                    {
                        text: TYPO3.lang['cm.delete'] || 'Delete',
                        btnClass: 'btn-warning',
                        name: 'delete'
                    }
                ]);
                $modal.on('button.clicked', (e) => {
                    const target = e.target;
                    if (target.name === 'delete') {
                        this.tree.sendChangeCommand(options);
                    }
                    Modal.dismiss();
                });
            }
            else {
                this.tree.sendChangeCommand(options);
            }
        }
        return true;
    }
    /**
     * Returns deleting drop zone open 'transform' attribute value
     */
    getDropZoneOpenTransform(node) {
        const svgWidth = parseFloat(this.tree.svg.style('width')) || 300;
        return 'translate(' + (svgWidth - 58 - node.x) + 'px, -10px)';
    }
    /**
     * Returns deleting drop zone close 'transform' attribute value
     */
    getDropZoneCloseTransform(node) {
        const svgWidth = parseFloat(this.tree.svg.style('width')) || 300;
        return 'translate(' + (svgWidth - node.x) + 'px, -10px)';
    }
    /**
     * Animates the drop zone next to given node
     */
    animateDropZone(action, dropZone, node, onfinish = null) {
        dropZone.classList.add('animating');
        dropZone.dataset.open = (action === 'show') ? 'true' : 'false';
        let keyframes = [
            { transform: this.getDropZoneCloseTransform(node) },
            { transform: this.getDropZoneOpenTransform(node) }
        ];
        if (action !== 'show') {
            keyframes = keyframes.reverse();
        }
        const done = function () {
            dropZone.style.transform = keyframes[1].transform;
            dropZone.classList.remove('animating');
            onfinish && onfinish();
        };
        if ('animate' in dropZone) {
            dropZone.animate(keyframes, {
                duration: 300,
                easing: 'cubic-bezier(.02, .01, .47, 1)'
            }).onfinish = done;
        }
        else {
            done();
        }
    }
}

export { EditablePageTree, PageTreeNavigationComponent, navigationComponentName };
