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
import e from"@typo3/core/ajax/ajax-request.js"
import{ModuleStateStorage as t}from"@typo3/backend/storage/module-state-storage.js"
export const TreeModuleState=i=>class extends i{constructor(){super(...arguments),this.selectActiveNodeInLoadedNodes=e=>{let i=t.current(this.moduleStateType)
if(!i.identifier)return
const{nodes}=e.detail,r=this.transformModuleStateIdentifierToNodeIdentifier(i.treeIdentifier),n=this.transformModuleStateIdentifierToNodeIdentifier(i.identifier),d=nodes.find((e=>null!==i.treeIdentifier&&e.__treeIdentifier===r||null===i.treeIdentifier&&e.identifier===n))
if(!d)return
null===i.treeIdentifier&&(i=t.updateWithTreeIdentifier(this.moduleStateType,this.transformNodeIdentifierToModuleStateIdentifier(d.identifier),this.transformNodeIdentifierToModuleStateIdentifier(d.__treeIdentifier))),d.checked=!0
const o=nodes.find((e=>e.__treeIdentifier===d.__parents.join("_")))
o&&!o.__expanded&&this.tree.updateComplete.then((()=>this.tree.expandNodeParents(d)))},this.fetchActiveNodeIfMissing=async()=>{const e=t.current(this.moduleStateType)
e.identifier&&(this.tree.nodes.find((e=>e.checked))||await this.selectActiveViaRootline(e.identifier))},this.moduleStateUpdated=async e=>{const t=e.detail.state.identifier
if(!this.tree)return
if(t&&t===e.detail.oldState.identifier&&this.tree.nodes.find((e=>e.checked)))return
if(!t)return void console.error("invalid identifier",e.detail)
this.tree.loading&&await this.tree.loadComplete
const i=this.transformModuleStateIdentifierToNodeIdentifier(t),r=this.tree.nodes.find((e=>e.identifier===i)),n=this.tree.nodes.find((e=>e.checked))
if(r&&r===n)return void await this.tree.expandNodeParents(r)
r?await this.selectActiveNodeByParents(t,r.__parents,!1):await this.selectActiveViaRootline(t)}}connectedCallback(){super.connectedCallback(),document.addEventListener("typo3:module-state-storage:update:"+this.moduleStateType,this.moduleStateUpdated)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("typo3:module-state-storage:update:"+this.moduleStateType,this.moduleStateUpdated)}transformModuleStateIdentifierToNodeIdentifier(e){return e}transformNodeIdentifierToModuleStateIdentifier(e){return e}async selectActiveViaRootline(t){const i=new URL(this.tree.settings.rootlineUrl,window.location.origin)
i.searchParams.set("identifier",t)
const r=await new e(i.toString()).get({cache:"no-cache"}),{rootline}=await r.resolve()
rootline.pop()
await this.selectActiveNodeByParents(t,rootline.map((e=>this.transformModuleStateIdentifierToNodeIdentifier(e))),!1)}async selectActiveNodeByParents(e,t,propagate=!0){await this.tree.expandParents(t)
const i=this.transformModuleStateIdentifierToNodeIdentifier(e),r=this.tree.nodes.find((e=>e.identifier===i))
r&&this.tree.selectNode(r,propagate)}}
