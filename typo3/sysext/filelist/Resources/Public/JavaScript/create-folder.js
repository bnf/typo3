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
import{FileListActionEvent as o}from"@typo3/filelist/file-list-actions.js"
import n from"@typo3/backend/info-window.js"
export default new class{constructor(){new e(o.primary,(e=>{e.preventDefault()
const t=e.detail
t.action=o.select,document.dispatchEvent(new CustomEvent(o.select,{detail:t}))})).bindTo(document),new e(o.select,(e=>{e.preventDefault()
const t=e.detail.resources[0]
"folder"===t.type&&this.loadContent(t)})).bindTo(document),new e(o.show,(e=>{e.preventDefault()
const t=e.detail.resources[0]
n.showItem("_"+t.type.toUpperCase(),t.identifier)})).bindTo(document)}loadContent(e){if("folder"!==e.type)return
const o=document.location.href+"&contentOnly=1&expandFolder="+e.identifier
new t(o).get().then((e=>e.resolve())).then((e=>{document.querySelector(".element-browser-main-content .element-browser-body").innerHTML=e}))}}
