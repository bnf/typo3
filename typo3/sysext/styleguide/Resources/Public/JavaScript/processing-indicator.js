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
import e from"nprogress"
import t from"@typo3/backend/notification.js"
import o from"@typo3/core/event/regular-event.js"
import n from"@typo3/core/ajax/ajax-request.js"
let s=0
new o("click",((o,r)=>{o.preventDefault()
for(const e of r.parentElement.children)1===e.nodeType&&e.classList.add("disabled")
r.querySelector("typo3-backend-icon").identifier="spinner-circle",e.start(),s++,new n(r.dataset.href).get().then((async o=>{const n=await o.resolve("application/json")
s--,t.showMessage(n.title,n.body,n.status,5),0===s&&e.done(),function(e,t){for(const o of e.children){if(1!==o.nodeType||"BUTTON"!==o.nodeName)continue
const e=o
e.dataset.generatorAction===t?(e.classList.remove("disabled"),e.hidden=!1,e.querySelector("typo3-backend-icon").identifier="actions-"+t):(e.classList.add("disabled"),e.hidden=!0)}}(r.parentElement,"plus"===r.dataset.generatorAction?"delete":"plus")})).catch((o=>{e.done(),t.error("",o.response.status+" "+o.response.statusText,5),r.querySelector("typo3-backend-icon").identifier=r.dataset.generatorAction,r.classList.remove("disabled")}))})).delegateTo(document,".t3js-generator-action")
