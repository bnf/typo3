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
 * A tree for folders / storages
 */
class FileStorageTree extends SvgTree {
    constructor() {
        super();
        this.settings.defaultProperties = {
            hasChildren: false,
            nameSourceField: 'title',
            itemType: 'sys_file',
            prefix: '',
            suffix: '',
            locked: false,
            loaded: false,
            overlayIcon: '',
            selectable: true,
            expanded: false,
            checked: false,
            backgroundColor: '',
            class: '',
            readableRootline: ''
        };
    }
    showChildren(node) {
        this.loadChildrenOfNode(node);
        super.showChildren(node);
    }
    getNodeTitle(node) {
        return decodeURIComponent(node.name);
    }
    /**
     * Loads child nodes via Ajax (used when expanding a collapsed node)
     */
    loadChildrenOfNode(parentNode) {
        if (parentNode.loaded) {
            this.prepareDataForVisibleNodes();
            this.updateVisibleNodes();
            return;
        }
        this.nodesAddPlaceholder();
        (new AjaxRequest(this.settings.dataUrl + '&parent=' + parentNode.identifier + '&currentDepth=' + parentNode.depth))
            .get({ cache: 'no-cache' })
            .then((response) => response.resolve())
            .then((json) => {
            let nodes = Array.isArray(json) ? json : [];
            const index = this.nodes.indexOf(parentNode) + 1;
            //adding fetched node after parent
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
}

export { FileStorageTree };
