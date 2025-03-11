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
import e from"sortablejs"
import t from"@typo3/backend/ajax-data-handler.js"
export default new class{constructor(){this.container=".t3js-group-draggable-container",this.dragHandle=".t3js-group-draggable-handle",this.initialize()}initialize(){const a=document.querySelector(this.container)
a&&(new e(a,{handle:this.dragHandle,onMove:e=>"taskGroupId"in e.related.dataset&&0!==Number(e.related.dataset.taskGroupId),onSort:e=>{const a=e.target.children[e.newDraggableIndex-1]
let o=0
if(a){const r=a.dataset.taskGroupId
o=Number("-"+r)}const d=Number(e.item.dataset.taskGroupId),n="tx_scheduler_task_group",s={component:"contextmenu",action:"delete",table:n,uid:d}
t.process("cmd["+n+"]["+d+"][move][action]=paste&cmd["+n+"]["+d+"][move][target]="+o+"&cmd["+n+"]["+d+"][move][update][colPos]=0&cmd["+n+"]["+d+"][move][update][sys_language_uid]=0",s)}}),document.querySelectorAll(this.dragHandle).forEach((e=>{e.disabled=!1})))}}
