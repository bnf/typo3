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
import t from"@typo3/core/ajax/ajax-request.js"
class a{constructor(){this.options={containerSelector:"#typo3-permissionList",editControllerSelector:"#PermissionControllerEdit"},this.ajaxUrl=TYPO3.settings.ajaxUrls.user_access_permissions,this.initializeCheckboxGroups(),this.initializeEvents()}static setPermissionCheckboxes(e,t){const a=document.querySelectorAll(`input[type="checkbox"][name^="${e}"]`)
for(const o of a){const n=parseInt(o.value,10)
o.checked=(t&n)===n}}static updatePermissionValue(e,t){let a=0
const o=document.querySelectorAll(`input[type="checkbox"][name^="${e}"]:checked`)
for(const n of o)a|=parseInt(n.value,10)
document.forms.namedItem("editform")[t].value=a|("check[perms_user]"===e?1:0)}setPermissions(e){const a=e.dataset.page,o=e.dataset.who,n=e.dataset.bits
new t(this.ajaxUrl).post({page:a,who:o,permissions:e.dataset.permissions,mode:e.dataset.mode,bits:e.dataset.bits}).then((async t=>{const a=await t.resolve(),o=e.parentElement
o.innerHTML=a,o.querySelector('button[data-bits="'+n+'"]').focus()}))}toggleEditLock(e){const a=e.dataset.page
new t(this.ajaxUrl).post({action:"toggle_edit_lock",page:a,editLockState:e.dataset.lockstate}).then((async t=>{const o=await t.resolve(),n=e.parentElement
e.outerHTML=o,n.querySelector('button[data-page="'+a+'"]').focus()}))}changeOwner(e){const a=e.dataset.page,o=document.getElementById("o_"+a)
new t(this.ajaxUrl).post({action:"change_owner",page:a,ownerUid:e.dataset.owner,newOwnerUid:o.getElementsByTagName("select")[0].value}).then((async e=>{o.outerHTML=await e.resolve()}))}showChangeOwnerSelector(e){const a=e.dataset.page
new t(this.ajaxUrl).post({action:"show_change_owner_selector",page:a,ownerUid:e.dataset.owner,username:e.dataset.username}).then((async e=>{document.getElementById("o_"+a).outerHTML=await e.resolve()}))}restoreOwner(e){const t=e.dataset.page,a=e.dataset.username??e.dataset.ifNotSet,o=document.createElement("span")
o.setAttribute("id",`o_${t}`)
const n=document.createElement("button")
n.classList.add("ug_selector","changeowner","btn","btn-sm","btn-link"),n.setAttribute("type","button"),n.setAttribute("data-page",t),n.setAttribute("data-owner",e.dataset.owner),n.setAttribute("data-username",a),n.innerText=a,o.appendChild(n)
const s=document.getElementById("o_"+t)
s.parentNode.replaceChild(o,s)}restoreGroup(e){const t=e.dataset.page,a=e.dataset.groupname??e.dataset.ifNotSet,o=document.createElement("span")
o.setAttribute("id",`g_${t}`)
const n=document.createElement("button")
n.classList.add("ug_selector","changegroup","btn","btn-sm","btn-link"),n.setAttribute("type","button"),n.setAttribute("data-page",t),n.setAttribute("data-group-id",e.dataset.groupId),n.setAttribute("data-groupname",a),n.innerText=a,o.appendChild(n)
const s=document.getElementById("g_"+t)
s.parentNode.replaceChild(o,s)}changeGroup(e){const a=e.dataset.page,o=document.getElementById("g_"+a)
new t(this.ajaxUrl).post({action:"change_group",page:a,groupUid:e.dataset.groupId,newGroupUid:o.getElementsByTagName("select")[0].value}).then((async e=>{o.outerHTML=await e.resolve()}))}showChangeGroupSelector(e){const a=e.dataset.page
new t(this.ajaxUrl).post({action:"show_change_group_selector",page:a,groupUid:e.dataset.groupId,groupname:e.dataset.groupname}).then((async e=>{document.getElementById("g_"+a).outerHTML=await e.resolve()}))}initializeCheckboxGroups(){document.querySelectorAll("[data-checkbox-group]").forEach((e=>{const t=e.dataset.checkboxGroup,o=parseInt(e.value,10)
a.setPermissionCheckboxes(t,o)}))}initializeEvents(){const t=document.querySelector(this.options.containerSelector),o=document.querySelector(this.options.editControllerSelector)
null!==t&&(new e("click",((e,t)=>{e.preventDefault(),this.setPermissions(t)})).delegateTo(t,".change-permission"),new e("click",((e,t)=>{e.preventDefault(),this.toggleEditLock(t)})).delegateTo(t,".editlock"),new e("click",((e,t)=>{e.preventDefault(),this.showChangeOwnerSelector(t)})).delegateTo(t,".changeowner"),new e("click",((e,t)=>{e.preventDefault(),this.showChangeGroupSelector(t)})).delegateTo(t,".changegroup"),new e("click",((e,t)=>{e.preventDefault(),this.restoreOwner(t)})).delegateTo(t,".restoreowner"),new e("click",((e,t)=>{e.preventDefault(),this.changeOwner(t)})).delegateTo(t,".saveowner"),new e("click",((e,t)=>{e.preventDefault(),this.restoreGroup(t)})).delegateTo(t,".restoregroup"),new e("click",((e,t)=>{e.preventDefault(),this.changeGroup(t)})).delegateTo(t,".savegroup")),null!==o&&new e("click",((e,t)=>{const o=t.dataset.checkChangePermissions.split(",").map((e=>e.trim()))
a.updatePermissionValue.apply(this,o)})).delegateTo(o,"[data-check-change-permissions]")}}export default new a
