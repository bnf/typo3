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
define(["require","exports","TYPO3/CMS/Backend/FormEngine","./SelectTree","./SelectTreeToolbar","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.SelectTreeElement=void 0;t.SelectTreeElement=class{constructor(e,t,i,n){if(this.recordField=null,this.tree=null,this.selectNode=e=>{const t=e.detail.node;this.updateAncestorsIndeterminateState(t),this.calculateIndeterminate(this.tree.nodes),this.saveCheckboxes(),this.tree.setup.input.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},this.loadDataAfter=()=>{this.tree.nodes=this.tree.nodes.map(e=>(e.indeterminate=!1,e)),this.calculateIndeterminate(this.tree.nodes)},this.saveCheckboxes=()=>{void 0!==this.recordField&&(this.recordField.value=this.tree.getSelectedNodes().map(e=>e.identifier).join(","))},i instanceof Function&&n instanceof Array)throw new Error("Cannot assign both `callback` and `onFieldChangeItems`");this.recordField=document.getElementById(t);const a=document.getElementById(e);this.tree=document.createElement("typo3-backend-form-selecttree"),this.tree.classList.add("svg-tree-wrapper"),this.tree.addEventListener("typo3:svg-tree:nodes-prepared",this.loadDataAfter),this.tree.addEventListener("typo3:svg-tree:node-selected",this.selectNode),i instanceof Function?this.tree.addEventListener("typo3:svg-tree:node-selected",()=>{i()}):n instanceof Array&&this.tree.addEventListener("typo3:svg-tree:node-selected",()=>{r.processOnFieldChange(n)});const s={id:e,dataUrl:this.generateRequestUrl(),readOnlyMode:1===parseInt(this.recordField.dataset.readOnly,10),input:this.recordField,exclusiveNodesIdentifiers:this.recordField.dataset.treeExclusiveKeys,validation:JSON.parse(this.recordField.dataset.formengineValidationRules)[0],expandUpToLevel:this.recordField.dataset.treeExpandUpToLevel,unselectableElements:[]};this.tree.addEventListener("svg-tree:initialized",()=>{if(this.recordField.dataset.treeShowToolbar){const e=document.createElement("typo3-backend-form-selecttree-toolbar");e.tree=this.tree,this.tree.prepend(e)}}),this.tree.setup=s,a.append(this.tree),this.listenForVisibleTree()}listenForVisibleTree(){if(!this.tree.offsetParent){let e=this.tree.closest(".tab-pane").getAttribute("id");if(e){document.querySelector('[aria-controls="'+e+'"]').addEventListener("shown.bs.tab",()=>{this.tree.dispatchEvent(new Event("svg-tree:visible"))})}}}generateRequestUrl(){const e={tableName:this.recordField.dataset.tablename,fieldName:this.recordField.dataset.fieldname,uid:this.recordField.dataset.uid,recordTypeValue:this.recordField.dataset.recordtypevalue,dataStructureIdentifier:this.recordField.dataset.datastructureidentifier,flexFormSheetName:this.recordField.dataset.flexformsheetname,flexFormFieldName:this.recordField.dataset.flexformfieldname,flexFormContainerName:this.recordField.dataset.flexformcontainername,flexFormContainerIdentifier:this.recordField.dataset.flexformcontaineridentifier,flexFormContainerFieldName:this.recordField.dataset.flexformcontainerfieldname,flexFormSectionContainerIsNew:this.recordField.dataset.flexformsectioncontainerisnew,command:this.recordField.dataset.command};return TYPO3.settings.ajaxUrls.record_tree_data+"&"+new URLSearchParams(e)}updateAncestorsIndeterminateState(e){let t=!1;e.parents.forEach(e=>{const r=this.tree.nodes[e];r.indeterminate=r.checked||r.indeterminate||t,t=r.checked||r.indeterminate||r.checked||r.indeterminate})}calculateIndeterminate(e){e.forEach(t=>{(t.checked||t.indeterminate)&&t.parents&&t.parents.length>0&&t.parents.forEach(t=>{e[t].indeterminate=!0})})}}}));
=======
define(["./SelectTree","./SelectTreeToolbar","TYPO3/CMS/Backend/Element/IconElement"],(function(){"use strict";return{SelectTreeElement:class{constructor(e,t,r){this.recordField=null,this.tree=null,this.selectNode=e=>{const t=e.detail.node;this.updateAncestorsIndeterminateState(t),this.calculateIndeterminate(this.tree.nodes),this.saveCheckboxes(),this.tree.setup.input.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},this.loadDataAfter=()=>{this.tree.nodes=this.tree.nodes.map(e=>(e.indeterminate=!1,e)),this.calculateIndeterminate(this.tree.nodes)},this.saveCheckboxes=()=>{void 0!==this.recordField&&(this.recordField.value=this.tree.getSelectedNodes().map(e=>e.identifier).join(","))},this.recordField=document.getElementById(t);const i=document.getElementById(e);this.tree=document.createElement("typo3-backend-form-selecttree"),this.tree.classList.add("svg-tree-wrapper"),this.tree.addEventListener("typo3:svg-tree:nodes-prepared",this.loadDataAfter),this.tree.addEventListener("typo3:svg-tree:node-selected",this.selectNode),this.tree.addEventListener("typo3:svg-tree:node-selected",()=>{r()});const d={id:e,dataUrl:this.generateRequestUrl(),readOnlyMode:1===parseInt(this.recordField.dataset.readOnly,10),input:this.recordField,exclusiveNodesIdentifiers:this.recordField.dataset.treeExclusiveKeys,validation:JSON.parse(this.recordField.dataset.formengineValidationRules)[0],expandUpToLevel:this.recordField.dataset.treeExpandUpToLevel,unselectableElements:[]};this.tree.addEventListener("svg-tree:initialized",()=>{if(this.recordField.dataset.treeShowToolbar){const e=document.createElement("typo3-backend-form-selecttree-toolbar");e.tree=this.tree,this.tree.prepend(e)}}),this.tree.setup=d,i.append(this.tree),this.listenForVisibleTree()}listenForVisibleTree(){if(!this.tree.offsetParent){let e=this.tree.closest(".tab-pane").getAttribute("id");if(e){document.querySelector('[aria-controls="'+e+'"]').addEventListener("shown.bs.tab",()=>{this.tree.dispatchEvent(new Event("svg-tree:visible"))})}}}generateRequestUrl(){const e={tableName:this.recordField.dataset.tablename,fieldName:this.recordField.dataset.fieldname,uid:this.recordField.dataset.uid,recordTypeValue:this.recordField.dataset.recordtypevalue,dataStructureIdentifier:this.recordField.dataset.datastructureidentifier,flexFormSheetName:this.recordField.dataset.flexformsheetname,flexFormFieldName:this.recordField.dataset.flexformfieldname,flexFormContainerName:this.recordField.dataset.flexformcontainername,flexFormContainerIdentifier:this.recordField.dataset.flexformcontaineridentifier,flexFormContainerFieldName:this.recordField.dataset.flexformcontainerfieldname,flexFormSectionContainerIsNew:this.recordField.dataset.flexformsectioncontainerisnew,command:this.recordField.dataset.command};return TYPO3.settings.ajaxUrls.record_tree_data+"&"+new URLSearchParams(e)}updateAncestorsIndeterminateState(e){let t=!1;e.parents.forEach(e=>{const r=this.tree.nodes[e];r.indeterminate=r.checked||r.indeterminate||t,t=r.checked||r.indeterminate||r.checked||r.indeterminate})}calculateIndeterminate(e){e.forEach(t=>{(t.checked||t.indeterminate)&&t.parents&&t.parents.length>0&&t.parents.forEach(t=>{e[t].indeterminate=!0})})}}}}));
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
