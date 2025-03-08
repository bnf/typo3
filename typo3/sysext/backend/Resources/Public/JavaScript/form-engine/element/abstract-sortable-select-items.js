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
import e from"@typo3/backend/form-engine.js"
import t from"@typo3/backend/form-engine-validation.js"
import o from"@typo3/core/event/regular-event.js"
import{selector as r}from"@typo3/core/literals.js"
export class AbstractSortableSelectItems{constructor(){this.registerSortableEventHandler=o=>{this.registerKeyboardEventHandler(o)
const r=o.closest(".form-wizards-wrap").querySelector(".form-wizards-item-aside")
null!==r&&r.addEventListener("click",(r=>{const n=r.target.closest(".t3js-btn-option")
if(null===n)return
r.preventDefault()
const l=n.dataset.fieldname,i=e.getFieldElement(l).get(0),s=e.getFieldElement(l,"_avail").get(0)
n.classList.contains("t3js-btn-moveoption-top")?AbstractSortableSelectItems.moveOptionToTop(o):n.classList.contains("t3js-btn-moveoption-up")?AbstractSortableSelectItems.moveOptionUp(o):n.classList.contains("t3js-btn-moveoption-down")?AbstractSortableSelectItems.moveOptionDown(o):n.classList.contains("t3js-btn-moveoption-bottom")?AbstractSortableSelectItems.moveOptionToBottom(o):n.classList.contains("t3js-btn-removeoption")&&AbstractSortableSelectItems.removeOption(o,s),e.updateHiddenFieldValueFromSelect(o,i),t.markFieldAsChanged(s),t.validateField(s)}))},this.registerKeyboardEventHandler=r=>{const n=r.dataset.formengineInputName,l=e.getFieldElement(n).get(0),i=e.getFieldElement(n,"_avail").get(0)
new o("keydown",(o=>{"Delete"!==o.code&&"Backspace"!==o.code||(o.preventDefault(),AbstractSortableSelectItems.removeOption(r,i)),"ArrowUp"===o.code&&o.altKey&&(o.preventDefault(),AbstractSortableSelectItems.moveOptionUp(r)),"ArrowDown"===o.code&&o.altKey&&(o.preventDefault(),AbstractSortableSelectItems.moveOptionDown(r)),"ArrowUp"===o.code&&o.altKey&&o.shiftKey&&(o.preventDefault(),AbstractSortableSelectItems.moveOptionToTop(r)),"ArrowDown"===o.code&&o.altKey&&o.shiftKey&&(o.preventDefault(),AbstractSortableSelectItems.moveOptionToBottom(r)),o.defaultPrevented&&(e.updateHiddenFieldValueFromSelect(r,l),t.markFieldAsChanged(i),t.validateField(i))})).bindTo(r)}}static moveOptionToTop(e){Array.from(e.querySelectorAll(":checked")).reverse().forEach((t=>{e.insertBefore(t,e.firstElementChild)}))}static moveOptionToBottom(e){e.querySelectorAll(":checked").forEach((t=>{e.insertBefore(t,null)}))}static moveOptionUp(e){const t=Array.from(e.children),o=Array.from(e.querySelectorAll(":checked"))
for(const r of o){if(0===t.indexOf(r)&&null===r.previousElementSibling)break
e.insertBefore(r,r.previousElementSibling)}}static moveOptionDown(e){const t=Array.from(e.children).reverse(),o=Array.from(e.querySelectorAll(":checked")).reverse()
for(const r of o){if(0===t.indexOf(r)&&null===r.nextElementSibling)break
e.insertBefore(r,r.nextElementSibling.nextElementSibling)}}static removeOption(t,o){const n=t.selectedIndex
t.querySelectorAll(":checked").forEach((n=>{const l=o.querySelector(r`option[value="${n.value}"]`)
null!==l&&(l.classList.remove("hidden"),l.disabled=!1,e.enableOptGroup(l)),t.removeChild(n)})),t.selectedIndex=n>0?n-1:0}}