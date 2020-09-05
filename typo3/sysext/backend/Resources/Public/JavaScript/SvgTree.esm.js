import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { MarkupIdentifiers } from './Enum/IconTypes.esm.js';
import Icons from './Icons.esm.js';
import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import { state as r } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/state.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import NotificationService from './Notification.esm.js';
import { lll } from '../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';
import './Element/IconElement.esm.js';
import { KeyTypesEnum } from './Enum/KeyTypes.esm.js';
import { select } from '../../../../core/Resources/Public/JavaScript/Contrib/d3-selection.esm.js';
import tooltipObject from './Tooltip.esm.js';
import DebounceEvent from '../../../../core/Resources/Public/JavaScript/Event/DebounceEvent.esm.js';
import './Input/Clearable.esm.js';

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
class SvgTree extends h {
    constructor() {
        super(...arguments);
        this.setup = null;
        this.settings = {
            showIcons: false,
            marginTop: 15,
            nodeHeight: 20,
            indentWidth: 16,
            width: 300,
            duration: 400,
            dataUrl: '',
            filterUrl: '',
            defaultProperties: {},
            expandUpToLevel: null,
            actions: []
        };
        /**
         * Check if cursor is over the SVG element
         */
        this.isOverSvg = false;
        /**
         * Root <svg> element
         */
        this.svg = null;
        /**
         * SVG <g> container wrapping all .nodes, .links, .nodes-bg  elements
         */
        this.container = null;
        /**
         * SVG <g> container wrapping all .node elements
         */
        this.nodesContainer = null;
        /**
         * SVG <g> container wrapping all .nodes-bg elements
         */
        this.nodesBgContainer = null;
        /**
         * Is set when the input device is hovered over a node
         */
        this.hoveredNode = null;
        this.nodes = [];
        this.textPosition = 10;
        this.icons = {};
        this.nodesActionsContainer = null;
        /**
         * SVG <defs> container wrapping all icon definitions
         */
        this.iconsContainer = null;
        /**
         * SVG <g> container wrapping all links (lines between parent and child)
         *
         * @type {Selection}
         */
        this.linksContainer = null;
        this.data = new class {
            constructor() {
                this.links = [];
                this.nodes = [];
            }
        };
        this.viewportHeight = 0;
        this.scrollBottom = 0;
        this.searchTerm = null;
        this.unfilteredNodes = '';
        this.networkErrorTitle = top.TYPO3.lang.tree_networkError;
        this.networkErrorMessage = top.TYPO3.lang.tree_networkErrorDescription;
        this.tooltipOptions = {};
    }
    /**
     * Initializes the tree component - created basic markup, loads and renders data
     * @todo declare private
     */
    doSetup(settings) {
        Object.assign(this.settings, settings);
        if (this.settings.showIcons) {
            this.textPosition += 20;
        }
        this.svg = select(this).select('svg');
        this.container = this.svg.select('.nodes-wrapper');
        this.nodesBgContainer = this.container.select('.nodes-bg');
        this.nodesActionsContainer = this.container.select('.nodes-actions');
        this.linksContainer = this.container.select('.links');
        this.nodesContainer = this.container.select('.nodes');
        this.iconsContainer = this.svg.select('defs');
        this.tooltipOptions = {
            delay: 50,
            trigger: 'hover',
            placement: 'right',
            container: typeof this.settings.id !== 'undefined' ? '#' + this.settings.id : 'body',
        };
        this.updateScrollPosition();
        this.loadData();
        this.dispatchEvent(new Event('svg-tree:initialized'));
    }
    /**
     * Make the DOM element given as parameter focusable and focus it
     *
     * @param {SVGElement} element
     */
    switchFocus(element) {
        if (element === null) {
            return;
        }
        const visibleElements = element.parentNode.querySelectorAll('[tabindex]');
        visibleElements.forEach((visibleElement) => {
            visibleElement.setAttribute('tabindex', '-1');
        });
        element.setAttribute('tabindex', '0');
        element.focus();
    }
    /**
     * Make the DOM element of the node given as parameter focusable and focus it
     */
    switchFocusNode(node) {
        this.switchFocus(this.getNodeElement(node));
    }
    /**
     * Return the DOM element of a tree node
     */
    getNodeElement(node) {
        return this.querySelector('#identifier-' + this.getNodeStateIdentifier(node));
    }
    /**
     * Loads tree data (json) from configured url
     */
    loadData() {
        this.nodesAddPlaceholder();
        (new AjaxRequest(this.settings.dataUrl))
            .get({ cache: 'no-cache' })
            .then((response) => response.resolve())
            .then((json) => {
            const nodes = Array.isArray(json) ? json : [];
            this.replaceData(nodes);
            this.nodesRemovePlaceholder();
            // @todo: needed?
            this.updateScrollPosition();
            this.updateVisibleNodes();
        })
            .catch((error) => {
            this.errorNotification(error, false);
            this.nodesRemovePlaceholder();
            throw error;
        });
    }
    /**
     * Delete old tree and create new one
     */
    replaceData(nodes) {
        this.setParametersNode(nodes);
        this.prepareDataForVisibleNodes();
        this.nodesContainer.selectAll('.node').remove();
        this.nodesBgContainer.selectAll('.node-bg').remove();
        this.nodesActionsContainer.selectAll('.node-action').remove();
        this.linksContainer.selectAll('.link').remove();
        this.updateVisibleNodes();
    }
    /**
     * Set parameters like node parents, parentsStateIdentifier, checked.
     * Usually called when data is loaded initially or replaced completely.
     *
     * @param {Node[]} nodes
     */
    setParametersNode(nodes = null) {
        nodes = nodes || this.nodes;
        nodes = nodes.map((node, index) => {
            if (typeof node.command === 'undefined') {
                node = Object.assign({}, this.settings.defaultProperties, node);
            }
            node.expanded = (this.settings.expandUpToLevel !== null) ? node.depth < this.settings.expandUpToLevel : Boolean(node.expanded);
            node.parents = [];
            node.parentsStateIdentifier = [];
            if (node.depth > 0) {
                let currentDepth = node.depth;
                for (let i = index; i >= 0; i--) {
                    let currentNode = nodes[i];
                    if (currentNode.depth < currentDepth) {
                        node.parents.push(i);
                        node.parentsStateIdentifier.push(nodes[i].stateIdentifier);
                        currentDepth = currentNode.depth;
                    }
                }
            }
            if (typeof node.checked === 'undefined') {
                node.checked = false;
            }
            return node;
        });
        // get nodes with depth 0, if there is only 1 then open it and disable toggle
        const nodesOnRootLevel = nodes.filter((node) => node.depth === 0);
        if (nodesOnRootLevel.length === 1) {
            nodes[0].expanded = true;
        }
        const evt = new CustomEvent('typo3:svg-tree:nodes-prepared', { detail: { nodes: nodes }, bubbles: false });
        this.dispatchEvent(evt);
        this.nodes = evt.detail.nodes;
    }
    nodesRemovePlaceholder() {
        const nodeLoader = this.querySelector('.node-loader');
        if (nodeLoader) {
            nodeLoader.style.display = 'none';
        }
        const componentWrapper = this.closest('.svg-tree');
        const treeLoader = componentWrapper === null || componentWrapper === void 0 ? void 0 : componentWrapper.querySelector('.svg-tree-loader');
        if (treeLoader) {
            treeLoader.style.display = 'none';
        }
    }
    nodesAddPlaceholder(node = null) {
        if (node) {
            const nodeLoader = this.querySelector('.node-loader');
            if (nodeLoader) {
                nodeLoader.style.top = '' + (node.y + this.settings.marginTop);
                nodeLoader.style.display = 'block';
            }
        }
        else {
            const componentWrapper = this.closest('.svg-tree');
            const treeLoader = componentWrapper === null || componentWrapper === void 0 ? void 0 : componentWrapper.querySelector('.svg-tree-loader');
            if (treeLoader) {
                treeLoader.style.display = 'block';
            }
        }
    }
    /**
     * Updates node's data to hide/collapse children
     *
     * @param {Node} node
     */
    hideChildren(node) {
        node.expanded = false;
        this.setExpandedState(node);
        this.dispatchEvent(new CustomEvent('typo3:svg-tree:expand-toggle', { detail: { node: node } }));
    }
    /**
     * Updates node's data to show/expand children
     *
     * @param {Node} node
     */
    showChildren(node) {
        node.expanded = true;
        this.setExpandedState(node);
        this.dispatchEvent(new CustomEvent('typo3:svg-tree:expand-toggle', { detail: { node: node } }));
    }
    /**
     * Updates the expanded state of the DOM element that belongs to the node.
     * This is required because the node is not recreated on update and thus the change in the expanded state
     * of the node data is not represented in DOM on hideChildren and showChildren.
     *
     * @param {Node} node
     */
    setExpandedState(node) {
        const nodeElement = this.getNodeElement(node);
        if (nodeElement) {
            if (node.hasChildren) {
                nodeElement.setAttribute('aria-expanded', node.expanded ? 'true' : 'false');
            }
            else {
                nodeElement.removeAttribute('aria-expanded');
            }
        }
    }
    /**
     * Refresh view with new data
     */
    refreshTree() {
        this.loadData();
    }
    refreshOrFilterTree() {
        if (this.searchTerm !== '') {
            this.filter(this.searchTerm);
        }
        else {
            this.refreshTree();
        }
    }
    /**
     * Filters out invisible nodes (collapsed) from the full dataset (this.rootNode)
     * and enriches dataset with additional properties
     * Visible dataset is stored in this.data
     */
    prepareDataForVisibleNodes() {
        const blacklist = {};
        this.nodes.forEach((node, index) => {
            if (!node.expanded) {
                blacklist[index] = true;
            }
        });
        this.data.nodes = this.nodes.filter((node) => {
            return node.hidden !== true && !node.parents.some((index) => Boolean(blacklist[index]));
        });
        this.data.links = [];
        let pathAboveMounts = 0;
        this.data.nodes.forEach((node, i) => {
            // delete n.children;
            node.x = node.depth * this.settings.indentWidth;
            if (node.readableRootline) {
                pathAboveMounts += this.settings.nodeHeight;
            }
            node.y = (i * this.settings.nodeHeight) + pathAboveMounts;
            if (node.parents[0] !== undefined) {
                this.data.links.push({
                    source: this.nodes[node.parents[0]],
                    target: node
                });
            }
            if (this.settings.showIcons) {
                this.fetchIcon(node.icon);
                this.fetchIcon(node.overlayIcon);
                if (node.locked) {
                    this.fetchIcon('warning-in-use');
                }
            }
        });
        this.svg.attr('height', ((this.data.nodes.length * this.settings.nodeHeight) + (this.settings.nodeHeight / 2) + pathAboveMounts));
    }
    /**
     * Fetch icon from Icon API and store it in this.icons
     */
    fetchIcon(iconName, update = true) {
        if (!iconName) {
            return;
        }
        if (!(iconName in this.icons)) {
            this.icons[iconName] = {
                identifier: iconName,
                icon: null
            };
            Icons.getIcon(iconName, Icons.sizes.small, null, null, MarkupIdentifiers.inline).then((icon) => {
                let result = icon.match(/<svg[\s\S]*<\/svg>/i);
                if (result) {
                    let iconEl = document.createRange().createContextualFragment(result[0]);
                    this.icons[iconName].icon = iconEl.firstElementChild;
                }
                if (update) {
                    this.updateVisibleNodes();
                }
            });
        }
    }
    /**
     * Renders the subset of the tree nodes fitting the viewport (adding, modifying and removing SVG nodes)
     */
    updateVisibleNodes() {
        const visibleRows = Math.ceil(this.viewportHeight / this.settings.nodeHeight + 1);
        const position = Math.floor(Math.max(this.scrollTop - (this.settings.nodeHeight * 2), 0) / this.settings.nodeHeight);
        const visibleNodes = this.data.nodes.slice(position, position + visibleRows);
        const focusableElement = this.querySelector('[tabindex="0"]');
        const checkedNodeInViewport = visibleNodes.find((node) => node.checked);
        let nodes = this.nodesContainer.selectAll('.node')
            .data(visibleNodes, (node) => node.stateIdentifier);
        const nodesBg = this.nodesBgContainer.selectAll('.node-bg')
            .data(visibleNodes, (node) => node.stateIdentifier);
        const nodesActions = this.nodesActionsContainer.selectAll('.node-action')
            .data(visibleNodes, (node) => node.stateIdentifier);
        // delete nodes without corresponding data
        nodes.exit().remove();
        nodesBg.exit().remove();
        nodesActions.exit().remove();
        // update nodes actions
        this.updateNodeActions(nodesActions);
        // update nodes background
        const nodeBgClass = this.updateNodeBgClass(nodesBg);
        nodeBgClass
            .attr('class', (node, i) => {
            return this.getNodeBgClass(node, i, nodeBgClass);
        })
            .attr('style', (node) => {
            return node.backgroundColor ? 'fill: ' + node.backgroundColor + ';' : '';
        });
        this.updateLinks();
        nodes = this.enterSvgElements(nodes);
        // update nodes
        nodes
            .attr('tabindex', (node, index) => {
            if (typeof checkedNodeInViewport !== 'undefined') {
                if (checkedNodeInViewport === node) {
                    return '0';
                }
            }
            else {
                if (focusableElement === null) {
                    if (index === 0) {
                        return '0';
                    }
                }
                else {
                    if (select(focusableElement).datum() === node) {
                        return '0';
                    }
                }
            }
            return '-1';
        })
            .attr('transform', this.getNodeTransform)
            .select('.node-name')
            .html((node) => this.getNodeLabel(node));
        nodes
            .select('.chevron')
            .attr('transform', this.getChevronTransform)
            .style('fill', this.getChevronColor)
            .attr('class', this.getChevronClass);
        nodes
            .select('.toggle')
            .attr('visibility', this.getToggleVisibility);
        if (this.settings.showIcons) {
            nodes
                .select('use.node-icon')
                .attr('xlink:href', this.getIconId);
            nodes
                .select('use.node-icon-overlay')
                .attr('xlink:href', this.getIconOverlayId);
            nodes
                .select('use.node-icon-locked')
                .attr('xlink:href', (node) => {
                return '#icon-' + (node.locked ? 'warning-in-use' : '');
            });
        }
    }
    updateNodeBgClass(nodesBg) {
        return nodesBg.enter()
            .append('rect')
            .merge(nodesBg)
            .attr('width', '100%')
            .attr('height', this.settings.nodeHeight)
            .attr('data-state-id', this.getNodeStateIdentifier)
            .attr('transform', this.getNodeBgTransform)
            .on('mouseover', (evt, node) => this.onMouseOverNode(node))
            .on('mouseout', (evt, node) => this.onMouseOutOfNode(node))
            .on('click', (evt, node) => {
            this.selectNode(node, true);
            this.switchFocusNode(node);
        })
            .on('contextmenu', (evt, node) => {
            this.dispatchEvent(new CustomEvent('typo3:svg-tree:node-context', { detail: { node: node } }));
        });
    }
    /**
     * Returns icon's href attribute value
     */
    getIconId(node) {
        return '#icon-' + node.icon;
    }
    /**
     * Returns icon's href attribute value
     */
    getIconOverlayId(node) {
        return '#icon-' + node.overlayIcon;
    }
    /**
     * Node selection logic (triggered by different events)
     * This represents a dummy method and is usually overridden
     * The second argument can be interpreted by the listened events to e.g. not avoid reloading the content frame and instead
     * used for just updating the state within the tree
     */
    selectNode(node, propagate = true) {
        if (!this.isNodeSelectable(node)) {
            return;
        }
        // Disable already selected nodes
        this.disableSelectedNodes();
        node.checked = true;
        this.dispatchEvent(new CustomEvent('typo3:svg-tree:node-selected', { detail: { node: node, propagate: propagate } }));
        this.updateVisibleNodes();
    }
    filter(searchTerm) {
        if (typeof searchTerm === 'string') {
            this.searchTerm = searchTerm;
        }
        this.nodesAddPlaceholder();
        if (this.searchTerm && this.settings.filterUrl) {
            (new AjaxRequest(this.settings.filterUrl + '&q=' + this.searchTerm))
                .get({ cache: 'no-cache' })
                .then((response) => response.resolve())
                .then((json) => {
                let nodes = Array.isArray(json) ? json : [];
                if (nodes.length > 0) {
                    if (this.unfilteredNodes === '') {
                        this.unfilteredNodes = JSON.stringify(this.nodes);
                    }
                    this.replaceData(nodes);
                }
                this.nodesRemovePlaceholder();
            })
                .catch((error) => {
                this.errorNotification(error, false);
                this.nodesRemovePlaceholder();
                throw error;
            });
        }
        else {
            // restore original state without filters
            this.resetFilter();
        }
    }
    resetFilter() {
        this.searchTerm = '';
        if (this.unfilteredNodes.length > 0) {
            let currentlySelected = this.getSelectedNodes()[0];
            if (typeof currentlySelected === 'undefined') {
                this.refreshTree();
                return;
            }
            this.nodes = JSON.parse(this.unfilteredNodes);
            this.unfilteredNodes = '';
            // re-select the node from the identifier because the nodes have been updated
            const currentlySelectedNode = this.getNodeByIdentifier(currentlySelected.stateIdentifier);
            if (currentlySelectedNode) {
                this.selectNode(currentlySelectedNode, false);
                // Remove placeholder, in case this method was called from this.filter()
                // and there was currently a node selected.
                this.nodesRemovePlaceholder();
            }
            else {
                this.refreshTree();
            }
        }
        else {
            this.refreshTree();
        }
        this.prepareDataForVisibleNodes();
        this.updateVisibleNodes();
    }
    /**
     * Displays a notification message and refresh nodes
     */
    errorNotification(error = null, refresh = false) {
        if (Array.isArray(error)) {
            error.forEach((message) => {
                NotificationService.error(message.title, message.message);
            });
        }
        else {
            let title = this.networkErrorTitle;
            if (error && error.target && (error.target.status || error.target.statusText)) {
                title += ' - ' + (error.target.status || '') + ' ' + (error.target.statusText || '');
            }
            NotificationService.error(title, this.networkErrorMessage);
        }
        if (refresh) {
            this.loadData();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('resize', () => this.updateView());
        this.addEventListener('scroll', () => this.updateView());
        this.addEventListener('svg-tree:visible', () => this.updateView());
        window.addEventListener('resize', () => {
            if (this.getClientRects().length > 0) {
                this.updateView();
            }
        });
    }
    /**
     * Returns an array of selected nodes
     */
    getSelectedNodes() {
        return this.nodes.filter((node) => node.checked);
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        return T `
      <div class="node-loader">
        <typo3-backend-icon identifier="spinner-circle-light" size="small"></typo3-backend-icon>
      </div>
      <svg version="1.1"
           width="100%"
           @mouseover=${() => this.isOverSvg = true}
           @mouseout=${() => this.isOverSvg = false}
           @keydown=${(evt) => this.handleKeyboardInteraction(evt)}>
        <g class="nodes-wrapper" transform="translate(${this.settings.indentWidth / 2},${this.settings.nodeHeight / 2})">
          <g class="nodes-bg"></g>
          <g class="links"></g>
          <g class="nodes" role="tree"></g>
          <g class="nodes-actions"></g>
        </g>
        <defs></defs>
      </svg>
    `;
    }
    firstUpdated() {
        this.svg = select(this.querySelector('svg'));
        this.container = select(this.querySelector('.nodes-wrapper'))
            .attr('transform', 'translate(' + (this.settings.indentWidth / 2) + ',' + (this.settings.nodeHeight / 2) + ')');
        this.nodesBgContainer = select(this.querySelector('.nodes-bg'));
        this.nodesActionsContainer = select(this.querySelector('.nodes-actions'));
        this.linksContainer = select(this.querySelector('.links'));
        this.nodesContainer = select(this.querySelector('.nodes'));
        this.doSetup(this.setup || {});
        this.updateView();
    }
    updateView() {
        this.updateScrollPosition();
        this.updateVisibleNodes();
        if (this.settings.actions && this.settings.actions.length) {
            this.nodesActionsContainer.attr('transform', 'translate(' + (this.querySelector('svg').clientWidth - 16 - ((16 * this.settings.actions.length))) + ',0)');
        }
    }
    disableSelectedNodes() {
        // Disable already selected nodes
        this.getSelectedNodes().forEach((node) => {
            if (node.checked === true) {
                node.checked = false;
            }
        });
    }
    /**
     * Ensure to update the actions column to stick to the very end
     */
    updateNodeActions(nodesActions) {
        if (this.settings.actions && this.settings.actions.length) {
            // Remove all existing actions again
            this.nodesActionsContainer.selectAll('.node-action').selectChildren().remove();
            return nodesActions.enter()
                .append('g')
                .merge(nodesActions)
                .attr('class', 'node-action')
                .on('mouseover', (evt, node) => this.onMouseOverNode(node))
                .on('mouseout', (evt, node) => this.onMouseOutOfNode(node))
                .attr('data-state-id', this.getNodeStateIdentifier)
                .attr('transform', this.getNodeActionTransform);
        }
        return nodesActions.enter();
    }
    /**
     * This is a quick helper function to create custom action icons.
     */
    createIconAreaForAction(actionItem, iconIdentifier) {
        const icon = actionItem
            .append('svg')
            .attr('class', 'node-icon-container')
            .attr('height', '20')
            .attr('width', '20')
            .attr('x', '0')
            .attr('y', '0');
        // improve usability by making the click area a 20px square
        icon
            .append('rect')
            .attr('width', '20')
            .attr('height', '20')
            .attr('y', '0')
            .attr('x', '0')
            .attr('class', 'node-icon-click');
        const nodeInner = icon
            .append('svg')
            .attr('height', '16')
            .attr('width', '16')
            .attr('y', '2')
            .attr('x', '2')
            .attr('class', 'node-icon-inner');
        nodeInner
            .append('use')
            .attr('class', 'node-icon')
            .attr('xlink:href', '#icon-' + iconIdentifier);
    }
    /**
     * Check whether node can be selected.
     * In some cases (e.g. selecting a parent) it should not be possible to select
     * element (as it's own parent).
     */
    isNodeSelectable(node) {
        return true;
    }
    appendTextElement(nodes) {
        return nodes
            .append('text')
            .attr('dx', (node) => {
            return this.textPosition + (node.locked ? 15 : 0);
        })
            .attr('dy', 5)
            .attr('class', 'node-name')
            .on('click', (evt, node) => this.selectNode(node, true));
    }
    nodesUpdate(nodes) {
        nodes = nodes
            .enter()
            .append('g')
            .attr('class', this.getNodeClass)
            .attr('id', (node) => {
            return 'identifier-' + node.stateIdentifier;
        })
            .attr('role', 'treeitem')
            .attr('aria-owns', (node) => {
            return (node.hasChildren ? 'group-identifier-' + node.stateIdentifier : null);
        })
            .attr('aria-level', this.getNodeDepth)
            .attr('aria-setsize', this.getNodeSetsize)
            .attr('aria-posinset', this.getNodePositionInSet)
            .attr('aria-expanded', (node) => {
            return (node.hasChildren ? node.expanded : null);
        })
            .attr('transform', this.getNodeTransform)
            .attr('data-state-id', this.getNodeStateIdentifier)
            .attr('title', this.getNodeTitle)
            .on('mouseover', (evt, node) => this.onMouseOverNode(node))
            .on('mouseout', (evt, node) => this.onMouseOutOfNode(node))
            .on('contextmenu', (evt, node) => {
            evt.preventDefault();
            this.dispatchEvent(new CustomEvent('typo3:svg-tree:node-context', { detail: { node: node } }));
        });
        nodes
            .append('text')
            .text((node) => {
            return node.readableRootline;
        })
            .attr('class', 'node-rootline')
            .attr('dx', 0)
            .attr('dy', -15)
            .attr('visibility', (node) => node.readableRootline ? 'visible' : 'hidden');
        return nodes;
    }
    getNodeIdentifier(node) {
        return node.identifier;
    }
    getNodeDepth(node) {
        return node.depth;
    }
    getNodeSetsize(node) {
        return node.siblingsCount;
    }
    getNodePositionInSet(node) {
        return node.siblingsPosition;
    }
    getNodeStateIdentifier(node) {
        return node.stateIdentifier;
    }
    getNodeLabel(node) {
        let label = (node.prefix || '') + node.name + (node.suffix || '');
        // make a text node out of it, and strip out any HTML (this is because the return value uses html()
        // instead of text() which is needed to avoid XSS in a page title
        const labelNode = document.createElement('div');
        labelNode.textContent = label;
        label = labelNode.innerHTML;
        if (this.searchTerm) {
            const regexp = new RegExp(this.searchTerm, 'gi');
            label = label.replace(regexp, '<tspan class="node-highlight-text">$&</tspan>');
        }
        return label;
    }
    getNodeClass(node) {
        return 'node identifier-' + node.stateIdentifier;
    }
    /**
     * Finds node by its stateIdentifier (e.g. "0_360")
     */
    getNodeByIdentifier(identifier) {
        return this.nodes.find((node) => {
            return node.stateIdentifier === identifier;
        });
    }
    /**
     * Computes the tree node-bg class
     */
    getNodeBgClass(node, i, nodeBgClass) {
        let bgClass = 'node-bg';
        let prevNode = null;
        let nextNode = null;
        if (typeof nodeBgClass === 'object') {
            prevNode = nodeBgClass.data()[i - 1];
            nextNode = nodeBgClass.data()[i + 1];
        }
        if (node.checked) {
            bgClass += ' node-selected';
        }
        if ((prevNode && (node.depth > prevNode.depth)) || !prevNode) {
            node.firstChild = true;
            bgClass += ' node-first-child';
        }
        if ((nextNode && (node.depth > nextNode.depth)) || !nextNode) {
            node.lastChild = true;
            bgClass += ' node-last-child';
        }
        if (node.class) {
            bgClass += ' ' + node.class;
        }
        return bgClass;
    }
    getNodeTitle(node) {
        return node.tip ? node.tip : 'uid=' + node.identifier;
    }
    getChevronTransform(node) {
        return node.expanded ? 'translate(16,0) rotate(90)' : ' rotate(0)';
    }
    getChevronColor(node) {
        return node.expanded ? '#000' : '#8e8e8e';
    }
    getToggleVisibility(node) {
        return node.hasChildren ? 'visible' : 'hidden';
    }
    getChevronClass(node) {
        return 'chevron ' + (node.expanded ? 'expanded' : 'collapsed');
    }
    /**
     * Returns a SVG path's 'd' attribute value
     *
     * @param {SvgTreeDataLink} link
     * @returns {String}
     */
    getLinkPath(link) {
        const target = {
            x: link.target.x,
            y: link.target.y
        };
        const path = [];
        path.push('M' + link.source.x + ' ' + link.source.y);
        path.push('V' + target.y);
        if (link.target.hasChildren) {
            path.push('H' + (target.x - 2));
        }
        else {
            path.push('H' + ((target.x + this.settings.indentWidth / 4) - 2));
        }
        return path.join(' ');
    }
    /**
     * Returns a 'transform' attribute value for the tree element (absolute positioning)
     *
     * @param {Node} node
     */
    getNodeTransform(node) {
        return 'translate(' + (node.x || 0) + ',' + (node.y || 0) + ')';
    }
    /**
     * Returns a 'transform' attribute value for the node background element (absolute positioning)
     *
     * @param {Node} node
     */
    getNodeBgTransform(node) {
        return 'translate(-8, ' + ((node.y || 0) - 10) + ')';
    }
    /**
     * Returns a 'transform' attribute value for the node background element (absolute positioning)
     *
     * @param {Node} node
     */
    getNodeActionTransform(node) {
        return 'translate(-10, ' + ((node.y || 0) - 10) + ')';
    }
    /**
     * Event handler for clicking on a node's icon
     */
    clickOnIcon(node) {
        this.dispatchEvent(new CustomEvent('typo3:svg-tree:node-context', { detail: { node: node } }));
    }
    /**
     * Event handler for click on a chevron
     */
    chevronClick(node) {
        if (node.expanded) {
            this.hideChildren(node);
        }
        else {
            this.showChildren(node);
        }
        this.prepareDataForVisibleNodes();
        this.updateVisibleNodes();
    }
    /**
     * Adds missing SVG nodes
     *
     * @param {Selection} nodes
     * @returns {Selection}
     */
    enterSvgElements(nodes) {
        if (this.settings.showIcons) {
            const iconsArray = Object.values(this.icons)
                .filter((icon) => icon.icon !== '' && icon.icon !== null);
            const icons = this.iconsContainer
                .selectAll('.icon-def')
                .data(iconsArray, (icon) => icon.identifier);
            icons.exit().remove();
            icons
                .enter()
                .append('g')
                .attr('class', 'icon-def')
                .attr('id', (node) => 'icon-' + node.identifier)
                .append((node) => {
                if (node.icon instanceof SVGElement) {
                    return node.icon;
                }
                // Once all icons are real SVG Elements, this part can safely be removed
                const markup = '<svg>' + node.icon + '</svg>';
                const parser = new DOMParser();
                const dom = parser.parseFromString(markup, 'image/svg+xml');
                return dom.documentElement.firstChild;
            });
        }
        // create the node elements
        const nodeEnter = this.nodesUpdate(nodes);
        // append the chevron element
        let chevron = nodeEnter
            .append('g')
            .attr('class', 'toggle')
            .attr('visibility', this.getToggleVisibility)
            .attr('transform', 'translate(-8, -8)')
            .on('click', (evt, node) => this.chevronClick(node));
        // improve usability by making the click area a 16px square
        chevron
            .append('path')
            .style('opacity', 0)
            .attr('d', 'M 0 0 L 16 0 L 16 16 L 0 16 Z');
        chevron
            .append('path')
            .attr('class', 'chevron')
            .attr('d', 'M 4 3 L 13 8 L 4 13 Z');
        // append the icon element
        if (this.settings.showIcons) {
            const nodeContainer = nodeEnter
                .append('svg')
                .attr('class', 'node-icon-container')
                .attr('title', this.getNodeTitle)
                .attr('height', '20')
                .attr('width', '20')
                .attr('x', '6')
                .attr('y', '-10')
                .attr('data-bs-toggle', 'tooltip')
                .on('click', (evt, node) => {
                evt.preventDefault();
                this.clickOnIcon(node);
            });
            // improve usability by making the click area a 20px square
            nodeContainer
                .append('rect')
                .style('opacity', 0)
                .attr('width', '20')
                .attr('height', '20')
                .attr('y', '0')
                .attr('x', '0')
                .attr('class', 'node-icon-click');
            const nodeInner = nodeContainer
                .append('svg')
                .attr('height', '16')
                .attr('width', '16')
                .attr('y', '2')
                .attr('x', '2')
                .attr('class', 'node-icon-inner');
            nodeInner
                .append('use')
                .attr('class', 'node-icon')
                .attr('data-uid', this.getNodeIdentifier);
            const nodeIconOverlay = nodeInner
                .append('svg')
                .attr('height', '11')
                .attr('width', '11')
                .attr('y', '5')
                .attr('x', '5');
            nodeIconOverlay
                .append('use')
                .attr('class', 'node-icon-overlay');
            const nodeIconLocked = nodeInner
                .append('svg')
                .attr('height', '11')
                .attr('width', '11')
                .attr('y', '5')
                .attr('x', '5');
            nodeIconLocked
                .append('use')
                .attr('class', 'node-icon-locked');
        }
        tooltipObject.initialize('[data-bs-toggle="tooltip"]', this.tooltipOptions);
        this.appendTextElement(nodeEnter);
        return nodes.merge(nodeEnter);
    }
    /**
     * Updates variables used for visible nodes calculation
     */
    updateScrollPosition() {
        this.viewportHeight = this.getBoundingClientRect().height;
        this.scrollBottom = this.scrollTop + this.viewportHeight + (this.viewportHeight / 2);
        // wait for the tooltip to appear and disable tooltips when scrolling
        setTimeout(() => {
            tooltipObject.hide(document.querySelector(this.tooltipOptions.container).querySelectorAll('.bs-tooltip-end'));
        }, this.tooltipOptions.delay);
    }
    /**
     * node background events
     */
    onMouseOverNode(node) {
        node.isOver = true;
        this.hoveredNode = node;
        let elementNodeBg = this.svg.select('.nodes-bg .node-bg[data-state-id="' + node.stateIdentifier + '"]');
        if (elementNodeBg.size()) {
            elementNodeBg
                .classed('node-over', true)
                .attr('rx', '3')
                .attr('ry', '3');
        }
        let elementNodeAction = this.nodesActionsContainer.select('.node-action[data-state-id="' + node.stateIdentifier + '"]');
        if (elementNodeAction.size()) {
            elementNodeAction.classed('node-action-over', true);
            // @todo: needs to be adapted for active nodes
            elementNodeAction.attr('fill', elementNodeBg.style('fill'));
        }
    }
    /**
     * node background events
     */
    onMouseOutOfNode(node) {
        node.isOver = false;
        this.hoveredNode = null;
        let elementNodeBg = this.svg.select('.nodes-bg .node-bg[data-state-id="' + node.stateIdentifier + '"]');
        if (elementNodeBg.size()) {
            elementNodeBg
                .classed('node-over node-alert', false)
                .attr('rx', '0')
                .attr('ry', '0');
        }
        let elementNodeAction = this.nodesActionsContainer.select('.node-action[data-state-id="' + node.stateIdentifier + '"]');
        if (elementNodeAction.size()) {
            elementNodeAction.classed('node-action-over', false);
        }
    }
    /**
     * Add keydown handling to allow keyboard navigation inside the tree
     */
    handleKeyboardInteraction(evt) {
        const evtTarget = evt.target;
        let currentNode = select(evtTarget).datum();
        const charCodes = [
            KeyTypesEnum.ENTER,
            KeyTypesEnum.SPACE,
            KeyTypesEnum.END,
            KeyTypesEnum.HOME,
            KeyTypesEnum.LEFT,
            KeyTypesEnum.UP,
            KeyTypesEnum.RIGHT,
            KeyTypesEnum.DOWN
        ];
        if (charCodes.indexOf(evt.keyCode) === -1) {
            return;
        }
        evt.preventDefault();
        const parentDomNode = evtTarget.parentNode;
        // @todo Migrate to `evt.code`, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
        switch (evt.keyCode) {
            case KeyTypesEnum.END:
                // scroll to end, select last node
                this.scrollTop = this.lastElementChild.getBoundingClientRect().height + this.settings.nodeHeight - this.viewportHeight;
                parentDomNode.scrollIntoView({ behavior: 'smooth', block: 'end' });
                this.updateVisibleNodes();
                this.switchFocus(parentDomNode.lastElementChild);
                break;
            case KeyTypesEnum.HOME:
                // scroll to top, select first node
                this.scrollTo({ 'top': this.nodes[0].y, 'behavior': 'smooth' });
                this.prepareDataForVisibleNodes();
                this.updateVisibleNodes();
                this.switchFocus(parentDomNode.firstElementChild);
                break;
            case KeyTypesEnum.LEFT:
                if (currentNode.expanded) {
                    // collapse node if collapsible
                    if (currentNode.hasChildren) {
                        this.hideChildren(currentNode);
                        this.prepareDataForVisibleNodes();
                        this.updateVisibleNodes();
                    }
                }
                else if (currentNode.parents.length > 0) {
                    // go to parent node
                    let parentNode = this.nodes[currentNode.parents[0]];
                    this.scrollNodeIntoVisibleArea(parentNode, 'up');
                    this.switchFocusNode(parentNode);
                }
                break;
            case KeyTypesEnum.UP:
                // select previous visible node on any level
                this.scrollNodeIntoVisibleArea(currentNode, 'up');
                this.switchFocus(evtTarget.previousSibling);
                break;
            case KeyTypesEnum.RIGHT:
                if (currentNode.expanded) {
                    // the current node is expanded, goto first child (next element on the list)
                    this.scrollNodeIntoVisibleArea(currentNode, 'down');
                    this.switchFocus(evtTarget.nextSibling);
                }
                else {
                    if (currentNode.hasChildren) {
                        // expand currentNode
                        this.showChildren(currentNode);
                        this.prepareDataForVisibleNodes();
                        this.updateVisibleNodes();
                        this.switchFocus(evtTarget);
                    }
                    //do nothing if node has no children
                }
                break;
            case KeyTypesEnum.DOWN:
                // select next visible node on any level
                // check if node is at end of viewport and scroll down if so
                this.scrollNodeIntoVisibleArea(currentNode, 'down');
                this.switchFocus(evtTarget.nextSibling);
                break;
            case KeyTypesEnum.ENTER:
            case KeyTypesEnum.SPACE:
                this.selectNode(currentNode, true);
                break;
            default:
        }
    }
    /**
     * If node is at the top of the viewport and direction is up, scroll up by the height of one item
     * If node is at the bottom of the viewport and direction is down, scroll down by the height of one item
     */
    scrollNodeIntoVisibleArea(node, direction = 'up') {
        let scrollTop = this.scrollTop;
        if (direction === 'up' && scrollTop > node.y - this.settings.nodeHeight) {
            scrollTop = node.y - this.settings.nodeHeight;
        }
        else if (direction === 'down' && scrollTop + this.viewportHeight <= node.y + (3 * this.settings.nodeHeight)) {
            scrollTop = scrollTop + this.settings.nodeHeight;
        }
        else {
            return;
        }
        this.scrollTo({ 'top': scrollTop, 'behavior': 'smooth' });
        this.updateVisibleNodes();
    }
    /**
     * Renders links(lines) between parent and child nodes and is also used for grouping the children
     * The line element of the first child is used as role=group node to group the children programmatically
     */
    updateLinks() {
        const visibleLinks = this.data.links
            .filter((link) => {
            return link.source.y <= this.scrollBottom && link.target.y >= this.scrollTop - this.settings.nodeHeight;
        })
            .map((link) => {
            link.source.owns = link.source.owns || [];
            link.source.owns.push('identifier-' + link.target.stateIdentifier);
            return link;
        });
        const links = this.linksContainer.selectAll('.link').data(visibleLinks);
        // delete
        links.exit().remove();
        // create
        links.enter()
            .append('path')
            .attr('class', 'link')
            .attr('id', this.getGroupIdentifier)
            .attr('role', (link) => {
            return link.target.siblingsPosition === 1 && link.source.owns.length > 0 ? 'group' : null;
        })
            .attr('aria-owns', (link) => {
            return link.target.siblingsPosition === 1 && link.source.owns.length > 0 ? link.source.owns.join(' ') : null;
        })
            // create + update
            .merge(links)
            .attr('d', (link) => this.getLinkPath(link));
    }
    /**
     * If the link target is the first child, set the group identifier.
     * The group with this id is used for grouping the siblings, thus the identifier uses the stateIdentifier of
     * the link source item.
     */
    getGroupIdentifier(link) {
        return link.target.siblingsPosition === 1 ? 'group-identifier-' + link.source.stateIdentifier : null;
    }
}
__decorate([
    e({ type: Object })
], SvgTree.prototype, "setup", void 0);
__decorate([
    r()
], SvgTree.prototype, "settings", void 0);
/**
 * A basic toolbar allowing to search / filter
 */
let Toolbar = class Toolbar extends h {
    constructor() {
        super(...arguments);
        this.tree = null;
        this.settings = {
            searchInput: '.search-input',
            filterTimeout: 450
        };
    }
    createRenderRoot() {
        return this;
    }
    firstUpdated() {
        const inputEl = this.querySelector(this.settings.searchInput);
        if (inputEl) {
            new DebounceEvent('input', (evt) => {
                const el = evt.target;
                this.tree.filter(el.value.trim());
            }, this.settings.filterTimeout).bindTo(inputEl);
            inputEl.focus();
            inputEl.clearable({
                onClear: () => {
                    this.tree.resetFilter();
                }
            });
        }
    }
    render() {
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
      </div>
    `;
    }
    refreshTree() {
        this.tree.refreshOrFilterTree();
    }
};
__decorate([
    e({ type: SvgTree })
], Toolbar.prototype, "tree", void 0);
Toolbar = __decorate([
    n('typo3-backend-tree-toolbar')
], Toolbar);

export { SvgTree, Toolbar };
