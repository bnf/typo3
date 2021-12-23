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
import FormEngine from"TYPO3/CMS/Backend/FormEngine.esm.js";import FormEngineValidation from"TYPO3/CMS/Backend/FormEngineValidation.esm.js";export class AbstractSortableSelectItems{constructor(){this.registerSortableEventHandler=e=>{const t=e.closest(".form-wizards-wrap").querySelector(".form-wizards-items-aside");null!==t&&t.addEventListener("click",t=>{let o;if(null===(o=t.target.closest(".t3js-btn-option")))return void(t.target.matches(".t3js-btn-option")&&(o=t.target));t.preventDefault();const n=o.dataset.fieldname,r=FormEngine.getFieldElement(n).get(0),i=FormEngine.getFieldElement(n,"_avail").get(0);o.classList.contains("t3js-btn-moveoption-top")?AbstractSortableSelectItems.moveOptionToTop(e):o.classList.contains("t3js-btn-moveoption-up")?AbstractSortableSelectItems.moveOptionUp(e):o.classList.contains("t3js-btn-moveoption-down")?AbstractSortableSelectItems.moveOptionDown(e):o.classList.contains("t3js-btn-moveoption-bottom")?AbstractSortableSelectItems.moveOptionToBottom(e):o.classList.contains("t3js-btn-removeoption")&&AbstractSortableSelectItems.removeOption(e,i),FormEngine.updateHiddenFieldValueFromSelect(e,r),FormEngine.legacyFieldChangedCb(),FormEngineValidation.markFieldAsChanged(i),FormEngineValidation.validateField(i)})}}static moveOptionToTop(e){Array.from(e.querySelectorAll(":checked")).reverse().forEach(t=>{e.insertBefore(t,e.firstElementChild)})}static moveOptionToBottom(e){e.querySelectorAll(":checked").forEach(t=>{e.insertBefore(t,null)})}static moveOptionUp(e){const t=Array.from(e.children),o=Array.from(e.querySelectorAll(":checked"));for(let n of o){if(0===t.indexOf(n)&&null===n.previousElementSibling)break;e.insertBefore(n,n.previousElementSibling)}}static moveOptionDown(e){const t=Array.from(e.children).reverse(),o=Array.from(e.querySelectorAll(":checked")).reverse();for(let n of o){if(0===t.indexOf(n)&&null===n.nextElementSibling)break;e.insertBefore(n,n.nextElementSibling.nextElementSibling)}}static removeOption(e,t){e.querySelectorAll(":checked").forEach(o=>{const n=t.querySelector('option[value="'+o.value+'"]');null!==n&&(n.classList.remove("hidden"),n.disabled=!1),e.removeChild(o)})}}