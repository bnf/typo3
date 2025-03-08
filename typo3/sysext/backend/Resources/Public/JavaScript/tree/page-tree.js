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
import{Tree as e}from"@typo3/backend/tree/tree.js"
import{html as t}from"lit"
import{DataTransferTypes as o}from"@typo3/backend/enum/data-transfer-types.js"
import n from"@typo3/backend/modal.js"
import{SeverityEnum as r}from"@typo3/backend/enum/severity.js"
import i from"@typo3/backend/utility/drag-drop-utility.js"
export class PageTree extends e{constructor(){super(),this.settings.defaultProperties={hasChildren:!1,nameSourceField:"title",prefix:"",suffix:"",locked:!1,loaded:!1,overlayIcon:"",selectable:!0,expanded:!1,checked:!1,stopPageTree:!1}}getDataUrl(e=null){return null===e?this.settings.dataUrl:this.settings.dataUrl+"&parent="+e.identifier+"&mount="+e.mountPoint+"&depth="+e.depth}createNodeToggle(e){const o=this.isRTL()?"actions-caret-left":"actions-caret-right"
return t`${e.stopPageTree&&0!==e.depth?t`<span class="node-stop" @click="${t=>{t.preventDefault(),t.stopImmediatePropagation(),document.dispatchEvent(new CustomEvent("typo3:pagetree:mountPoint",{detail:{pageId:parseInt(e.identifier,10)}}))}}"><typo3-backend-icon identifier="${o}" size="small"></typo3-backend-icon></span>`:super.createNodeToggle(e)}`}handleNodeDragOver(e){if(super.handleNodeDragOver(e))return!0
if(e.dataTransfer.types.includes(o.content)){const t=this.getNodeFromDragEvent(e)
if(null===t)return!1
this.cleanDrag()
return this.getElementFromNode(t).classList.add("node-hover"),t.hasChildren&&!t.__expanded?this.openNodeTimeout.targetNode!=t&&(this.openNodeTimeout.targetNode=t,clearTimeout(this.openNodeTimeout.timeout),this.openNodeTimeout.timeout=setTimeout((()=>{this.showChildren(this.openNodeTimeout.targetNode),this.openNodeTimeout.targetNode=null,this.openNodeTimeout.timeout=null}),1e3)):(clearTimeout(this.openNodeTimeout.timeout),this.openNodeTimeout.targetNode=null,this.openNodeTimeout.timeout=null),e.preventDefault(),i.updateEventAndTooltipToReflectCopyMoveIntention(e),!0}return!1}handleNodeDrop(e){if(super.handleNodeDrop(e))return!0
if(e.dataTransfer.types.includes(o.content)){const t=this.getNodeFromDragEvent(e)
if(null===t)return!1
const a=e.dataTransfer.getData(o.content),s=JSON.parse(a)
e.preventDefault()
const d=new URL(s.moveElementUrl,window.origin)
return d.searchParams.set("expandPage",t.identifier),d.searchParams.set("originalPid",t.identifier),i.isCopyModifierFromEvent(e)&&d.searchParams.set("makeCopy","1"),n.advanced({content:d.toString(),severity:r.notice,size:n.sizes.large,type:n.types.iframe}),!0}return!1}}