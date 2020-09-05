import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { SvgTree } from '../SvgTree.esm.js';

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
 * A Tree based on SVG for pages, which has a AJAX-based loading of the tree
 * and also handles search + filter via AJAX.
 */
class PageTree extends SvgTree {
    constructor() {
        super();
        this.networkErrorTitle = TYPO3.lang.pagetree_networkErrorTitle;
        this.networkErrorMessage = TYPO3.lang.pagetree_networkErrorDesc;
        this.settings.defaultProperties = {
            hasChildren: false,
            nameSourceField: 'title',
            itemType: 'pages',
            prefix: '',
            suffix: '',
            locked: false,
            loaded: false,
            overlayIcon: '',
            selectable: true,
            expanded: false,
            checked: false,
            backgroundColor: '',
            stopPageTree: false,
            class: '',
            readableRootline: '',
            isMountPoint: false,
        };
    }
    showChildren(node) {
        this.loadChildrenOfNode(node);
        super.showChildren(node);
    }
    nodesUpdate(nodes) {
        nodes = super.nodesUpdate(nodes);
        nodes
            .append('text')
            .text('+')
            .attr('class', 'node-stop')
            .attr('dx', 30)
            .attr('dy', 5)
            .attr('visibility', (node) => node.stopPageTree && node.depth !== 0 ? 'visible' : 'hidden')
            .on('click', (evt, node) => {
            document.dispatchEvent(new CustomEvent('typo3:pagetree:mountPoint', { detail: { pageId: parseInt(node.identifier, 10) } }));
        });
        return nodes;
    }
    /**
     * Loads child nodes via Ajax (used when expanding a collapsed node)
     */
    loadChildrenOfNode(parentNode) {
        if (parentNode.loaded) {
            return;
        }
        this.nodesAddPlaceholder();
        (new AjaxRequest(this.settings.dataUrl + '&pid=' + parentNode.identifier + '&mount=' + parentNode.mountPoint + '&pidDepth=' + parentNode.depth))
            .get({ cache: 'no-cache' })
            .then((response) => response.resolve())
            .then((json) => {
            let nodes = Array.isArray(json) ? json : [];
            // first element is a parent
            nodes.shift();
            const index = this.nodes.indexOf(parentNode) + 1;
            // adding fetched node after parent
            nodes.forEach((node, offset) => {
                this.nodes.splice(index + offset, 0, node);
            });
            parentNode.loaded = true;
            this.setParametersNode();
            this.prepareDataForVisibleNodes();
            this.updateVisibleNodes();
            this.nodesRemovePlaceholder();
            this.switchFocusNode(parentNode);
        })
            .catch((error) => {
            this.errorNotification(error, false);
            this.nodesRemovePlaceholder();
            throw error;
        });
    }
    /**
     * Changed text position if there is 'stop page tree' option
     */
    appendTextElement(nodes) {
        return super.appendTextElement(nodes)
            .attr('dx', (node) => {
            let position = this.textPosition;
            if (node.stopPageTree && node.depth !== 0) {
                position += 15;
            }
            if (node.locked) {
                position += 15;
            }
            return position;
        });
    }
    ;
}

export { PageTree };
