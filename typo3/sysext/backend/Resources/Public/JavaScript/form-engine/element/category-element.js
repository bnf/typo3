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
import"@typo3/backend/form-engine/element/select-tree.js";import"@typo3/backend/form-engine/element/select-tree-toolbar.js";import"@typo3/backend/element/icon-element.js";class CategoryElement extends HTMLElement{constructor(){super(...arguments),this.recordField=null,this.treeWrapper=null,this.tree=null,this.selectNode=e=>{const t=e.detail.node;this.updateAncestorsIndeterminateState(t),this.calculateIndeterminate(this.tree.nodes),this.saveCheckboxes(),this.tree.setup.input.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},this.loadDataAfter=()=>{this.tree.nodes=this.tree.nodes.map(e=>(e.indeterminate=!1,e)),this.calculateIndeterminate(this.tree.nodes)},this.saveCheckboxes=()=>{this.recordField.value=this.tree.getSelectedNodes().map(e=>e.identifier).join(",")}}connectedCallback(){this.recordField=this.querySelector("#"+(this.getAttribute("recordFieldId")||"")),this.treeWrapper=this.querySelector("#"+(this.getAttribute("treeWrapperId")||"")),this.recordField&&this.treeWrapper&&(this.tree=document.createElement("typo3-backend-form-selecttree"),this.tree.classList.add("svg-tree-wrapper"),this.tree.setup={id:this.treeWrapper.id,dataUrl:this.generateDataUrl(),readOnlyMode:this.recordField.dataset.readOnly,input:this.recordField,exclusiveNodesIdentifiers:this.recordField.dataset.treeExclusiveKeys,validation:JSON.parse(this.recordField.dataset.formengineValidationRules)[0],expandUpToLevel:this.recordField.dataset.treeExpandUpToLevel,unselectableElements:[]},this.treeWrapper.append(this.tree),this.registerTreeEventListeners())}registerTreeEventListeners(){this.tree.addEventListener("typo3:svg-tree:nodes-prepared",this.loadDataAfter),this.tree.addEventListener("typo3:svg-tree:node-selected",this.selectNode),this.tree.addEventListener("svg-tree:initialized",()=>{if(this.recordField.dataset.treeShowToolbar){const e=document.createElement("typo3-backend-form-selecttree-toolbar");e.tree=this.tree,this.tree.prepend(e)}}),this.listenForVisibleTree()}listenForVisibleTree(){if(!this.tree.offsetParent){const e=this.tree.closest(".tab-pane").getAttribute("id");if(e){document.querySelector('[aria-controls="'+e+'"]').addEventListener("shown.bs.tab",()=>{this.tree.dispatchEvent(new Event("svg-tree:visible"))})}}}generateDataUrl(){return TYPO3.settings.ajaxUrls.record_tree_data+"&"+new URLSearchParams({uid:this.recordField.dataset.uid,command:this.recordField.dataset.command,tableName:this.recordField.dataset.tablename,fieldName:this.recordField.dataset.fieldname,defaultValues:this.recordField.dataset.defaultvalues,overrideValues:this.recordField.dataset.overridevalues,recordTypeValue:this.recordField.dataset.recordtypevalue,flexFormSheetName:this.recordField.dataset.flexformsheetname,flexFormFieldName:this.recordField.dataset.flexformfieldname,flexFormContainerName:this.recordField.dataset.flexformcontainername,dataStructureIdentifier:this.recordField.dataset.datastructureidentifier,flexFormContainerFieldName:this.recordField.dataset.flexformcontainerfieldname,flexFormContainerIdentifier:this.recordField.dataset.flexformcontaineridentifier,flexFormSectionContainerIsNew:this.recordField.dataset.flexformsectioncontainerisnew})}updateAncestorsIndeterminateState(e){let t=!1;e.parents.forEach(e=>{const r=this.tree.nodes[e];r.indeterminate=r.checked||r.indeterminate||t,t=r.checked||r.indeterminate||r.checked||r.indeterminate})}calculateIndeterminate(e){e.forEach(t=>{(t.checked||t.indeterminate)&&t.parents&&t.parents.length>0&&t.parents.forEach(t=>{e[t].indeterminate=!0})})}}window.customElements.define("typo3-formengine-element-category",CategoryElement);