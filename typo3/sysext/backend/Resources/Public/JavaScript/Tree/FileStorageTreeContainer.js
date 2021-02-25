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
<<<<<<< HEAD
var __decorate=this&&this.__decorate||function(e,t,r,i){var n,s=arguments.length,o=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(s<3?n(o):s>3?n(t,r,o):n(t,r))||o);return s>3&&o&&Object.defineProperty(t,r,o),o},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","lit-element","./FileStorageTree","TYPO3/CMS/Backend/Storage/Persistent","../ContextMenu","./DragDrop","../Modal","../Severity","../Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,r,i,n,s,o,a,d,l,c){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.FileStorageTreeNavigationComponent=t.navigationComponentName=void 0,n=__importDefault(n),c=__importDefault(c),t.navigationComponentName="typo3-backend-navigation-component-filestoragetree";let g=class extends i.FileStorageTree{constructor(){super(),this.actionHandler=new p(this)}updateNodeBgClass(e){return super.updateNodeBgClass.call(this,e).call(this.initializeDragForNode())}nodesUpdate(e){return super.nodesUpdate.call(this,e).call(this.initializeDragForNode())}initializeDragForNode(){return this.actionHandler.connectDragHandler(new f(this,this.actionHandler))}};g=__decorate([r.customElement("typo3-backend-navigation-component-filestorage-tree")],g);let h=class extends r.LitElement{constructor(){super(...arguments),this.refresh=()=>{this.tree.refreshOrFilterTree()},this.selectFirstNode=()=>{const e=this.tree.nodes[0];e&&this.tree.selectNode(e)},this.treeUpdateRequested=e=>{const t=encodeURIComponent(e.detail.payload.identifier);let r=this.tree.nodes.filter(e=>e.identifier===t)[0];r&&0===this.tree.getSelectedNodes().filter(e=>e.identifier===r.identifier).length&&this.tree.selectNode(r)},this.toggleExpandState=e=>{const t=e.detail.node;t&&n.default.set("BackendComponents.States.FileStorageTree.stateHash."+t.stateIdentifier,t.expanded?"1":"0")},this.loadContent=e=>{const t=e.detail.node;if(!(null==t?void 0:t.checked))return;window.fsMod.recentIds.file=t.identifier,window.fsMod.navFrameHighlightedID.file=t.stateIdentifier;const r=-1!==window.currentSubScript.indexOf("?")?"&":"?";TYPO3.Backend.ContentContainer.setUrl(window.currentSubScript+r+"id="+t.identifier)},this.showContextMenu=e=>{const t=e.detail.node;t&&s.show(t.itemType,decodeURIComponent(t.identifier),"tree","","",this.tree.getNodeElement(t))},this.selectActiveNode=e=>{const t=window.fsMod.navFrameHighlightedID.file;let r=e.detail.nodes;e.detail.nodes=r.map(e=>(e.stateIdentifier===t&&(e.checked=!0),e))}}connectedCallback(){super.connectedCallback(),document.addEventListener("typo3:filestoragetree:refresh",this.refresh),document.addEventListener("typo3:filestoragetree:selectFirstNode",this.selectFirstNode),document.addEventListener("typo3:filelist:treeUpdateRequested",this.treeUpdateRequested)}disconnectedCallback(){document.removeEventListener("typo3:filestoragetree:refresh",this.refresh),document.removeEventListener("typo3:filestoragetree:selectFirstNode",this.selectFirstNode),document.removeEventListener("typo3:filelist:treeUpdateRequested",this.treeUpdateRequested),super.disconnectedCallback()}createRenderRoot(){return this}render(){const e={dataUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_data,filterUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,showIcons:!0};return r.html`
=======
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","lit","TYPO3/CMS/Core/lit-helper","./FileStorageTree","TYPO3/CMS/Core/Event/DebounceEvent","./FileStorageTreeActions","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,r,i,s,n,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.FileStorageTreeContainer=void 0,n=__importDefault(n);class o{constructor(e){const t=document.querySelector(e);if(t&&t.childNodes.length>0)return void t.querySelector(".svg-tree").dispatchEvent(new Event("svg-tree:visible"));r.render(o.renderTemplate(),t);const i=t.querySelector(".svg-tree-wrapper");this.tree=new s.FileStorageTree;const n=new a.FileStorageTreeActions(this.tree);this.tree.initialize(i,{dataUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_data,filterUrl:top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,showIcons:!0},n);const c=t.querySelector(".svg-toolbar");new l(i,c),document.addEventListener("typo3:filelist:treeUpdateRequested",e=>{this.tree.selectNodeByIdentifier(e.detail.payload.identifier)})}static renderTemplate(){return r.html`
>>>>>>> 450ddbb155 ([WIP][TASK] Use new `lit` entrypoint module for lit-html/element)
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
<<<<<<< HEAD
    `}firstUpdated(){this.toolbar.tree=this.tree,this.tree.addEventListener("typo3:svg-tree:expand-toggle",this.toggleExpandState),this.tree.addEventListener("typo3:svg-tree:node-selected",this.loadContent),this.tree.addEventListener("typo3:svg-tree:node-context",this.showContextMenu),this.tree.addEventListener("typo3:svg-tree:nodes-prepared",this.selectActiveNode)}};__decorate([r.query(".svg-tree-wrapper")],h.prototype,"tree",void 0),__decorate([r.query("typo3-backend-tree-toolbar")],h.prototype,"toolbar",void 0),h=__decorate([r.customElement(t.navigationComponentName)],h),t.FileStorageTreeNavigationComponent=h;class p extends o.DragDrop{changeNodePosition(e){const t=this.tree.nodes,r=this.tree.settings.nodeDrag.identifier;let i=this.tree.settings.nodeDragPosition,n=e||this.tree.settings.nodeDrag;if(r===n.identifier)return null;if(i===o.DraggablePositionEnum.BEFORE){const r=t.indexOf(e),s=this.setNodePositionAndTarget(r);if(null===s)return null;i=s.position,n=s.target}return{node:this.tree.settings.nodeDrag,identifier:r,target:n,position:i}}setNodePositionAndTarget(e){const t=this.tree.nodes,r=t[e].depth;e>0&&e--;const i=t[e].depth,n=this.tree.nodes[e];if(i===r)return{position:o.DraggablePositionEnum.AFTER,target:n};if(i<r)return{position:o.DraggablePositionEnum.INSIDE,target:n};for(let i=e;i>=0;i--){if(t[i].depth===r)return{position:o.DraggablePositionEnum.AFTER,target:this.tree.nodes[i]};if(t[i].depth<r)return{position:o.DraggablePositionEnum.AFTER,target:t[i]}}return null}changeNodeClasses(e){const t=this.tree.svg.select(".node-over"),r=this.tree.svg.node().parentNode.querySelector(".node-dd");t.size()&&this.tree.isOverSvg&&(this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none"),this.addNodeDdClass(r,"ok-append"),this.tree.settings.nodeDragPosition=o.DraggablePositionEnum.INSIDE)}}class f{constructor(e,t){this.startDrag=!1,this.startPageX=0,this.startPageY=0,this.isDragged=!1,this.tree=e,this.actionHandler=t}dragStart(e){return 0!==e.subject.depth&&(this.startPageX=e.sourceEvent.pageX,this.startPageY=e.sourceEvent.pageY,this.startDrag=!1,!0)}dragDragged(e){let t=e.subject;if(!this.actionHandler.isDragNodeDistanceMore(e,this))return!1;if(this.startDrag=!0,0===t.depth)return!1;this.tree.settings.nodeDrag=t;let r=this.tree.svg.node().querySelector('.node-bg[data-state-id="'+t.stateIdentifier+'"]'),i=this.tree.svg.node().parentNode.querySelector(".node-dd");return this.isDragged||(this.isDragged=!0,this.actionHandler.createDraggable(this.tree.getIconId(t),t.name),null==r||r.classList.add("node-bg--dragging")),this.tree.settings.nodeDragPosition=!1,this.actionHandler.openNodeTimeout(),this.actionHandler.updateDraggablePosition(e),(t.isOver||this.tree.hoveredNode&&-1!==this.tree.hoveredNode.parentsStateIdentifier.indexOf(t.stateIdentifier)||!this.tree.isOverSvg)&&(this.actionHandler.addNodeDdClass(i,"nodrop"),this.tree.isOverSvg||this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none")),!this.tree.hoveredNode||this.isInSameParentNode(t,this.tree.hoveredNode)?(this.actionHandler.addNodeDdClass(i,"nodrop"),this.tree.nodesBgContainer.selectAll(".node-bg__border").style("display","none")):this.actionHandler.changeNodeClasses(e),!0}isInSameParentNode(e,t){return e.parentsStateIdentifier[0]==t.parentsStateIdentifier[0]||e.parentsStateIdentifier[0]==t.stateIdentifier}dragEnd(e){let t=e.subject;if(!this.startDrag||0===t.depth)return!1;let r=this.tree.hoveredNode;if(this.isDragged=!1,this.actionHandler.removeNodeDdClass(),!(t.isOver||r&&-1!==r.parentsStateIdentifier.indexOf(t.stateIdentifier))&&this.tree.settings.canNodeDrag&&this.tree.isOverSvg){let e=this.actionHandler.changeNodePosition(r),t=e.position===o.DraggablePositionEnum.INSIDE?TYPO3.lang["mess.move_into"]:TYPO3.lang["mess.move_after"];t=t.replace("%s",e.node.name).replace("%s",e.target.name),a.confirm(TYPO3.lang.move_folder,t,d.warning,[{text:TYPO3.lang["labels.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:TYPO3.lang["cm.copy"]||"Copy",btnClass:"btn-warning",name:"copy"},{text:TYPO3.lang["labels.move"]||"Move",btnClass:"btn-warning",name:"move"}]).on("button.clicked",t=>{const r=t.target;"move"===r.name?this.sendChangeCommand("move",e):"copy"===r.name&&this.sendChangeCommand("copy",e),a.dismiss()})}return!0}sendChangeCommand(e,t){let r={data:{}};if("copy"===e)r.data.copy=[],r.copy.push({data:decodeURIComponent(t.identifier),target:decodeURIComponent(t.target.identifier)});else{if("move"!==e)return;r.data.move=[],r.data.move.push({data:decodeURIComponent(t.identifier),target:decodeURIComponent(t.target.identifier)})}this.tree.nodesAddPlaceholder(),new c.default(top.TYPO3.settings.ajaxUrls.file_process+"&includeMessages=1").post(r).then(e=>e.resolve()).then(e=>{e&&e.hasErrors?(this.tree.errorNotification(e.messages,!1),this.tree.nodesContainer.selectAll(".node").remove(),this.tree.updateVisibleNodes(),this.tree.nodesRemovePlaceholder()):(e.messages&&e.messages.forEach(e=>{l.showMessage(e.title||"",e.message||"",e.severity)}),this.tree.refreshOrFilterTree())}).catch(e=>{this.tree.errorNotification(e,!0)})}}}));
=======
    `}getName(){return"FileStorageTree"}refresh(){this.tree.refreshOrFilterTree()}select(e){this.tree.selectNode(e)}apply(e){e(this.tree)}}t.FileStorageTreeContainer=o;class l{constructor(e,t){this.settings={toolbarSelector:"tree-toolbar",searchInput:".search-input",filterTimeout:450},this.treeContainer=e,this.targetEl=t,this.treeContainer.dataset.svgTreeInitialized&&"object"==typeof this.treeContainer.svgtree?this.render():this.treeContainer.addEventListener("svg-tree:initialized",this.render.bind(this))}refreshTree(){this.tree.refreshOrFilterTree()}search(e){this.tree.searchQuery=e.value.trim(),this.tree.refreshOrFilterTree(),this.tree.prepareDataForVisibleNodes(),this.tree.update()}render(){this.tree=this.treeContainer.svgtree,Object.assign(this.settings,this.tree.settings),r.render(this.renderTemplate(),this.targetEl);const e=this.targetEl.querySelector(this.settings.searchInput);e&&(new n.default("input",e=>{this.search(e.target)},this.settings.filterTimeout).bindTo(e),e.focus(),e.clearable({onClear:()=>{this.tree.resetFilter(),this.tree.prepareDataForVisibleNodes(),this.tree.update()}}))}renderTemplate(){return r.html`<div class="${this.settings.toolbarSelector}">
        <div class="svg-toolbar__menu">
          <div class="svg-toolbar__search">
            <input type="text" class="form-control form-control-sm search-input" placeholder="${i.lll("tree.searchTermInfo")}">
          </div>
          <button class="btn btn-default btn-borderless btn-sm" @click="${()=>this.refreshTree()}" data-tree-icon="actions-refresh" title="${i.lll("labels.refresh")}">
            <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
          </button>
        </div>
      </div>`}}}));
>>>>>>> 450ddbb155 ([WIP][TASK] Use new `lit` entrypoint module for lit-html/element)
