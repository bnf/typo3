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
var __decorate=this&&this.__decorate||function(e,t,r,o){var i,n=arguments.length,s=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(n<3?i(s):n>3?i(t,r,s):i(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};import{html,LitElement}from"lit";import{customElement,query}from"lit/decorators";import{FileStorageTree}from"./FileStorageTree";import"TYPO3/CMS/Backend/Element/IconElement";import Persistent from"TYPO3/CMS/Backend/Storage/Persistent";import ContextMenu from"../ContextMenu";import{DragDrop,DraggablePositionEnum}from"./DragDrop";import Modal from"../Modal";import Severity from"../Severity";import Notification from"../Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import{ModuleStateStorage}from"../Storage/ModuleStateStorage";import{getRecordFromName}from"../Module";export const navigationComponentName="typo3-backend-navigation-component-filestoragetree";let EditableFileStorageTree=class extends FileStorageTree{constructor(){super(),this.actionHandler=new FileStorageTreeActions(this)}updateNodeBgClass(e){return super.updateNodeBgClass.call(this,e).call(this.initializeDragForNode())}nodesUpdate(e){return super.nodesUpdate.call(this,e).call(this.initializeDragForNode())}initializeDragForNode(){return this.actionHandler.connectDragHandler(new FileStorageTreeNodeDragHandler(this,this.actionHandler))}};EditableFileStorageTree=__decorate([customElement("typo3-backend-navigation-component-filestorage-tree")],EditableFileStorageTree);let FileStorageTreeNavigationComponent=class extends LitElement{constructor(){super(...arguments),this.refresh=()=>{this.tree.refreshOrFilterTree()},this.selectFirstNode=()=>{const e=this.tree.nodes[0];e&&this.tree.selectNode(e,!0)},this.treeUpdateRequested=e=>{const t=encodeURIComponent(e.detail.payload.identifier);let r=this.tree.nodes.filter(e=>e.identifier===t)[0];r&&0===this.tree.getSelectedNodes().filter(e=>e.identifier===r.identifier).length&&this.tree.selectNode(r,!1)},this.toggleExpandState=e=>{const t=e.detail.node;t&&Persistent.set("BackendComponents.States.FileStorageTree.stateHash."+t.stateIdentifier,t.expanded?"1":"0")},this.loadContent=e=>{const t=e.detail.node;if(!(null==t?void 0:t.checked))return;if(ModuleStateStorage.update("file",t.identifier,!0),!1===e.detail.propagate)return;const r=top.TYPO3.ModuleMenu.App;let o=getRecordFromName(r.getCurrentModule()).link;o+=o.includes("?")?"&":"?",top.TYPO3.Backend.ContentContainer.setUrl(o+"id="+t.identifier)},this.showContextMenu=e=>{const t=e.detail.node;t&&ContextMenu.show(t.itemType,decodeURIComponent(t.identifier),"tree","","",this.tree.getNodeElement(t))},this.selectActiveNode=e=>{const t=ModuleStateStorage.current("file").selection;let r=e.detail.nodes;e.detail.nodes=r.map(e=>(e.identifier===t&&(e.checked=!0),e))}}connectedCallback(){super.connectedCallback(),document.addEventListener("typo3:filestoragetree:refresh",this.refresh),document.addEventListener("typo3:filestoragetree:selectFirstNode",this.selectFirstNode),document.addEventListener("typo3:filelist:treeUpdateRequested",this.treeUpdateRequested)}disconnectedCallback(){document.removeEventListener("typo3:filestoragetree:refresh",this.refresh),document.removeEventListener("typo3:filestoragetree:selectFirstNode",this.selectFirstNode),document.removeEventListener("typo3:filelist:treeUpdateRequested",this.treeUpdateRequested),super.disconnectedCallback()}createRenderRoot(){return this}render(){const e={dataUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_data,filterUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,showIcons:!0};return html`
      <div id="typo3-filestoragetree" class="svg-tree">
        <div>
          <typo3-backend-tree-toolbar .tree="${this.tree}" id="filestoragetree-toolbar" class="svg-toolbar"></typo3-backend-tree-toolbar>
          <div class="navigation-tree-container">
            <typo3-backend-navigation-component-filestorage-tree id="typo3-filestoragetree-tree" class="svg-tree-wrapper" .setup=${e}></typo3-backend-navigation-component-filestorage-tree>
          </div>
        </div>
        <div class="svg-tree-loader">
          <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
        </div>
      </div>
    `}firstUpdated(){this.toolbar.tree=this.tree,this.tree.addEventListener("typo3:svg-tree:expand-toggle",this.toggleExpandState),this.tree.addEventListener("typo3:svg-tree:node-selected",this.loadContent),this.tree.addEventListener("typo3:svg-tree:node-context",this.showContextMenu),this.tree.addEventListener("typo3:svg-tree:nodes-prepared",this.selectActiveNode)}};__decorate([query(".svg-tree-wrapper")],FileStorageTreeNavigationComponent.prototype,"tree",void 0),__decorate([query("typo3-backend-tree-toolbar")],FileStorageTreeNavigationComponent.prototype,"toolbar",void 0),FileStorageTreeNavigationComponent=__decorate([customElement(navigationComponentName)],FileStorageTreeNavigationComponent);export{FileStorageTreeNavigationComponent};class FileStorageTreeActions extends DragDrop{changeNodePosition(e){const t=this.tree.nodes,r=this.tree.settings.nodeDrag.identifier;let o=this.tree.settings.nodeDragPosition,i=e||this.tree.settings.nodeDrag;if(r===i.identifier)return null;if(o===DraggablePositionEnum.BEFORE){const r=t.indexOf(e),n=this.setNodePositionAndTarget(r);if(null===n)return null;o=n.position,i=n.target}return{node:this.tree.settings.nodeDrag,identifier:r,target:i,position:o}}setNodePositionAndTarget(e){const t=this.tree.nodes,r=t[e].depth;e>0&&e--;const o=t[e].depth,i=this.tree.nodes[e];if(o===r)return{position:DraggablePositionEnum.AFTER,target:i};if(o<r)return{position:DraggablePositionEnum.INSIDE,target:i};for(let o=e;o>=0;o--){if(t[o].depth===r)return{position:DraggablePositionEnum.AFTER,target:this.tree.nodes[o]};if(t[o].depth<r)return{position:DraggablePositionEnum.AFTER,target:t[o]}}return null}changeNodeClasses(e){const t=this.tree.svg.select(".node-over"),r=this.tree.svg.node().parentNode.querySelector(".node-dd");t.size()&&this.tree.isOverSvg&&(this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none"),this.addNodeDdClass(r,"ok-append"),this.tree.settings.nodeDragPosition=DraggablePositionEnum.INSIDE)}}class FileStorageTreeNodeDragHandler{constructor(e,t){this.startDrag=!1,this.startPageX=0,this.startPageY=0,this.isDragged=!1,this.tree=e,this.actionHandler=t}dragStart(e){return 0!==e.subject.depth&&(this.startPageX=e.sourceEvent.pageX,this.startPageY=e.sourceEvent.pageY,this.startDrag=!1,!0)}dragDragged(e){let t=e.subject;if(!this.actionHandler.isDragNodeDistanceMore(e,this))return!1;if(this.startDrag=!0,0===t.depth)return!1;this.tree.settings.nodeDrag=t;let r=this.tree.svg.node().querySelector('.node-bg[data-state-id="'+t.stateIdentifier+'"]'),o=this.tree.svg.node().parentNode.querySelector(".node-dd");return this.isDragged||(this.isDragged=!0,this.actionHandler.createDraggable(this.tree.getIconId(t),t.name),null==r||r.classList.add("node-bg--dragging")),this.tree.settings.nodeDragPosition=!1,this.actionHandler.openNodeTimeout(),this.actionHandler.updateDraggablePosition(e),(t.isOver||this.tree.hoveredNode&&-1!==this.tree.hoveredNode.parentsStateIdentifier.indexOf(t.stateIdentifier)||!this.tree.isOverSvg)&&(this.actionHandler.addNodeDdClass(o,"nodrop"),this.tree.isOverSvg||this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none")),!this.tree.hoveredNode||this.isInSameParentNode(t,this.tree.hoveredNode)?(this.actionHandler.addNodeDdClass(o,"nodrop"),this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none")):this.actionHandler.changeNodeClasses(e),!0}isInSameParentNode(e,t){return e.stateIdentifier==t.stateIdentifier||e.parentsStateIdentifier[0]==t.stateIdentifier||t.parentsStateIdentifier.includes(e.stateIdentifier)}dragEnd(e){let t=e.subject;if(!this.startDrag||0===t.depth)return!1;let r=this.tree.hoveredNode;if(this.isDragged=!1,this.actionHandler.removeNodeDdClass(),!(t.isOver||r&&-1!==r.parentsStateIdentifier.indexOf(t.stateIdentifier))&&this.tree.settings.canNodeDrag&&this.tree.isOverSvg){let e=this.actionHandler.changeNodePosition(r),t=e.position===DraggablePositionEnum.INSIDE?TYPO3.lang["mess.move_into"]:TYPO3.lang["mess.move_after"];t=t.replace("%s",e.node.name).replace("%s",e.target.name),Modal.confirm(TYPO3.lang.move_folder,t,Severity.warning,[{text:TYPO3.lang["labels.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:TYPO3.lang["cm.copy"]||"Copy",btnClass:"btn-warning",name:"copy"},{text:TYPO3.lang["labels.move"]||"Move",btnClass:"btn-warning",name:"move"}]).on("button.clicked",t=>{const r=t.target;"move"===r.name?this.sendChangeCommand("move",e):"copy"===r.name&&this.sendChangeCommand("copy",e),Modal.dismiss()})}return!0}sendChangeCommand(e,t){let r={data:{}};if("copy"===e)r.data.copy=[],r.copy.push({data:decodeURIComponent(t.identifier),target:decodeURIComponent(t.target.identifier)});else{if("move"!==e)return;r.data.move=[],r.data.move.push({data:decodeURIComponent(t.identifier),target:decodeURIComponent(t.target.identifier)})}this.tree.nodesAddPlaceholder(),new AjaxRequest(top.TYPO3.settings.ajaxUrls.file_process+"&includeMessages=1").post(r).then(e=>e.resolve()).then(e=>{e&&e.hasErrors?(this.tree.errorNotification(e.messages,!1),this.tree.nodesContainer.selectAll(".node").remove(),this.tree.updateVisibleNodes(),this.tree.nodesRemovePlaceholder()):(e.messages&&e.messages.forEach(e=>{Notification.showMessage(e.title||"",e.message||"",e.severity)}),this.tree.refreshOrFilterTree())}).catch(e=>{this.tree.errorNotification(e,!0)})}}