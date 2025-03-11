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
var e=function(e,t,i,o){var s,r=arguments.length,n=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,o)
else for(var d=e.length-1;d>=0;d--)(s=e[d])&&(n=(r<3?s(n):r>3?s(t,i,n):s(t,i))||n)
return r>3&&n&&Object.defineProperty(t,i,n),n}
import{html as t,LitElement as i,nothing as o}from"lit"
import{property as s,state as r,query as n}from"lit/decorators.js"
import{repeat as d}from"lit/directives/repeat.js"
import{styleMap as a}from"lit/directives/style-map.js"
import{ifDefined as l}from"lit/directives/if-defined.js"
import{TreeNodeCommandEnum as h,TreeNodePositionEnum as c}from"@typo3/backend/tree/tree-node.js"
import g from"@typo3/core/ajax/ajax-request.js"
import p from"@typo3/backend/notification.js"
import{KeyTypesEnum as u}from"@typo3/backend/enum/key-types.js"
import"@typo3/backend/element/icon-element.js"
import N from"@typo3/backend/storage/client.js"
import{DataTransferTypes as f}from"@typo3/backend/enum/data-transfer-types.js"
import m from"@typo3/backend/severity.js"
export class Tree extends i{constructor(){super(...arguments),this.setup=null,this.settings={showIcons:!1,width:300,dataUrl:"",filterUrl:"",defaultProperties:{},expandUpToLevel:null,actions:[]},this.nodes=[],this.currentScrollPosition=0,this.currentVisibleHeight=0,this.searchTerm=null,this.loading=!1,this.hoveredNode=null,this.nodeDragAllowed=!1,this.isOverRoot=!1,this.nodeDragPosition=null,this.nodeDragMode=null,this.draggingNode=null,this.nodeHeight=32,this.indentWidth=20,this.displayNodes=[],this.focusedNode=null,this.lastFocusedNode=null,this.editingNode=null,this.openNodeTimeout={targetNode:null,timeout:null},this.unfilteredNodes="",this.muteErrorNotifications=!1,this.networkErrorTitle=top.TYPO3.lang.tree_networkError,this.networkErrorMessage=top.TYPO3.lang.tree_networkErrorDescription,this.allowNodeEdit=!1,this.allowNodeDrag=!1,this.allowNodeSorting=!1,this.__loadPromise=new Promise((e=>this.__loadFinished=e))}get loadComplete(){return this.__loadPromise}getNodeFromElement(e){return null!==e&&"treeId"in e.dataset?this.getNodeByTreeIdentifier(e.dataset.treeId):null}getElementFromNode(e){return this.querySelector('[data-tree-id="'+this.getNodeTreeIdentifier(e)+'"]')}hideChildren(e){e.__expanded=!1,this.saveNodeStatus(e),this.dispatchEvent(new CustomEvent("typo3:tree:expand-toggle",{detail:{node:e}}))}async showChildren(e){e.__expanded=!0,await this.loadChildren(e),this.saveNodeStatus(e),this.dispatchEvent(new CustomEvent("typo3:tree:expand-toggle",{detail:{node:e}}))}getDataUrl(parentNode=null){return null===parentNode?this.settings.dataUrl:this.settings.dataUrl+"&parent="+parentNode.identifier+"&depth="+parentNode.depth}getFilterUrl(){return this.settings.filterUrl+"&q="+this.searchTerm}async loadData(){this.loading=!0,this.nodes=this.prepareNodes(await this.fetchData()),this.__loadFinished(),this.__loadPromise=new Promise((e=>this.__loadFinished=e)),this.loading=!1}async fetchData(parentNode=null){try{const e=await new g(this.getDataUrl(parentNode)).get({cache:"no-cache"})
let t=await e.resolve()
if(!Array.isArray(t))return[]
return null!==parentNode&&(t=t.filter((e=>e.identifier!==parentNode.identifier))).unshift(parentNode),t=this.enhanceNodes(t),null!==parentNode&&t.shift(),(await Promise.all(t.map((async e=>{const i=e.__parents.join("_"),o=t.find((e=>e.__treeIdentifier===i))||null,s=null===o||o.__expanded
if(!e.loaded&&e.hasChildren&&e.__expanded&&s){const r=await this.fetchData(e)
return e.loaded=!0,[e,...r]}return[e]})))).flat()}catch(e){return this.errorNotification(e),[]}}async loadChildren(e){try{if(e.loaded)return void await Promise.all(this.nodes.filter((t=>t.__parents.join("_")===e.__treeIdentifier&&!t.loaded&&t.hasChildren&&t.__expanded)).map((e=>this.loadChildren(e))))
e.__loading=!0
const t=this.prepareNodes(await this.fetchData(e)),i=this.nodes.indexOf(e)+1
let o=0
for(let s=i;s<this.nodes.length&&!(this.nodes[s].depth<=e.depth);++s)o++
this.nodes.splice(i,o,...t),e.__loading=!1,e.loaded=!0}catch(t){throw this.errorNotification(t),e.__loading=!1,t}}getIdentifier(){return this.id??this.setup.id}getLocalStorageIdentifier(){return"tree-state-"+this.getIdentifier()}getNodeStatus(e){return(JSON.parse(N.get(this.getLocalStorageIdentifier()))??{})[e.__treeIdentifier]??{expanded:!1}}saveNodeStatus(e){const t=JSON.parse(N.get(this.getLocalStorageIdentifier()))??{}
t[e.__treeIdentifier]={expanded:e.__expanded},N.set(this.getLocalStorageIdentifier(),JSON.stringify(t))}refreshOrFilterTree(){""!==this.searchTerm?this.filter(this.searchTerm):this.loadData()}selectFirstNode(){const e=this.getFirstNode()
this.selectNode(e,!0),this.focusNode(e)}selectNode(e,propagate=!0){this.isNodeSelectable(e)&&(this.resetSelectedNodes(),e.checked=!0,this.dispatchEvent(new CustomEvent("typo3:tree:node-selected",{detail:{node:e,propagate}})))}async focusNode(e){this.lastFocusedNode=this.focusedNode,this.focusedNode=e,this.requestUpdate()
const t=this.getElementFromNode(this.focusedNode)
t?t.focus():this.updateComplete.then((()=>{this.getElementFromNode(this.focusedNode)?.focus()}))}async editNode(e){this.isNodeEditable(e)&&(this.editingNode=e,this.requestUpdate(),this.updateComplete.then((()=>{const e=this.getElementFromNode(this.editingNode)?.querySelector(".node-edit")
e&&(e.focus(),e.select())})))}async deleteNode(e){e.deletable?this.handleNodeDelete(e):console.error("The Node cannot be deleted.")}async moveNode(e,t,i){this.handleNodeMove(e,t,i)}async addNode(e,t,i){let o=this.nodes.indexOf(t)
const s=i===c.INSIDE?t:this.getParentNode(t),r=this.enhanceNodes([s,{...e,depth:s?s.depth+1:0}]).pop()
s&&(s.hasChildren&&!s.__expanded&&await this.showChildren(s),s.hasChildren||(s.hasChildren=!0,s.__expanded=!0)),i!==c.INSIDE&&i!==c.AFTER||o++,this.nodes.splice(o,0,r),this.handleNodeAdd(r,t,i)}async removeNode(e){const t=this.nodes.indexOf(e),i=this.getParentNode(e)
t>-1&&this.nodes.splice(t,1),this.requestUpdate(),this.updateComplete.then((()=>{i.__expanded&&i.hasChildren&&0===this.getNodeChildren(i).length&&(i.hasChildren=!1,i.__expanded=!1)}))}filter(e){"string"==typeof e&&(this.searchTerm=e),this.searchTerm&&this.settings.filterUrl?(this.loading=!0,new g(this.getFilterUrl()).get({cache:"no-cache"}).then((e=>e.resolve())).then((e=>{const t=Array.isArray(e)?e:[]
t.length>0&&(""===this.unfilteredNodes&&(this.unfilteredNodes=JSON.stringify(this.nodes)),this.nodes=this.enhanceNodes(t))})).catch((e=>{throw this.errorNotification(e),e})).then((()=>{this.loading=!1}))):(this.resetFilter(),this.loading=!1)}resetFilter(){if(this.searchTerm="",this.unfilteredNodes.length>0){const e=this.getSelectedNodes()[0]
if(void 0===e)return void this.loadData()
this.nodes=this.enhanceNodes(JSON.parse(this.unfilteredNodes)),this.unfilteredNodes=""
const t=this.getNodeByTreeIdentifier(e.__treeIdentifier)
t?this.selectNode(t,!1):this.loadData()}else this.loadData()}errorNotification(error=null){if(!this.muteErrorNotifications)if(Array.isArray(error))error.forEach((e=>{p.error(e.title,e.message)}))
else{let e=this.networkErrorTitle
error&&error.target&&(error.target.status||error.target.statusText)&&(e+=" - "+(error.target.status||"")+" "+(error.target.statusText||"")),p.error(e,this.networkErrorMessage)}}getSelectedNodes(){return this.nodes.filter((e=>e.checked))}getNodeByTreeIdentifier(e){return this.nodes.find((t=>t.__treeIdentifier===e))}getNodeDragStatusIcon(){return this.nodeDragMode===h.DELETE?"actions-delete":this.nodeDragMode===h.NEW?"actions-add":this.nodeDragPosition===c.BEFORE?"apps-pagetree-drag-move-above":this.nodeDragPosition===c.INSIDE?"apps-pagetree-drag-move-into":this.nodeDragPosition===c.AFTER?"apps-pagetree-drag-move-below":"actions-ban"}async expandParents(e){for(const t of e){const i=this.nodes.find((e=>e.identifier===t.toString()))
if(!i)return
i.__expanded||await this.showChildren(i)}}async expandNodeParents(e){await this.expandParents(e.__parents)}prepareNodes(e){const t=new CustomEvent("typo3:tree:nodes-prepared",{detail:{nodes:e},bubbles:!1})
return this.dispatchEvent(t),t.detail.nodes}enhanceNodes(e){const t=e.reduce(((e,t)=>{if(!0===t.__processed)return[...e,t];(t=Object.assign({},this.settings.defaultProperties,t)).__parents=[]
const i=t.depth>0?e.findLast((e=>e.depth<t.depth)):null
i&&(t.__parents=[...i.__parents,i.identifier]),t.__treeIdentifier=t.identifier,t.__loading=!1,t.__treeParents=[],i&&(t.__treeIdentifier=i.__treeIdentifier+"_"+t.__treeIdentifier,t.__treeParents=[...i.__treeParents,i.__treeIdentifier]),this.searchTerm?t.__expanded=t.loaded&&t.hasChildren:t.hasChildren?t.__expanded=null!==this.settings.expandUpToLevel?t.depth<this.settings.expandUpToLevel:Boolean(this.getNodeStatus(t).expanded):t.__expanded=!1,t.__processed=!0
const o=this
return[...e,new Proxy(t,{set:(e,t,i)=>(e[t]!==i&&(e[t]=i,o.requestUpdate()),!0)})]}),[])
return 1===t.filter((e=>0===e.depth)).length&&(t[0].__expanded=!0),t}createRenderRoot(){return this}render(){const e=this.loading?t`<div class="nodes-loader"><div class="nodes-loader-inner"><typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon></div></div>`:o
return t`<div class="nodes-container">${e}<div class="nodes-root" @scroll="${e=>{this.currentScrollPosition=e.currentTarget.scrollTop}}" @mouseover="${()=>this.isOverRoot=!0}" @mouseout="${()=>this.isOverRoot=!1}" @keydown="${e=>this.handleKeyboardInteraction(e)}">${this.renderVisibleNodes()}</div></div>`}renderVisibleNodes(){const e=[]
this.nodes.forEach((t=>{!1===t.__expanded&&e.push(this.getNodeTreeIdentifier(t))})),this.displayNodes=this.nodes.filter((t=>!0!==t.__hidden&&!t.__treeParents.some((t=>Boolean(-1!==e.indexOf(t)))))),this.displayNodes.forEach(((e,t)=>{e.__x=e.depth*this.indentWidth,e.__y=t*this.nodeHeight}))
const i=Math.ceil(this.currentVisibleHeight/this.nodeHeight),s=Math.floor(this.currentScrollPosition/this.nodeHeight),r=this.displayNodes.filter(((e,t)=>this.getFirstNode()===e||(this.focusedNode===e||(this.lastFocusedNode===e||t+2>=s&&t-2<s+i))))
return t`<div class="nodes-list" role="tree" style="${a({height:this.displayNodes.length*this.nodeHeight+"px"})}">${d(r,(e=>this.getNodeTreeIdentifier(e)),(e=>t`<div class="${this.getNodeClasses(e).join(" ")}" role="treeitem" draggable="true" title="${this.getNodeTitle(e)}" aria-owns="${l(e.hasChildren?"group-identifier-"+this.getNodeIdentifier(e):null)}" aria-expanded="${l(e.hasChildren?e.__expanded?"1":"0":null)}" aria-level="${this.getNodeDepth(e)+1}" aria-setsize="${this.getNodeSetsize(e)}" aria-posinset="${this.getNodePositionInSet(e)}" data-id="${this.getNodeIdentifier(e)}" data-tree-id="${this.getNodeTreeIdentifier(e)}" style="top:${e.__y+"px"};height:${this.nodeHeight+"px"}" tabindex="${this.getNodeTabindex(e)}" @dragover="${e=>{this.handleNodeDragOver(e)}}" @dragstart="${t=>{this.handleNodeDragStart(t,e)}}" @dragleave="${e=>{this.handleNodeDragLeave(e)}}" @dragend="${e=>{this.handleNodeDragEnd(e)}}" @drop="${e=>{this.handleNodeDrop(e)}}" @click="${t=>{this.handleNodeClick(t,e)}}" @dblclick="${t=>{this.handleNodeDoubleClick(t,e)}}" @focusin="${()=>{this.focusedNode=e}}" @focusout="${()=>{this.focusedNode===e&&(this.lastFocusedNode=e,this.focusedNode=null)}}" @contextmenu="${t=>{t.preventDefault(),t.stopPropagation(),this.dispatchEvent(new CustomEvent("typo3:tree:node-context",{detail:{node:e,originalEvent:t}}))}}">${this.createNodeLabel(e)} ${this.createNodeGuides(e)} ${this.createNodeLoader(e)||this.createNodeToggle(e)||o} ${this.createNodeContent(e)} ${this.createNodeStatusInformation(e)} ${this.createNodeDeleteDropZone(e)}</div>`))}</div>`}async firstUpdated(){new ResizeObserver((e=>{for(const t of e)t.target===this.root&&(this.currentVisibleHeight=t.target.getBoundingClientRect().height)})).observe(this.root),Object.assign(this.settings,this.setup||{}),this.registerUnloadHandler(),await this.loadData(),this.dispatchEvent(new Event("tree:initialized"))}resetSelectedNodes(){this.getSelectedNodes().forEach((e=>{!0===e.checked&&(e.checked=!1)}))}isNodeSelectable(e){return!0}isNodeEditable(e){return e.editable&&this.allowNodeEdit}handleNodeClick(e,t){1===e.detail&&(e.preventDefault(),e.stopPropagation(),this.editingNode!==t&&this.selectNode(t,!0))}handleNodeDoubleClick(e,t){e.preventDefault(),e.stopPropagation(),this.editingNode!==t&&this.editNode(t)}cleanDrag(){this.querySelectorAll(".node").forEach((function(e){e.classList.remove("node-dragging-before"),e.classList.remove("node-dragging-after"),e.classList.remove("node-hover")}))}getNodeFromDragEvent(e){const t=e.target
return this.getNodeFromElement(t.closest("[data-tree-id]"))}getTooltipDescription(e){return"ID: "+e.identifier}handleNodeDragStart(e,t){if(!1===this.allowNodeDrag||0===t.depth)return void e.preventDefault()
this.draggingNode=t,this.requestUpdate(),e.dataTransfer.clearData()
const i={statusIconIdentifier:this.getNodeDragStatusIcon(),tooltipIconIdentifier:t.icon,tooltipLabel:t.name,tooltipDescription:this.getTooltipDescription(t)}
e.dataTransfer.setData(f.dragTooltip,JSON.stringify(i)),this.createDataTransferItemsFromNode(t).forEach((({data,type})=>e.dataTransfer.items.add(data,type))),e.dataTransfer.effectAllowed="move"}handleNodeDragOver(e){if(!e.dataTransfer.types.includes(f.treenode)&&!e.dataTransfer.types.includes(f.newTreenode))return!1
const t=e.target,i=this.getNodeFromDragEvent(e)
if(null===i)return!1
if(null===this.draggingNode)return!1
this.cleanDrag(),this.refreshDragToolTip(),this.nodeDragMode=null,this.nodeDragPosition=null
const o=this.getElementFromNode(i)
if(o.classList.add("node-hover"),i.hasChildren&&!i.__expanded?this.openNodeTimeout.targetNode!=i&&(this.openNodeTimeout.targetNode=i,clearTimeout(this.openNodeTimeout.timeout),this.openNodeTimeout.timeout=setTimeout((()=>{this.showChildren(this.openNodeTimeout.targetNode),this.openNodeTimeout.targetNode=null,this.openNodeTimeout.timeout=null}),1e3)):(clearTimeout(this.openNodeTimeout.timeout),this.openNodeTimeout.targetNode=null,this.openNodeTimeout.timeout=null),this.draggingNode==i){return"delete"===t.dataset.treeDropzone?(this.nodeDragMode=h.DELETE,e.preventDefault(),this.refreshDragToolTip(),!0):(this.refreshDragToolTip(),!0)}if(i.__parents.includes(this.draggingNode.identifier))return this.refreshDragToolTip(),!0
if(this.nodeDragMode=h.MOVE,e.dataTransfer.types.includes(f.newTreenode)&&(this.nodeDragMode=h.NEW),this.nodeDragPosition=c.INSIDE,0===i.depth||!1===this.allowNodeSorting)return this.refreshDragToolTip(),e.preventDefault(),!0
const s=this.getElementFromNode(i).getBoundingClientRect(),r=e.clientY-s.y
return r<6?(this.nodeDragPosition=c.BEFORE,o.classList.add("node-dragging-before")):this.nodeHeight-r<6&&!1===i.hasChildren&&!1===i.__expanded&&(this.nodeDragPosition=c.AFTER,o.classList.add("node-dragging-after")),this.refreshDragToolTip(),e.preventDefault(),!0}handleNodeDragLeave(e){null!==this.draggingNode&&this.cleanDrag()}handleNodeDragEnd(e){this.cleanDrag(),this.draggingNode=null,this.requestUpdate()}handleNodeDrop(e){if(this.cleanDrag(),e.dataTransfer.types.includes(f.treenode)){e.preventDefault()
const t=e.dataTransfer.getData(f.treenode),i=this.getNodeByTreeIdentifier(t)
return this.nodeDragMode===h.DELETE&&this.deleteNode(i),null!==(o=this.getNodeFromDragEvent(e))&&(this.nodeDragMode===h.MOVE&&this.moveNode(i,o,this.nodeDragPosition),this.nodeDragMode=null,this.nodeDragPosition=null,!0)}if(e.dataTransfer.types.includes(f.newTreenode)){const o
if(e.preventDefault(),null===(o=this.getNodeFromDragEvent(e)))return!1
const s=e.dataTransfer.getData(f.newTreenode)
return this.addNode(JSON.parse(s),o,this.nodeDragPosition),this.nodeDragMode=null,this.nodeDragPosition=null,!0}return!1}refreshDragToolTip(){top.document.dispatchEvent(new CustomEvent("typo3:drag-tooltip:metadata-update",{detail:{statusIconIdentifier:this.getNodeDragStatusIcon()}}))}createNodeLabel(e){const i=this.getNodeLabels(e)
if(0===i.length)return t`${o}`
const s={backgroundColor:i[0].color}
return t`<span class="node-label" style="${a(s)}"></span>`}createNodeGuides(e){const i=e.__treeParents.map((e=>{const i=this.getNodeByTreeIdentifier(e)
let o="none"
return this.getNodeSetsize(i)!==this.getNodePositionInSet(i)&&(o="line"),t`<div class="node-treeline node-treeline--${o}" data-origin="${this.getNodeTreeIdentifier(i)}" data-nodesize="${this.getNodeSetsize(i)}" data-position="${this.getNodePositionInSet(i)}"></div>`}))
return this.getNodeSetsize(e)===this.getNodePositionInSet(e)?i.push(t`<div class="node-treeline node-treeline--last" data-origin="${this.getNodeTreeIdentifier(e)}"></div>`):i.push(t`<div class="node-treeline node-treeline--connect" data-origin="${this.getNodeTreeIdentifier(e)}"></div>`),t`<div class="node-treelines">${i}</div>`}createNodeLoader(e){return!0===e.__loading?t`<span class="node-loading"><typo3-backend-icon identifier="spinner-circle" size="small"></typo3-backend-icon></span>`:null}createNodeToggle(e){const i=this.isRTL()?"actions-chevron-left":"actions-chevron-right"
return!0===e.hasChildren?t`<span class="node-toggle" @click="${t=>{t.preventDefault(),t.stopImmediatePropagation(),this.handleNodeToggle(e)}}"><typo3-backend-icon identifier="${e.__expanded?"actions-chevron-down":i}" size="small"></typo3-backend-icon></span>`:null}createNodeContent(e){return t`<div class="node-content">${this.createNodeContentIcon(e)} ${this.editingNode===e?this.createNodeForm(e):this.createNodeContentLabel(e)} ${this.createNodeContentAction(e)}</div>`}createNodeContentIcon(e){return this.settings.showIcons?t`<span class="node-icon" @click="${t=>{t.preventDefault(),t.stopImmediatePropagation(),this.dispatchEvent(new CustomEvent("typo3:tree:node-context",{detail:{node:e,originalEvent:t}}))}}" @dblclick="${e=>{e.preventDefault(),e.stopImmediatePropagation()}}"><typo3-backend-icon identifier="${e.icon}" overlay="${e.overlayIcon}" size="small"></typo3-backend-icon></span>`:t`${o}`}createNodeContentLabel(e){let i=(e.prefix||"")+e.name+(e.suffix||"")
const s=document.createElement("div")
if(s.textContent=i,i=s.innerHTML,this.searchTerm){const r=new RegExp(this.searchTerm.replace(/[/\-\\^$*+?.()|[\]{}]/g,"\\$&"),"gi")
i=i.replace(r,'<span class="node-highlight-text">$&</span>')}return t`<div class="node-contentlabel"><div class="node-name" .innerHTML="${i}"></div>${e.note?t`<div class="node-note">${e.note}</div>`:o}</div>`}createNodeStatusInformation(e){const i=this.getNodeStatusInformation(e)
if(0===i.length)return t`${o}`
const s=i[0],r=m.getCssClass(s.severity),n=""!==s.icon?s.icon:"actions-dot",d=""!==s.overlayIcon?s.overlayIcon:void 0
return t`<span class="node-information"><typo3-backend-icon class="text-${r}" identifier="${n}" overlay="${l(d)}" size="small"></typo3-backend-icon></span>`}createNodeDeleteDropZone(e){return this.draggingNode===e&&e.deletable?t`<div class="node-dropzone-delete" data-tree-dropzone="delete"><typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>${TYPO3.lang.deleteItem}</div>`:t`${o}`}createNodeForm(e){const i=e.identifier.startsWith("NEW")?h.NEW:h.EDIT
return t`<input class="node-edit" @click="${e=>{e.stopImmediatePropagation()}}" @blur="${t=>{if(null!==this.editingNode){this.editingNode=null
const o=t.target.value.trim()
o!==e.name&&""!==o?this.handleNodeEdit(e,o):i===h.NEW&&this.removeNode(e),this.requestUpdate()}}}" @keydown="${t=>{const o=t.key
if([u.ENTER,u.TAB].includes(o)){const s=t.target.value.trim()
this.editingNode=null,this.requestUpdate(),s!==e.name&&""!==s?(this.handleNodeEdit(e,s),this.focusNode(e)):i===h.NEW&&""===s?this.removeNode(e):this.focusNode(e)}else[u.ESCAPE].includes(o)&&(this.editingNode=null,this.requestUpdate(),i===h.NEW?this.removeNode(e):this.focusNode(e))}}" value="${e.name}">`}async handleNodeEdit(e,t){console.error("The function Tree->handleNodeEdit is not implemented.")}handleNodeDelete(e){console.error("The function Tree->handleNodeDelete is not implemented.")}handleNodeMove(e,t,i){console.error("The function Tree->handleNodeMove is not implemented.")}async handleNodeAdd(e,t,i){console.error("The function Tree->handleNodeAdd is not implemented.")}createNodeContentAction(e){return t`${o}`}createDataTransferItemsFromNode(e){throw new Error("The function Tree->createDataTransferItemFromNode is not implemented.")}getNodeIdentifier(e){return e.identifier}getNodeTreeIdentifier(e){return e.__treeIdentifier}getNodeParentTreeIdentifier(e){return e.__parents.join("_")}getNodeClasses(e){const t=["node"]
return e.checked&&t.push("node-selected"),this.draggingNode===e&&t.push("node-dragging"),t}getNodeLabels(e){let t=e.labels
if(t.length>0)return t=t.sort(((e,t)=>t.priority-e.priority))
const i=this.getParentNode(e)
return null===i?[]:this.getNodeLabels(i)}getNodeStatusInformation(e){if(0===e.statusInformation.length)return[]
return e.statusInformation.sort(((e,t)=>e.severity!==t.severity?t.severity-e.severity:t.priority-e.priority))}getNodeDepth(e){return e.depth}getNodeTabindex(e){return this.focusedNode?this.focusedNode===e?0:-1:this.lastFocusedNode?this.lastFocusedNode===e?0:-1:this.getFirstNode()===e?0:-1}getNodeChildren(e){return e.hasChildren?this.displayNodes.filter((t=>e===this.getParentNode(t))):[]}getNodeSetsize(e){if(0===e.depth)return this.displayNodes.filter((e=>0===e.depth)).length
const t=this.getParentNode(e)
return this.getNodeChildren(t).length}getNodePositionInSet(e){const t=this.getParentNode(e)
let i=[]
return 0===e.depth?i=this.displayNodes.filter((e=>0===e.depth)):null!==t&&(i=this.getNodeChildren(t)),i.indexOf(e)+1}getFirstNode(){return this.displayNodes.length?this.displayNodes[0]:null}getPreviousNode(e){const t=this.displayNodes.indexOf(e)-1
return this.displayNodes[t]?this.displayNodes[t]:null}getNextNode(e){const t=this.displayNodes.indexOf(e)+1
return this.displayNodes[t]?this.displayNodes[t]:null}getLastNode(){return this.displayNodes.length?this.displayNodes[this.displayNodes.length-1]:null}getParentNode(e){return e.__parents.length?this.getNodeByTreeIdentifier(this.getNodeParentTreeIdentifier(e)):null}getNodeTitle(e){let t=e.tooltip?e.tooltip:"uid="+e.identifier+" "+e.name
const i=this.getNodeLabels(e)
i.length&&(t+="; "+i.map((e=>e.label)).join("; "))
const o=this.getNodeStatusInformation(e)
return o.length&&(t+="; "+o.map((e=>e.label)).join("; ")),t}handleNodeToggle(e){e.__expanded?this.hideChildren(e):this.showChildren(e)}isRTL(){return"rtl"===window.getComputedStyle(document.documentElement).getPropertyValue("direction")}handleKeyboardInteraction(e){if(null!==this.editingNode)return
if(!1===[u.ENTER,u.SPACE,u.END,u.HOME,u.LEFT,u.UP,u.RIGHT,u.DOWN].includes(e.key))return
const t=e.target,i=this.getNodeFromElement(t)
if(null===i)return
const o=this.getParentNode(i),s=this.getFirstNode(),r=this.getPreviousNode(i),n=this.getNextNode(i),d=this.getLastNode()
switch(e.preventDefault(),e.key){case u.HOME:null!==s&&(this.scrollNodeIntoVisibleArea(s),this.focusNode(s))
break
case u.END:null!==d&&(this.scrollNodeIntoVisibleArea(d),this.focusNode(d))
break
case u.UP:null!==r&&(this.scrollNodeIntoVisibleArea(r),this.focusNode(r))
break
case u.DOWN:null!==n&&(this.scrollNodeIntoVisibleArea(n),this.focusNode(n))
break
case u.LEFT:i.__expanded?i.hasChildren&&this.hideChildren(i):o&&(this.scrollNodeIntoVisibleArea(o),this.focusNode(o))
break
case u.RIGHT:i.__expanded&&n?(this.scrollNodeIntoVisibleArea(n),this.focusNode(n)):i.hasChildren&&this.showChildren(i)
break
case u.ENTER:case u.SPACE:this.selectNode(i)}}scrollNodeIntoVisibleArea(e){const t=e.__y,i=e.__y+this.nodeHeight,o=t>=this.currentScrollPosition,s=i<=this.currentScrollPosition+this.currentVisibleHeight
if(!(o&&s)){let r=this.currentScrollPosition
o||s?o?s||(r=i-this.currentVisibleHeight):r=t:r=i-this.currentVisibleHeight,r<0&&(r=0),this.root.scrollTo({top:r})}}registerUnloadHandler(){try{if(!window.frameElement)return
window.addEventListener("pagehide",(()=>this.muteErrorNotifications=!0),{once:!0})}catch{console.error("Failed to check the existence of window.frameElement – using a foreign origin?")}}}e([s({type:Object})],Tree.prototype,"setup",void 0),e([r()],Tree.prototype,"settings",void 0),e([n(".nodes-root")],Tree.prototype,"root",void 0),e([r()],Tree.prototype,"nodes",void 0),e([r()],Tree.prototype,"currentScrollPosition",void 0),e([r()],Tree.prototype,"currentVisibleHeight",void 0),e([r()],Tree.prototype,"searchTerm",void 0),e([r()],Tree.prototype,"loading",void 0),e([r()],Tree.prototype,"hoveredNode",void 0),e([r()],Tree.prototype,"nodeDragAllowed",void 0)
