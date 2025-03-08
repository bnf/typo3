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
import e from"@typo3/backend/modal.js"
import t from"@typo3/core/event/regular-event.js"
import o from"@typo3/core/document-service.js"
export default new class{constructor(){o.ready().then((()=>this.registerEvents()))}registerEvents(){new t("click",this.triggerConfirmation).delegateTo(document,".t3js-confirm-trigger")
const e=document.querySelector(".t3js-impexp-toggledisabled")
null!==e&&new t("click",this.toggleDisabled).bindTo(e)}triggerConfirmation(){const t=e.confirm(this.dataset.title,this.dataset.message)
t.addEventListener("confirm.button.ok",(()=>{const e=document.getElementById("t3js-submit-field")
e.name=this.name,e.closest("form").submit(),t.hideModal()})),t.addEventListener("confirm.button.cancel",(()=>{t.hideModal()}))}toggleDisabled(){const e=document.querySelectorAll('table.t3js-impexp-preview tr[data-active="hidden"] input.t3js-exclude-checkbox')
if(e.length>0){const t=e.item(0)
e.forEach((e=>{e.checked=!t.checked}))}}}
