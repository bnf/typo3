import { html as T } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { renderNodes } from '../../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';
import { pointer } from '../../../../../core/Resources/Public/JavaScript/Contrib/d3-selection.esm.js';
import { drag } from '../../../../../core/Resources/Public/JavaScript/Contrib/d3-drag.esm.js';

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
 * Contains basic types for allowing dragging + dropping in trees
 */
/**
 * Generates a template for dragged node
 */
class DraggableTemplate {
    static get(icon, name) {
        return T `<div class="node-dd node-dd--nodrop">
        <div class="node-dd__ctrl-icon"></div>
        <div class="node-dd__text">
            <span class="node-dd__icon">
                <svg aria-hidden="true" style="width: 16px; height: 16px">
                    <use xlink:ref="${icon}"></use>
                </svg>
            </span>
            <span class="node-dd__name">${name}</span>
        </div>
    </div>`;
    }
}
var DraggablePositionEnum;
(function (DraggablePositionEnum) {
    DraggablePositionEnum["INSIDE"] = "inside";
    DraggablePositionEnum["BEFORE"] = "before";
    DraggablePositionEnum["AFTER"] = "after";
})(DraggablePositionEnum || (DraggablePositionEnum = {}));
/**
 * Contains the information about drag+drop of one tree instance, contains common
 * functionality used for drag+drop.
 */
class DragDrop {
    constructor(svgTree) {
        this.timeout = {};
        this.minimalDistance = 10;
        this.tree = svgTree;
    }
    static get default() {
        console.warn('The property .default of module DragDrop has been deprecated, use DragDrop directly.');
        return this;
    }
    static setDragStart() {
        document.querySelectorAll('iframe').forEach((htmlElement) => htmlElement.style.pointerEvents = 'none');
    }
    static setDragEnd() {
        document.querySelectorAll('iframe').forEach((htmlElement) => htmlElement.style.pointerEvents = '');
    }
    /**
     * Creates a new drag instance and initializes the clickDistance setting to
     * prevent clicks from being wrongly detected as drag attempts.
     */
    connectDragHandler(dragHandler) {
        return drag()
            .clickDistance(5)
            .on('start', function (evt) { dragHandler.dragStart(evt) && DragDrop.setDragStart(); })
            .on('drag', function (evt) { dragHandler.dragDragged(evt); })
            .on('end', function (evt) { DragDrop.setDragEnd(); dragHandler.dragEnd(evt); });
    }
    createDraggable(icon, name) {
        var _a;
        let svg = this.tree.svg.node();
        const draggable = renderNodes(DraggableTemplate.get(icon, name));
        svg.after(...draggable);
        (_a = this.tree.svg.node().querySelector('.nodes-wrapper')) === null || _a === void 0 ? void 0 : _a.classList.add('nodes-wrapper--dragging');
    }
    updateDraggablePosition(evt) {
        let left = 18;
        let top = 15;
        if (evt.sourceEvent && evt.sourceEvent.pageX) {
            left += evt.sourceEvent.pageX;
        }
        if (evt.sourceEvent && evt.sourceEvent.pageY) {
            top += evt.sourceEvent.pageY;
        }
        document.querySelectorAll('.node-dd').forEach((draggable) => {
            draggable.style.top = top + 'px';
            draggable.style.left = left + 'px';
            draggable.style.display = 'block';
        });
    }
    /**
     * Open node with children while holding the node/element over this node for 1 second
     */
    openNodeTimeout() {
        if (this.tree.hoveredNode !== null && this.tree.hoveredNode.hasChildren && !this.tree.hoveredNode.expanded) {
            if (this.timeout.node != this.tree.hoveredNode) {
                this.timeout.node = this.tree.hoveredNode;
                clearTimeout(this.timeout.time);
                this.timeout.time = setTimeout(() => {
                    if (this.tree.hoveredNode) {
                        this.tree.showChildren(this.tree.hoveredNode);
                        this.tree.prepareDataForVisibleNodes();
                        this.tree.updateVisibleNodes();
                    }
                }, 1000);
            }
        }
        else {
            clearTimeout(this.timeout.time);
        }
    }
    changeNodeClasses(event) {
        const elementNodeBg = this.tree.svg.select('.node-over');
        const svg = this.tree.svg.node();
        const nodeDd = svg.parentNode.querySelector('.node-dd');
        let nodeBgBorder = this.tree.nodesBgContainer.selectAll('.node-bg__border');
        if (elementNodeBg.size() && this.tree.isOverSvg) {
            // line between nodes
            if (nodeBgBorder.empty()) {
                nodeBgBorder = this.tree.nodesBgContainer
                    .append('rect')
                    .attr('class', 'node-bg__border')
                    .attr('height', '1px')
                    .attr('width', '100%');
            }
            const coordinates = pointer(event, elementNodeBg.node());
            let y = coordinates[1];
            if (y < 3) {
                const attr = nodeBgBorder.attr('transform', 'translate(-8, ' + (this.tree.hoveredNode.y - 10) + ')');
                attr.style('display', 'block');
                if (this.tree.hoveredNode.depth === 0) {
                    this.addNodeDdClass(nodeDd, 'nodrop');
                }
                else if (this.tree.hoveredNode.firstChild) {
                    this.addNodeDdClass(nodeDd, 'ok-above');
                }
                else {
                    this.addNodeDdClass(nodeDd, 'ok-between');
                }
                this.tree.settings.nodeDragPosition = DraggablePositionEnum.BEFORE;
            }
            else if (y > 17) {
                nodeBgBorder.style('display', 'none');
                if (this.tree.hoveredNode.expanded && this.tree.hoveredNode.hasChildren) {
                    this.addNodeDdClass(nodeDd, 'ok-append');
                    this.tree.settings.nodeDragPosition = DraggablePositionEnum.INSIDE;
                }
                else {
                    const attr = nodeBgBorder.attr('transform', 'translate(-8, ' + (this.tree.hoveredNode.y + 10) + ')');
                    attr.style('display', 'block');
                    if (this.tree.hoveredNode.lastChild) {
                        this.addNodeDdClass(nodeDd, 'ok-below');
                    }
                    else {
                        this.addNodeDdClass(nodeDd, 'ok-between');
                    }
                    this.tree.settings.nodeDragPosition = DraggablePositionEnum.AFTER;
                }
            }
            else {
                nodeBgBorder.style('display', 'none');
                this.addNodeDdClass(nodeDd, 'ok-append');
                this.tree.settings.nodeDragPosition = DraggablePositionEnum.INSIDE;
            }
        }
        else {
            this.tree.nodesBgContainer
                .selectAll('.node-bg__border')
                .style('display', 'none');
            this.addNodeDdClass(nodeDd, 'nodrop');
        }
    }
    addNodeDdClass(nodeDd, className) {
        const nodesWrap = this.tree.svg.node().querySelector('.nodes-wrapper');
        if (nodeDd) {
            this.applyNodeClassNames(nodeDd, 'node-dd--', className);
        }
        if (nodesWrap) {
            this.applyNodeClassNames(nodesWrap, 'nodes-wrapper--', className);
        }
        this.tree.settings.canNodeDrag = className !== 'nodrop';
    }
    // Clean up after a finished drag+drop move
    removeNodeDdClass() {
        var _a;
        const nodesWrap = this.tree.svg.node().querySelector('.nodes-wrapper');
        // remove any classes from wrapper
        [
            'nodes-wrapper--nodrop',
            'nodes-wrapper--ok-append',
            'nodes-wrapper--ok-below',
            'nodes-wrapper--ok-between',
            'nodes-wrapper--ok-above',
            'nodes-wrapper--dragging'
        ].forEach((className) => nodesWrap.classList.remove(className));
        (_a = this.tree.nodesBgContainer.node().querySelector('.node-bg.node-bg--dragging')) === null || _a === void 0 ? void 0 : _a.classList.remove('node-bg--dragging');
        this.tree.nodesBgContainer.selectAll('.node-bg__border').style('display', 'none');
        this.tree.svg.node().parentNode.querySelector('.node-dd').remove();
    }
    /**
     * Check if node is dragged at least @distance
     */
    isDragNodeDistanceMore(event, dragHandler) {
        return (dragHandler.startDrag ||
            (((dragHandler.startPageX - this.minimalDistance) > event.sourceEvent.pageX) ||
                ((dragHandler.startPageX + this.minimalDistance) < event.sourceEvent.pageX) ||
                ((dragHandler.startPageY - this.minimalDistance) > event.sourceEvent.pageY) ||
                ((dragHandler.startPageY + this.minimalDistance) < event.sourceEvent.pageY)));
    }
    applyNodeClassNames(target, prefix, className) {
        const classNames = ['nodrop', 'ok-append', 'ok-below', 'ok-between', 'ok-above', 'dragging'];
        // remove any existing classes
        classNames.forEach((className) => target.classList.remove(prefix + className));
        // apply new class
        target.classList.add(prefix + className);
    }
}

export { DragDrop, DraggablePositionEnum };
