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
import{MessageUtility as e}from"@typo3/backend/utility/message-utility.js"
import t from"@typo3/core/document-service.js"
import r from"@typo3/backend/modal.js"
export default new class{constructor(){this.opener=null,this.fieldReference="",this.rte={parameters:"",configuration:""},this.irre={objectId:""},this.focusOpenerAndClose=()=>{this.getParent()&&this.getParent().focus(),r.dismiss(),close()},t.ready().then((()=>{const e=document.body.dataset
this.fieldReference=e.fieldReference,this.rte.parameters=e.rteParameters,this.rte.configuration=e.rteConfiguration,this.irre.objectId=e.irreObjectId}))}getParent(){const e=void 0!==window.frames&&void 0!==window.frames.frameElement&&window.frames.frameElement.classList.contains("t3js-modal-iframe"),t=Array.from(top.frames||[]).filter((e=>{try{return void 0!==e.frameElement&&e.frameElement.classList.contains("t3js-modal-iframe")&&e.frameElement!==window.frames.frameElement}catch{return!1}}))
return null===this.opener&&(e&&t.length>0?this.opener=t.pop():void 0!==window.parent&&void 0!==window.parent.document.list_frame&&null!==window.parent.document.list_frame.parent.document.querySelector(".t3js-modal-iframe")?this.opener=window.parent.document.list_frame:void 0!==window.parent&&void 0!==window.parent.frames.list_frame&&null!==window.parent.frames.list_frame.parent.document.querySelector(".t3js-modal-iframe")?this.opener=window.parent.frames.list_frame:void 0!==window.frames&&void 0!==window.frames.frameElement&&null!==window.frames.frameElement&&window.frames.frameElement.classList.contains("t3js-modal-iframe")?this.opener=window.frames.frameElement.contentWindow.parent:window.opener&&(this.opener=window.opener)),this.opener}insertElement(t,r,n,i,o){if(this.irre.objectId){if(this.getParent()){const s={actionName:"typo3:foreignRelation:insert",objectGroup:this.irre.objectId,table:t,uid:r}
e.send(s,this.getParent())}else alert("Error - reference to main window is not set properly!"),this.focusOpenerAndClose()
return o&&this.focusOpenerAndClose(),!0}return!this.fieldReference||this.rte.parameters||this.rte.configuration||this.addElement(n,i||t+"_"+r,o),!1}addElement(t,r,n){if(this.getParent()){const i={actionName:"typo3:elementBrowser:elementAdded",fieldName:this.fieldReference,value:r,label:t}
e.send(i,this.getParent()),n&&this.focusOpenerAndClose()}else alert("Error - reference to main window is not set properly!"),this.focusOpenerAndClose()}}
