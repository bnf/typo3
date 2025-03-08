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
import e from"@typo3/core/event/regular-event.js"
import{MultiRecordSelectionAction as t}from"@typo3/backend/multi-record-selection-action.js"
import o from"@typo3/backend/modal.js"
import{SeverityEnum as n}from"@typo3/backend/enum/severity.js"
import r from"@typo3/backend/severity.js"
import a from"@typo3/backend/ajax-data-handler.js"
import c from"@typo3/backend/notification.js"
export default new class{constructor(){new e("multiRecordSelection:action:delete",this.delete).bindTo(document)}delete(e){e.preventDefault()
const i=e.detail,s=t.getEntityIdentifiers(i)
if(!s.length)return
const l=i.configuration,d=l.tableName||""
if(""===d)return
const m=l.returnUrl||""
o.advanced({title:l.title||"Delete",content:l.content||"Are you sure you want to delete those records?",severity:n.warning,buttons:[{text:l.cancel||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel",trigger:(e,t)=>t.hideModal()},{text:l.ok||TYPO3.lang["button.delete"]||"OK",btnClass:"btn-"+r.getCssClass(n.warning),name:"delete",trigger:async(t,o)=>{o.hideModal()
try{const t=await a.process({cmd:{[d]:Object.fromEntries(s.map((e=>[e,{delete:1}])))}})
if(t.hasErrors)throw t.messages
""!==m?e.target.ownerDocument.location.href=m:e.target.ownerDocument.location.reload()}catch{c.error("Could not delete records")}}}]})}}
