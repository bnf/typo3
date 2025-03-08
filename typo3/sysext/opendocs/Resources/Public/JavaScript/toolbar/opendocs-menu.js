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
import e from"@typo3/core/ajax/ajax-request.js"
import"@typo3/backend/element/spinner-element.js"
import t from"@typo3/backend/viewport.js"
import{Sizes as o}from"@typo3/backend/enum/icon-types.js"
import n from"@typo3/core/event/regular-event.js"
var r
!function(e){e.containerSelector="#typo3-cms-opendocs-backend-toolbaritems-opendocstoolbaritem",e.closeSelector=".t3js-topbar-opendocs-close",e.menuContainerSelector=".dropdown-menu",e.toolbarIconSelector=".toolbar-item-icon .t3js-icon",e.counterSelector="#tx-opendocs-counter",e.entrySelector=".t3js-open-doc"}(r||(r={}))
class c{constructor(){this.hashDataAttributeName="opendocsidentifier",document.addEventListener("typo3:opendocs:updateRequested",(()=>this.updateMenu())),t.Topbar.Toolbar.registerEvent((()=>{this.initializeEvents(),this.updateMenu()}))}static updateNumberOfDocs(){const e=document.querySelector(r.containerSelector),t=document.querySelector(r.counterSelector)
let o=parseInt(e.querySelector("[data-open-docs]")?.dataset.openDocs,10)
isNaN(o)&&(o=0),t.textContent=o.toString(),t.classList.toggle("hidden",0===o)}updateMenu(){const t=document.querySelector(r.containerSelector+" "+r.toolbarIconSelector),n=t.cloneNode(!0),a=document.createElement("typo3-backend-spinner")
a.setAttribute("size",o.small),t.replaceWith(a),new e(TYPO3.settings.ajaxUrls.opendocs_menu).get().then((async e=>{document.querySelector(r.containerSelector+" "+r.menuContainerSelector).innerHTML=await e.resolve(),c.updateNumberOfDocs()})).finally((()=>{document.querySelector(r.containerSelector+" typo3-backend-spinner").replaceWith(n)}))}initializeEvents(){const e=document.querySelector(r.containerSelector)
new n("click",((e,t)=>{e.preventDefault(),e.stopImmediatePropagation()
const o=t.dataset[this.hashDataAttributeName]
this.closeDocument(o)})).delegateTo(e,r.closeSelector),new n("click",((e,t)=>{e.preventDefault()
document.querySelector("typo3-backend-module-router").setAttribute("endpoint",t.getAttribute("href"))})).delegateTo(e,r.entrySelector)}closeDocument(t){const o={}
t&&(o.md5sum=t),new e(TYPO3.settings.ajaxUrls.opendocs_closedoc).post(o).then((async e=>{document.querySelector(r.containerSelector).querySelector(r.menuContainerSelector).innerHTML=await e.resolve(),c.updateNumberOfDocs()}))}}export default new c
