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
import $ from"jquery";import"tablesort";import DocumentSaveActions from"TYPO3/CMS/Backend/DocumentSaveActions";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent";import Modal from"TYPO3/CMS/Backend/Modal";import Icons from"TYPO3/CMS/Backend/Icons";import{MessageUtility}from"TYPO3/CMS/Backend/Utility/MessageUtility";import PersistentStorage from"TYPO3/CMS/Backend/Storage/Persistent";class Scheduler{static updateElementBrowserTriggers(){document.querySelectorAll(".t3js-element-browser").forEach(e=>{const t=document.getElementById(e.dataset.triggerFor);e.dataset.params=t.name+"|||pages"})}static resolveDefaultNumberOfDays(){const e=document.getElementById("task_tableGarbageCollection_numberOfDays");return null===e||void 0===e.dataset.defaultNumberOfDays?null:JSON.parse(e.dataset.defaultNumberOfDays)}static storeCollapseState(e,t){let a={};PersistentStorage.isset("moduleData.scheduler")&&(a=PersistentStorage.get("moduleData.scheduler"));const l={};l[e]=t?1:0,$.extend(a,l),PersistentStorage.set("moduleData.scheduler",a)}constructor(){this.initializeEvents(),this.initializeDefaultStates(),DocumentSaveActions.getInstance().addPreSubmitCallback(()=>{let e=$("#task_class").val();e=e.toLowerCase().replace(/\\/g,"-"),$(".extraFields").appendTo($("#extraFieldsHidden")),$(".extra_fields_"+e).appendTo($("#extraFieldsSection"))})}actOnChangedTaskClass(e){let t=e.val();t=t.toLowerCase().replace(/\\/g,"-"),$(".extraFields").hide(),$(".extra_fields_"+t).show()}actOnChangedTaskType(e){this.toggleFieldsByTaskType($(e.currentTarget).val())}actOnChangeSchedulerTableGarbageCollectionAllTables(e){let t=$("#task_tableGarbageCollection_numberOfDays"),a=$("#task_tableGarbageCollection_table");if(e.prop("checked"))a.prop("disabled",!0),t.prop("disabled",!0);else{let e=parseInt(t.val(),10);if(e<1){let t=a.val();const l=Scheduler.resolveDefaultNumberOfDays();null!==l&&(e=l[t])}a.prop("disabled",!1),e>0&&t.prop("disabled",!1)}}actOnChangeSchedulerTableGarbageCollectionTable(e){let t=$("#task_tableGarbageCollection_numberOfDays");const a=Scheduler.resolveDefaultNumberOfDays();null!==a&&a[e.val()]>0?(t.prop("disabled",!1),t.val(a[e.val()])):(t.prop("disabled",!0),t.val(0))}toggleFieldsByTaskType(e){e=parseInt(e+"",10),$("#task_end_col").toggle(2===e),$("#task_frequency_row").toggle(2===e)}initializeEvents(){$("#task_class").on("change",e=>{this.actOnChangedTaskClass($(e.currentTarget))}),$("#task_type").on("change",this.actOnChangedTaskType.bind(this)),$("#task_tableGarbageCollection_allTables").on("change",e=>{this.actOnChangeSchedulerTableGarbageCollectionAllTables($(e.currentTarget))}),$("#task_tableGarbageCollection_table").on("change",e=>{this.actOnChangeSchedulerTableGarbageCollectionTable($(e.currentTarget))}),$("[data-update-task-frequency]").on("change",e=>{const t=$(e.currentTarget);$("#task_frequency").val(t.val()),t.val(t.attr("value")).trigger("blur")});const e=document.querySelector("table.taskGroup-table");null!==e&&new Tablesort(e),$(document).on("click",".t3js-element-browser",e=>{e.preventDefault();const t=e.currentTarget;Modal.advanced({type:Modal.types.iframe,content:t.href+"&mode="+t.dataset.mode+"&bparams="+t.dataset.params,size:Modal.sizes.large})}),new RegularEvent("show.bs.collapse",this.toggleCollapseIcon.bind(this)).bindTo(document),new RegularEvent("hide.bs.collapse",this.toggleCollapseIcon.bind(this)).bindTo(document),new RegularEvent("multiRecordSelection:action:go",this.executeTasks.bind(this)).bindTo(document),new RegularEvent("multiRecordSelection:action:go_cron",this.executeTasks.bind(this)).bindTo(document),window.addEventListener("message",this.listenOnElementBrowser.bind(this))}initializeDefaultStates(){let e=$("#task_type");e.length&&this.toggleFieldsByTaskType(e.val());let t=$("#task_class");t.length&&(this.actOnChangedTaskClass(t),Scheduler.updateElementBrowserTriggers())}listenOnElementBrowser(e){if(!MessageUtility.verifyOrigin(e.origin))throw"Denied message sent by "+e.origin;if("typo3:elementBrowser:elementAdded"===e.data.actionName){if(void 0===e.data.fieldName)throw"fieldName not defined in message";if(void 0===e.data.value)throw"value not defined in message";const t=e.data.value.split("_");document.querySelector('input[name="'+e.data.fieldName+'"]').value=t[1]}}toggleCollapseIcon(e){const t="hide.bs.collapse"===e.type,a=document.querySelector('.t3js-toggle-table[data-bs-target="#'+e.target.id+'"] .collapseIcon');null!==a&&Icons.getIcon(t?"actions-view-list-expand":"actions-view-list-collapse",Icons.sizes.small).done(e=>{a.innerHTML=e}),Scheduler.storeCollapseState($(e.target).data("table"),t)}executeTasks(e){const t=document.querySelector("#tx_scheduler_form");if(null===t)return;const a=[];if(e.detail.checkboxes.forEach(e=>{const t=e.closest("tr");null!==t&&t.dataset.taskId&&a.push(t.dataset.taskId)}),a.length){const l=document.createElement("input");if(l.setAttribute("type","hidden"),l.setAttribute("name","tx_scheduler[execute]"),l.setAttribute("value",a.join(",")),t.append(l),"multiRecordSelection:action:go_cron"===e.type){const e=document.createElement("input");e.setAttribute("type","hidden"),e.setAttribute("name","go_cron"),e.setAttribute("value","1"),t.append(e)}t.submit()}}}export default new Scheduler;