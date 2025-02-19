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
import e from"sortablejs";import t from"@typo3/backend/ajax-data-handler.js";var a=new class{constructor(){this.container=".t3js-group-draggable-container",this.dragHandle=".t3js-group-draggable-handle",this.initialize()}initialize(){const a=document.querySelector(this.container);a&&(new e(a,{handle:this.dragHandle,onMove:e=>"taskGroupId"in e.related.dataset&&0!==Number(e.related.dataset.taskGroupId),onSort:e=>{const a=e.target.children[e.newDraggableIndex-1];let o=0;if(a){const e=a.dataset.taskGroupId;o=Number("-"+e)}const r=Number(e.item.dataset.taskGroupId),d="tx_scheduler_task_group",n={component:"contextmenu",action:"delete",table:d,uid:r};t.process("cmd["+d+"]["+r+"][move][action]=paste&cmd["+d+"]["+r+"][move][target]="+o+"&cmd["+d+"]["+r+"][move][update][colPos]=0&cmd["+d+"]["+r+"][move][update][sys_language_uid]=0",n)}}),document.querySelectorAll(this.dragHandle).forEach((e=>{e.disabled=!1})))}};export{a as default};