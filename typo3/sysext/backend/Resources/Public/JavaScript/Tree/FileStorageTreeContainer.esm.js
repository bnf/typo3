import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Severity from '../Severity.esm.js';
import Modal from '../Modal.esm.js';
import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { query as o } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/query.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import NotificationService from '../Notification.esm.js';
import Persistent from '../Storage/Persistent.esm.js';
import { ModuleStateStorage } from '../Storage/ModuleStateStorage.esm.js';
import ContextMenu from '../ContextMenu.esm.js';
import '../Element/IconElement.esm.js';
import { DragDrop, DraggablePositionEnum } from './DragDrop.esm.js';
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
const navigationComponentName = 'typo3-backend-navigation-component-filestoragetree';
/**
 * FileStorageTree which allows for drag+drop, and in-place editing, as well as
 * tree highlighting from the outside
 */
let EditableFileStorageTree = class EditableFileStorageTree extends FileStorageTree {
    constructor() {
        super();
        this.actionHandler = new FileStorageTreeActions(this);
    }
    updateNodeBgClass(nodesBg) {
        return super.updateNodeBgClass.call(this, nodesBg).call(this.initializeDragForNode());
    }
    nodesUpdate(nodes) {
        return super.nodesUpdate.call(this, nodes).call(this.initializeDragForNode());
    }
    /**
     * Initializes a drag&drop when called on the tree.
     */
    initializeDragForNode() {
        return this.actionHandler.connectDragHandler(new FileStorageTreeNodeDragHandler(this, this.actionHandler));
    }
};
EditableFileStorageTree = __decorate([
    n('typo3-backend-navigation-component-filestorage-tree')
], EditableFileStorageTree);
/**
 * Responsible for setting up the viewport for the Navigation Component for the File Tree
 */
let FileStorageTreeNavigationComponent = class FileStorageTreeNavigationComponent extends h {
    constructor() {
        super(...arguments);
        this.refresh = () => {
            this.tree.refreshOrFilterTree();
        };
        this.selectFirstNode = () => {
            const node = this.tree.nodes[0];
            if (node) {
                this.tree.selectNode(node, true);
            }
        };
        // event listener updating current tree state, this can be removed in TYPO3 v12
        this.treeUpdateRequested = (evt) => {
            const identifier = encodeURIComponent(evt.detail.payload.identifier);
            let nodeToSelect = this.tree.nodes.filter((node) => { return node.identifier === identifier; })[0];
            if (nodeToSelect && this.tree.getSelectedNodes().filter((selectedNode) => { return selectedNode.identifier === nodeToSelect.identifier; }).length === 0) {
                this.tree.selectNode(nodeToSelect, false);
            }
        };
        this.toggleExpandState = (evt) => {
            const node = evt.detail.node;
            if (node) {
                Persistent.set('BackendComponents.States.FileStorageTree.stateHash.' + node.stateIdentifier, (node.expanded ? '1' : '0'));
            }
        };
        this.loadContent = (evt) => {
            const node = evt.detail.node;
            if (!(node === null || node === void 0 ? void 0 : node.checked)) {
                return;
            }
            // remember the selected folder in the global state
            ModuleStateStorage.update('file', node.identifier, true);
            if (evt.detail.propagate === false) {
                return;
            }
            const separator = (window.currentSubScript.indexOf('?') !== -1) ? '&' : '?';
            TYPO3.Backend.ContentContainer.setUrl(window.currentSubScript + separator + 'id=' + node.identifier);
        };
        this.showContextMenu = (evt) => {
            const node = evt.detail.node;
            if (!node) {
                return;
            }
            ContextMenu.show(node.itemType, decodeURIComponent(node.identifier), 'tree', '', '', this.tree.getNodeElement(node));
        };
        /**
         * Event listener called for each loaded node,
         * here used to mark node remembered in ModuleStateStorage as selected
         */
        this.selectActiveNode = (evt) => {
            const selectedNodeIdentifier = ModuleStateStorage.current('file').selection;
            let nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (node.identifier === selectedNodeIdentifier) {
                    node.checked = true;
                }
                return node;
            });
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:filestoragetree:refresh', this.refresh);
        document.addEventListener('typo3:filestoragetree:selectFirstNode', this.selectFirstNode);
        // event listener updating current tree state, this can be removed in TYPO3 v12
        document.addEventListener('typo3:filelist:treeUpdateRequested', this.treeUpdateRequested);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:filestoragetree:refresh', this.refresh);
        document.removeEventListener('typo3:filestoragetree:selectFirstNode', this.selectFirstNode);
        document.removeEventListener('typo3:filelist:treeUpdateRequested', this.treeUpdateRequested);
        super.disconnectedCallback();
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        const treeSetup = {
            dataUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_data,
            filterUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,
            showIcons: true
        };
        return T `
      <div id="typo3-filestoragetree" class="svg-tree">
        <div>
          <typo3-backend-tree-toolbar .tree="${this.tree}" id="filestoragetree-toolbar" class="svg-toolbar"></typo3-backend-tree-toolbar>
          <div class="navigation-tree-container">
            <typo3-backend-navigation-component-filestorage-tree id="typo3-filestoragetree-tree" class="svg-tree-wrapper" .setup=${treeSetup}></typo3-backend-navigation-component-filestorage-tree>
          </div>
        </div>
        <div class="svg-tree-loader">
          <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
        </div>
      </div>
    `;
    }
    firstUpdated() {
        this.toolbar.tree = this.tree;
        this.tree.addEventListener('typo3:svg-tree:expand-toggle', this.toggleExpandState);
        this.tree.addEventListener('typo3:svg-tree:node-selected', this.loadContent);
        this.tree.addEventListener('typo3:svg-tree:node-context', this.showContextMenu);
        this.tree.addEventListener('typo3:svg-tree:nodes-prepared', this.selectActiveNode);
    }
};
__decorate([
    o('.svg-tree-wrapper')
], FileStorageTreeNavigationComponent.prototype, "tree", void 0);
__decorate([
    o('typo3-backend-tree-toolbar')
], FileStorageTreeNavigationComponent.prototype, "toolbar", void 0);
FileStorageTreeNavigationComponent = __decorate([
    n(navigationComponentName)
], FileStorageTreeNavigationComponent);
/**
 * Extends Drag&Drop functionality for File Storage Tree positioning when dropping
 */
class FileStorageTreeActions extends DragDrop {
    changeNodePosition(droppedNode) {
        const nodes = this.tree.nodes;
        const identifier = this.tree.settings.nodeDrag.identifier;
        let position = this.tree.settings.nodeDragPosition;
        let target = droppedNode || this.tree.settings.nodeDrag;
        if (identifier === target.identifier) {
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
            identifier: identifier,
            target: target,
            position: position // before, in, after
        };
    }
    /**
     * Returns position and target node
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
    changeNodeClasses(event) {
        const elementNodeBg = this.tree.svg.select('.node-over');
        const svg = this.tree.svg.node();
        const nodeDd = svg.parentNode.querySelector('.node-dd');
        if (elementNodeBg.size() && this.tree.isOverSvg) {
            this.tree.nodesBgContainer
                .selectAll('.node-bg__border')
                .style('display', 'none');
            this.addNodeDdClass(nodeDd, 'ok-append');
            this.tree.settings.nodeDragPosition = DraggablePositionEnum.INSIDE;
        }
    }
}
/**
 * Drag and drop for nodes (copy/move)
 */
class FileStorageTreeNodeDragHandler {
    constructor(tree, actionHandler) {
        this.startDrag = false;
        this.startPageX = 0;
        this.startPageY = 0;
        this.isDragged = false;
        this.tree = tree;
        this.actionHandler = actionHandler;
    }
    dragStart(event) {
        let node = event.subject;
        if (node.depth === 0) {
            return false;
        }
        this.startPageX = event.sourceEvent.pageX;
        this.startPageY = event.sourceEvent.pageY;
        this.startDrag = false;
        return true;
    }
    ;
    dragDragged(event) {
        let node = event.subject;
        if (this.actionHandler.isDragNodeDistanceMore(event, this)) {
            this.startDrag = true;
        }
        else {
            return false;
        }
        if (node.depth === 0) {
            return false;
        }
        this.tree.settings.nodeDrag = node;
        let nodeBg = this.tree.svg.node().querySelector('.node-bg[data-state-id="' + node.stateIdentifier + '"]');
        let nodeDd = this.tree.svg.node().parentNode.querySelector('.node-dd');
        // Create the draggable
        if (!this.isDragged) {
            this.isDragged = true;
            this.actionHandler.createDraggable(this.tree.getIconId(node), node.name);
            nodeBg === null || nodeBg === void 0 ? void 0 : nodeBg.classList.add('node-bg--dragging');
        }
        this.tree.settings.nodeDragPosition = false;
        this.actionHandler.openNodeTimeout();
        this.actionHandler.updateDraggablePosition(event);
        if (node.isOver
            || (this.tree.hoveredNode && this.tree.hoveredNode.parentsStateIdentifier.indexOf(node.stateIdentifier) !== -1)
            || !this.tree.isOverSvg) {
            this.actionHandler.addNodeDdClass(nodeDd, 'nodrop');
            if (!this.tree.isOverSvg) {
                this.tree.nodesBgContainer.selectAll('.node-bg__border').style('display', 'none');
            }
        }
        if (!this.tree.hoveredNode || this.isInSameParentNode(node, this.tree.hoveredNode)) {
            this.actionHandler.addNodeDdClass(nodeDd, 'nodrop');
            this.tree.nodesBgContainer.selectAll('.node-bg__border').style('display', 'none');
        }
        else {
            this.actionHandler.changeNodeClasses(event);
        }
        return true;
    }
    isInSameParentNode(activeHoveredNode, targetNode) {
        return activeHoveredNode.stateIdentifier == targetNode.stateIdentifier
            || activeHoveredNode.parentsStateIdentifier[0] == targetNode.stateIdentifier
            || targetNode.parentsStateIdentifier.includes(activeHoveredNode.stateIdentifier);
    }
    dragEnd(event) {
        let node = event.subject;
        if (!this.startDrag || node.depth === 0) {
            return false;
        }
        let droppedNode = this.tree.hoveredNode;
        this.isDragged = false;
        this.actionHandler.removeNodeDdClass();
        if (!(node.isOver
            || (droppedNode && droppedNode.parentsStateIdentifier.indexOf(node.stateIdentifier) !== -1)
            || !this.tree.settings.canNodeDrag
            || !this.tree.isOverSvg)) {
            let options = this.actionHandler.changeNodePosition(droppedNode);
            let modalText = options.position === DraggablePositionEnum.INSIDE ? TYPO3.lang['mess.move_into'] : TYPO3.lang['mess.move_after'];
            modalText = modalText.replace('%s', options.node.name).replace('%s', options.target.name);
            Modal.confirm(TYPO3.lang.move_folder, modalText, Severity.warning, [
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
                    this.sendChangeCommand('move', options);
                }
                else if (target.name === 'copy') {
                    this.sendChangeCommand('copy', options);
                }
                Modal.dismiss();
            });
        }
        return true;
    }
    /**
     * Used when something a folder was drag+dropped.
     */
    sendChangeCommand(command, data) {
        let params = {
            data: {}
        };
        if (command === 'copy') {
            params.data.copy = [];
            params.copy.push({ data: decodeURIComponent(data.identifier), target: decodeURIComponent(data.target.identifier) });
        }
        else if (command === 'move') {
            params.data.move = [];
            params.data.move.push({ data: decodeURIComponent(data.identifier), target: decodeURIComponent(data.target.identifier) });
        }
        else {
            return;
        }
        this.tree.nodesAddPlaceholder();
        (new AjaxRequest(top.TYPO3.settings.ajaxUrls.file_process + '&includeMessages=1'))
            .post(params)
            .then((response) => {
            return response.resolve();
        })
            .then((response) => {
            if (response && response.hasErrors) {
                this.tree.errorNotification(response.messages, false);
                this.tree.nodesContainer.selectAll('.node').remove();
                this.tree.updateVisibleNodes();
                this.tree.nodesRemovePlaceholder();
            }
            else {
                if (response.messages) {
                    response.messages.forEach((message) => {
                        NotificationService.showMessage(message.title || '', message.message || '', message.severity);
                    });
                }
                this.tree.refreshOrFilterTree();
            }
        })
            .catch((error) => {
            this.tree.errorNotification(error, true);
        });
    }
}

export { FileStorageTreeNavigationComponent, navigationComponentName };
