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
var e=function(e,t,o,n){var i,a=arguments.length,r=a<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,o,n)
else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(r=(a<3?i(r):a>3?i(t,o,r):i(t,o))||r)
return a>3&&r&&Object.defineProperty(t,o,r),r}
import{html as t,LitElement as o,nothing as n}from"lit"
import{customElement as i,property as a,query as r}from"lit/decorators.js"
import{until as s}from"lit/directives/until.js"
import{lll as d}from"@typo3/core/lit-helper.js"
import l from"@typo3/core/ajax/ajax-request.js"
import c from"@typo3/backend/storage/persistent.js"
import{ModuleUtility as p}from"@typo3/backend/module.js"
import m from"@typo3/backend/context-menu.js"
import{PageTree as h}from"@typo3/backend/tree/page-tree.js"
import{TreeNodeCommandEnum as u,TreeNodePositionEnum as g}from"@typo3/backend/tree/tree-node.js"
import{TreeToolbar as f}from"@typo3/backend/tree/tree-toolbar.js"
import{TreeModuleState as y}from"@typo3/backend/tree/tree-module-state.js"
import b from"@typo3/backend/modal.js"
import v from"@typo3/backend/severity.js"
import{ModuleStateStorage as P}from"@typo3/backend/storage/module-state-storage.js"
import{DataTransferTypes as _}from"@typo3/backend/enum/data-transfer-types.js"
export const navigationComponentName="typo3-backend-navigation-component-pagetree"
let k=class extends h{constructor(){super(...arguments),this.allowNodeEdit=!0,this.allowNodeDrag=!0,this.allowNodeSorting=!0}sendChangeCommand(e){let t="",o="0"
if(e.target)if(o=e.target.identifier,e.position===g.BEFORE){const t=this.getPreviousNode(e.target)
o=(t.depth===e.target.depth?"-":"")+t.identifier}else e.position===g.AFTER&&(o="-"+o)
if(e.command===u.NEW){const n=e
t="&data[pages]["+e.node.identifier+"][pid]="+encodeURIComponent(o)+"&data[pages]["+e.node.identifier+"][title]="+encodeURIComponent(n.title)+"&data[pages]["+e.node.identifier+"][doktype]="+encodeURIComponent(n.doktype)}else if(e.command===u.EDIT)t="&data[pages]["+e.node.identifier+"][title]="+encodeURIComponent(e.title)
else if(e.command===u.DELETE){const o=P.current("web")
e.node.identifier===o.identifier&&this.selectFirstNode(),t="&cmd[pages]["+e.node.identifier+"][delete]=1"}else t="cmd[pages]["+e.node.identifier+"]["+e.command+"]="+o
this.requestTreeUpdate(t).then((t=>{if(t&&t.hasErrors)this.errorNotification(t.messages)
else if(e.command===u.NEW){const t=this.getParentNode(e.node)
t.loaded=!1,this.loadChildren(t)}else this.refreshOrFilterTree()}))}initializeDragForNode(){throw new Error("unused")}async handleNodeEdit(e,t){if(e.__loading=!0,e.identifier.startsWith("NEW")){const o=this.getPreviousNode(e),n=e.depth===o.depth?g.AFTER:g.INSIDE,i={command:u.NEW,node:e,title:t,position:n,target:o,doktype:e.doktype}
await this.sendChangeCommand(i)}else{const o={command:u.EDIT,node:e,title:t}
await this.sendChangeCommand(o)}e.__loading=!1}createDataTransferItemsFromNode(e){return[{type:_.treenode,data:this.getNodeTreeIdentifier(e)},{type:_.pages,data:JSON.stringify({records:[{identifier:e.identifier,tablename:"pages"}]})}]}async handleNodeAdd(e,t,o){this.updateComplete.then((()=>{this.editNode(e)}))}handleNodeDelete(e){const t={node:e,command:u.DELETE}
if(this.settings.displayDeleteConfirmation){b.confirm(TYPO3.lang["mess.delete.title"],TYPO3.lang["mess.delete"].replace("%s",t.node.name),v.warning,[{text:TYPO3.lang["labels.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:TYPO3.lang.delete||"Delete",btnClass:"btn-warning",name:"delete"}]).addEventListener("button.clicked",(e=>{"delete"===e.target.name&&this.sendChangeCommand(t),b.dismiss()}))}else this.sendChangeCommand(t)}handleNodeMove(e,t,o){const n={node:e,target:t,position:o,command:u.MOVE}
let i=""
switch(o){case g.BEFORE:i=TYPO3.lang["mess.move_before"]
break
case g.AFTER:i=TYPO3.lang["mess.move_after"]
break
default:i=TYPO3.lang["mess.move_into"]}i=i.replace("%s",e.name).replace("%s",t.name)
const a=b.confirm(TYPO3.lang.move_page,i,v.warning,[{text:TYPO3.lang["labels.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:TYPO3.lang["cm.copy"]||"Copy",btnClass:"btn-warning",name:"copy"},{text:TYPO3.lang["labels.move"]||"Move",btnClass:"btn-warning",name:"move"}])
a.addEventListener("button.clicked",(e=>{const t=e.target
"move"===t.name?(n.command=u.MOVE,this.sendChangeCommand(n)):"copy"===t.name&&(n.command=u.COPY,this.sendChangeCommand(n)),a.hideModal()}))}requestTreeUpdate(e){return new l(top.TYPO3.settings.ajaxUrls.record_process).post(e,{headers:{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"}}).then((e=>e.resolve())).catch((e=>{this.errorNotification(e),this.loadData()}))}}
k=e([i("typo3-backend-navigation-component-pagetree-tree")],k)
export{k as EditablePageTree}
let T=class extends(y(o)){constructor(){super(...arguments),this.mountPointPath=null,this.moduleStateType="web",this.configuration=null,this.refresh=()=>{this.tree.refreshOrFilterTree()},this.setMountPoint=e=>{this.setTemporaryMountPoint(e.detail.pageId)},this.selectFirstNode=()=>{this.tree.selectFirstNode()},this.loadContent=e=>{const t=e.detail.node
if(!t?.checked)return
if(P.updateWithTreeIdentifier("web",t.identifier,t.__treeIdentifier),!1===e.detail.propagate)return
const o=top.TYPO3.ModuleMenu.App
let n=p.getFromName(o.getCurrentModule()).link
n+=n.includes("?")?"&":"?",top.TYPO3.Backend.ContentContainer.setUrl(n+"id="+t.identifier)},this.showContextMenu=e=>{const t=e.detail.node
t&&m.show(t.recordType,parseInt(t.identifier,10),"tree","","",this.tree.getElementFromNode(t),e.detail.originalEvent)}}connectedCallback(){super.connectedCallback(),document.addEventListener("typo3:pagetree:refresh",this.refresh),document.addEventListener("typo3:pagetree:mountPoint",this.setMountPoint),document.addEventListener("typo3:pagetree:selectFirstNode",this.selectFirstNode)}disconnectedCallback(){document.removeEventListener("typo3:pagetree:refresh",this.refresh),document.removeEventListener("typo3:pagetree:mountPoint",this.setMountPoint),document.removeEventListener("typo3:pagetree:selectFirstNode",this.selectFirstNode),super.disconnectedCallback()}createRenderRoot(){return this}render(){return t`<div id="typo3-pagetree" class="tree">${s(this.renderTree(),"")}</div>`}getConfiguration(){if(null!==this.configuration)return Promise.resolve(this.configuration)
const e=top.TYPO3.settings.ajaxUrls.page_tree_configuration
return new l(e).get().then((async e=>{const t=await e.resolve("json")
return this.configuration=t,this.mountPointPath=t.temporaryMountPoint||null,t}))}async renderTree(){const e=await this.getConfiguration()
return t`<typo3-backend-navigation-component-pagetree-toolbar id="typo3-pagetree-toolbar" .tree="${this.tree}"></typo3-backend-navigation-component-pagetree-toolbar><div id="typo3-pagetree-treeContainer" class="navigation-tree-container">${this.renderMountPoint()}<typo3-backend-navigation-component-pagetree-tree id="typo3-pagetree-tree" class="tree-wrapper" .setup="${e}" @tree:initialized="${()=>{this.toolbar.tree=this.tree,this.fetchActiveNodeIfMissing()}}" @typo3:tree:node-selected="${this.loadContent}" @typo3:tree:node-context="${this.showContextMenu}" @typo3:tree:nodes-prepared="${this.selectActiveNodeInLoadedNodes}"></typo3-backend-navigation-component-pagetree-tree></div>`}unsetTemporaryMountPoint(){c.unset("pageTree_temporaryMountPoint").then((()=>{this.mountPointPath=null}))}renderMountPoint(){return null===this.mountPointPath?n:t`<div class="node-mount-point"><div class="node-mount-point__icon"><typo3-backend-icon identifier="actions-info-circle" size="small"></typo3-backend-icon></div><div class="node-mount-point__text">${this.mountPointPath}</div><div class="node-mount-point__icon mountpoint-close" @click="${()=>this.unsetTemporaryMountPoint()}" title="${d("labels.temporaryDBmount")}"><typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon></div></div>`}setTemporaryMountPoint(e){new l(this.configuration.setTemporaryMountPointUrl).post("pid="+e,{headers:{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"}}).then((e=>e.resolve())).then((e=>{e&&e.hasErrors?(this.tree.errorNotification(e.message),this.tree.loadData()):this.mountPointPath=e.mountPointPath})).catch((e=>{this.tree.errorNotification(e),this.tree.loadData()}))}}
e([a({type:String})],T.prototype,"mountPointPath",void 0),e([r(".tree-wrapper")],T.prototype,"tree",void 0),e([r("typo3-backend-navigation-component-pagetree-toolbar")],T.prototype,"toolbar",void 0),T=e([i("typo3-backend-navigation-component-pagetree")],T)
export{T as PageTreeNavigationComponent}
let w=class extends f{constructor(){super(...arguments),this.tree=null}render(){return t`<div class="tree-toolbar"><div class="tree-toolbar__menu"><div class="tree-toolbar__search"><label for="toolbarSearch" class="visually-hidden">${d("labels.label.searchString")}</label> <input type="search" id="toolbarSearch" class="form-control form-control-sm search-input" placeholder="${d("tree.searchTermInfo")}"></div></div><div class="tree-toolbar__submenu">${this.tree?.settings?.doktypes?.length?this.tree.settings.doktypes.map((e=>t`<div class="tree-toolbar__menuitem tree-toolbar__drag-node" draggable="true" data-tree-icon="${e.icon}" data-node-type="${e.nodeType}" @dragstart="${t=>{this.handleDragStart(t,e)}}"><typo3-backend-icon identifier="${e.icon}" size="small"></typo3-backend-icon></div>`)):""} <button type="button" class="tree-toolbar__menuitem dropdown-toggle dropdown-toggle-no-chevron float-end" data-bs-toggle="dropdown" aria-expanded="false"><typo3-backend-icon identifier="actions-menu-alternative" size="small"></typo3-backend-icon></button><ul class="dropdown-menu dropdown-menu-end"><li><button class="dropdown-item" @click="${()=>this.refreshTree()}"><span class="dropdown-item-columns"><span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true"><typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon></span><span class="dropdown-item-column dropdown-item-column-title">${d("labels.refresh")}</span></span></button></li><li><button class="dropdown-item" @click="${e=>this.collapseAll(e)}"><span class="dropdown-item-columns"><span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true"><typo3-backend-icon identifier="apps-pagetree-category-collapse-all" size="small"></typo3-backend-icon></span><span class="dropdown-item-column dropdown-item-column-title">${d("labels.collapse")}</span></span></button></li></ul></div></div>`}handleDragStart(e,t){const o={__hidden:!1,__expanded:!1,__indeterminate:!1,__loading:!1,__processed:!1,__treeDragAction:"",__treeIdentifier:"",__treeParents:[""],__parents:[""],__x:0,__y:0,deletable:!1,depth:0,editable:!0,hasChildren:!1,icon:t.icon,overlayIcon:"",identifier:"NEW"+Math.floor(1e9*Math.random()).toString(16),loaded:!1,name:"",note:"",parentIdentifier:"",prefix:"",recordType:"pages",suffix:"",tooltip:"",type:"PageTreeItem",doktype:t.nodeType,statusInformation:[],labels:[]}
this.tree.draggingNode=o,this.tree.nodeDragMode=u.NEW,e.dataTransfer.clearData()
const n={statusIconIdentifier:this.tree.getNodeDragStatusIcon(),tooltipIconIdentifier:t.icon,tooltipLabel:t.title}
e.dataTransfer.setData(_.dragTooltip,JSON.stringify(n)),e.dataTransfer.setData(_.newTreenode,JSON.stringify(o)),e.dataTransfer.effectAllowed="move"}}
e([a({type:k})],w.prototype,"tree",void 0),w=e([i("typo3-backend-navigation-component-pagetree-toolbar")],w)
