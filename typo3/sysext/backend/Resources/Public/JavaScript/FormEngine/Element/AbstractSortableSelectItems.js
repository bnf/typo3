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
define(["TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Backend/FormEngineValidation"],(function(e,t){"use strict";class o{constructor(){this.registerSortableEventHandler=n=>{const i=n.closest(".form-wizards-wrap").querySelector(".form-wizards-items-aside");null!==i&&i.addEventListener("click",i=>{let r;if(null===(r=i.target.closest(".t3js-btn-option")))return void(i.target.matches(".t3js-btn-option")&&(r=i.target));i.preventDefault();const l=r.dataset.fieldname,s=e.getFieldElement(l).get(0),a=e.getFieldElement(l,"_avail").get(0);r.classList.contains("t3js-btn-moveoption-top")?o.moveOptionToTop(n):r.classList.contains("t3js-btn-moveoption-up")?o.moveOptionUp(n):r.classList.contains("t3js-btn-moveoption-down")?o.moveOptionDown(n):r.classList.contains("t3js-btn-moveoption-bottom")?o.moveOptionToBottom(n):r.classList.contains("t3js-btn-removeoption")&&o.removeOption(n,a),e.updateHiddenFieldValueFromSelect(n,s),e.legacyFieldChangedCb(),t.markFieldAsChanged(a),t.validateField(a)})}}static moveOptionToTop(e){Array.from(e.querySelectorAll(":checked")).reverse().forEach(t=>{e.insertBefore(t,e.firstElementChild)})}static moveOptionToBottom(e){e.querySelectorAll(":checked").forEach(t=>{e.insertBefore(t,null)})}static moveOptionUp(e){const t=Array.from(e.children),o=Array.from(e.querySelectorAll(":checked"));for(let n of o){if(0===t.indexOf(n)&&null===n.previousElementSibling)break;e.insertBefore(n,n.previousElementSibling)}}static moveOptionDown(e){const t=Array.from(e.children).reverse(),o=Array.from(e.querySelectorAll(":checked")).reverse();for(let n of o){if(0===t.indexOf(n)&&null===n.nextElementSibling)break;e.insertBefore(n,n.nextElementSibling.nextElementSibling)}}static removeOption(e,t){e.querySelectorAll(":checked").forEach(o=>{const n=t.querySelector('option[value="'+o.value+'"]');null!==n&&(n.classList.remove("hidden"),n.disabled=!1),e.removeChild(o)})}}return{AbstractSortableSelectItems:o}}));