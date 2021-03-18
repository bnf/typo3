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

import AjaxRequest from 'TYPO3/CMS/Core/Ajax/AjaxRequest';
import {SvgTree, TreeNodeSelection} from '../SvgTree';
import {TreeNode} from '../Tree/TreeNode';
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';
import {svg, SVGTemplateResult} from 'lit-element';

/**
 * A Tree based on SVG for pages, which has a AJAX-based loading of the tree
 * and also handles search + filter via AJAX.
 */
export class PageTree extends SvgTree
{
  protected networkErrorTitle: string = TYPO3.lang.pagetree_networkErrorTitle;
  protected networkErrorMessage: string = TYPO3.lang.pagetree_networkErrorDesc;

  public constructor() {
    super();
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

  public showChildren(node: TreeNode) {
    this.loadChildrenOfNode(node);
    super.showChildren(node);
  }

  protected renderNode(node: TreeNode): SVGTemplateResult {
    const showNodeStop = node.stopPageTree && node.depth !== 0
    const onNodeStopClick = (evt: MouseEvent) => document.dispatchEvent(
      new CustomEvent('typo3:pagetree:mountPoint', {detail: {pageId: parseInt(node.identifier, 10)}})
    );

    return svg`
      ${super.renderNode(node)}
      ${showNodeStop ? svg`<text class="node-stop" dx="30" dy="5" @click=${onNodeStopClick}>+</text>` : ''}
    `
  }

  /**
   * Loads child nodes via Ajax (used when expanding a collapsed node)
   */
  protected loadChildrenOfNode(parentNode: TreeNode) {
    if (parentNode.loaded) {
      return;
    }

    this.nodesAddPlaceholder();
    (new AjaxRequest(this.settings.dataUrl + '&pid=' + parentNode.identifier + '&mount=' + parentNode.mountPoint + '&pidDepth=' + parentNode.depth))
      .get({cache: 'no-cache'})
      .then((response: AjaxResponse) => response.resolve())
      .then((json: any) => {
        let nodes = Array.isArray(json) ? json : [];
        // first element is a parent
        nodes.shift();
        const index = this.nodes.indexOf(parentNode) + 1;
        // adding fetched node after parent
        nodes.forEach((node: TreeNode, offset: number) => {
          this.nodes.splice(index + offset, 0, node);
        });

        parentNode.loaded = true;
        this.setParametersNode();
        this.prepareDataForVisibleNodes();
        this.updateVisibleNodes();
        this.nodesRemovePlaceholder();

        this.switchFocusNode(parentNode);
      })
      .catch((error: any) => {
        this.errorNotification(error, false)
        this.nodesRemovePlaceholder();
        throw error;
      });
  }

  protected getTextElementPosition(node: TreeNode): number {
    let position = super.getTextElementPosition(node);
    if (node.stopPageTree && node.depth !== 0) {
      position += 15;
    }
    // @todo: This has been added here previously, but it is redundant with an equivalent addition in SvgTree.ts
    //if (node.locked) {
    //  position += 15;
    //}
    return position;
  }
}
