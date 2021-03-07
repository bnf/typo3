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
var __decorate=this&&this.__decorate||function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","lit-element","lit-html","TYPO3/CMS/Core/lit-helper","./FileStorageTree","TYPO3/CMS/Core/Event/DebounceEvent","./FileStorageTreeActions","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,i,r,o,n,l,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.FileStorageTreeContainer=t.componentName=void 0,l=__importDefault(l),t.componentName="typo3-backend-file-storage-tree";let a=class extends i.LitElement{render(){return i.html`
      <div id="typo3-filestoragetree" class="svg-tree">
        <div>
          <div id="filestoragetree-toolbar" class="svg-toolbar"></div>
          <div class="navigation-tree-container">
            <div id="typo3-filestoragetree-tree">
              <div class="node-loader">
                <typo3-backend-icon identifier="spinner-circle-light" size="small"></typo3-backend-icon>
              </div>
              <slot></slot>
            </div>
          </div>
        </div>
        <div class="svg-tree-loader">
          <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
        </div>
      </div>
    `}firstUpdated(){const e=document.createElement("div");e.classList.add("svg-tree-wrapper"),this.appendChild(e),this.tree=new n.FileStorageTree;const t=new s.FileStorageTreeActions(this.tree);this.tree.initialize(e,{dataUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_data,filterUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,showIcons:!0},t),e.dispatchEvent(new Event("svg-tree:visible")),document.addEventListener("typo3:filelist:treeUpdateRequested",e=>{this.tree.selectNodeByIdentifier(e.detail.payload.identifier)})}getName(){return"FileStorageTree"}refresh(){this.tree.refreshOrFilterTree()}select(e){this.tree.selectNode(e)}apply(e){e(this.tree)}};a=__decorate([i.customElement(t.componentName)],a),t.FileStorageTreeContainer=a}));