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
import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent.js";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.js";import Tooltip from"TYPO3/CMS/Backend/Tooltip.js";class Permissions{constructor(){this.options={containerSelector:"#typo3-permissionList",editControllerSelector:"#PermissionControllerEdit"},this.ajaxUrl=TYPO3.settings.ajaxUrls.user_access_permissions,this.initializeCheckboxGroups(),this.initializeEvents()}static setPermissionCheckboxes(e,t){const a=document.querySelectorAll(`input[type="checkbox"][name^="${e}"]`);for(let e of a){const a=parseInt(e.value,10);e.checked=(t&a)===a}}static updatePermissionValue(e,t){let a=0;const o=document.querySelectorAll(`input[type="checkbox"][name^="${e}"]:checked`);for(let e of o)a|=parseInt(e.value,10);document.forms.namedItem("editform")[t].value=a|("check[perms_user]"===e?1:0)}setPermissions(e){let t=e.dataset.page,a=e.dataset.who;Tooltip.hide(document.querySelectorAll('[data-bs-toggle="tooltip"]')),new AjaxRequest(this.ajaxUrl).post({page:t,who:a,permissions:e.dataset.permissions,mode:e.dataset.mode,bits:e.dataset.bits}).then(async e=>{const o=await e.resolve();document.getElementById(t+"_"+a).outerHTML=o,Tooltip.initialize('[data-bs-toggle="tooltip"]')})}toggleEditLock(e){let t=e.dataset.page;new AjaxRequest(this.ajaxUrl).post({action:"toggle_edit_lock",page:t,editLockState:e.dataset.lockstate}).then(async e=>{document.getElementById("el_"+t).outerHTML=await e.resolve()})}changeOwner(e){let t=e.dataset.page;const a=document.getElementById("o_"+t);new AjaxRequest(this.ajaxUrl).post({action:"change_owner",page:t,ownerUid:e.dataset.owner,newOwnerUid:a.getElementsByTagName("select")[0].value}).then(async e=>{a.outerHTML=await e.resolve()})}showChangeOwnerSelector(e){let t=e.dataset.page;new AjaxRequest(this.ajaxUrl).post({action:"show_change_owner_selector",page:t,ownerUid:e.dataset.owner,username:e.dataset.username}).then(async e=>{document.getElementById("o_"+t).outerHTML=await e.resolve()})}restoreOwner(e){var t;const a=e.dataset.page,o=null!==(t=e.dataset.username)&&void 0!==t?t:e.dataset.ifNotSet,n=document.createElement("span");n.setAttribute("id","o_"+a);const s=document.createElement("button");s.classList.add("ug_selector","changeowner","btn","btn-link"),s.setAttribute("type","button"),s.setAttribute("data-page",a),s.setAttribute("data-owner",e.dataset.owner),s.setAttribute("data-username",o),s.innerText=o,n.appendChild(s);const r=document.getElementById("o_"+a);r.parentNode.replaceChild(n,r)}restoreGroup(e){var t;const a=e.dataset.page,o=null!==(t=e.dataset.groupname)&&void 0!==t?t:e.dataset.ifNotSet,n=document.createElement("span");n.setAttribute("id","g_"+a);const s=document.createElement("button");s.classList.add("ug_selector","changegroup","btn","btn-link"),s.setAttribute("type","button"),s.setAttribute("data-page",a),s.setAttribute("data-group-id",e.dataset.groupId),s.setAttribute("data-groupname",o),s.innerText=o,n.appendChild(s);const r=document.getElementById("g_"+a);r.parentNode.replaceChild(n,r)}changeGroup(e){let t=e.dataset.page;const a=document.getElementById("g_"+t);new AjaxRequest(this.ajaxUrl).post({action:"change_group",page:t,groupUid:e.dataset.groupId,newGroupUid:a.getElementsByTagName("select")[0].value}).then(async e=>{a.outerHTML=await e.resolve()})}showChangeGroupSelector(e){let t=e.dataset.page;new AjaxRequest(this.ajaxUrl).post({action:"show_change_group_selector",page:t,groupUid:e.dataset.groupId,groupname:e.dataset.groupname}).then(async e=>{document.getElementById("g_"+t).outerHTML=await e.resolve()})}initializeCheckboxGroups(){document.querySelectorAll("[data-checkbox-group]").forEach(e=>{const t=e.dataset.checkboxGroup,a=parseInt(e.value,10);Permissions.setPermissionCheckboxes(t,a)})}initializeEvents(){const e=document.querySelector(this.options.containerSelector),t=document.querySelector(this.options.editControllerSelector);null!==e&&(new RegularEvent("click",(e,t)=>{e.preventDefault(),this.setPermissions(t)}).delegateTo(e,".change-permission"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.toggleEditLock(t)}).delegateTo(e,".editlock"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.showChangeOwnerSelector(t)}).delegateTo(e,".changeowner"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.showChangeGroupSelector(t)}).delegateTo(e,".changegroup"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.restoreOwner(t)}).delegateTo(e,".restoreowner"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.changeOwner(t)}).delegateTo(e,".saveowner"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.restoreGroup(t)}).delegateTo(e,".restoregroup"),new RegularEvent("click",(e,t)=>{e.preventDefault(),this.changeGroup(t)}).delegateTo(e,".savegroup")),null!==t&&new RegularEvent("click",(e,t)=>{const a=t.dataset.checkChangePermissions.split(",").map(e=>e.trim());Permissions.updatePermissionValue.apply(this,a)}).delegateTo(t,"[data-check-change-permissions]")}}export default new Permissions;