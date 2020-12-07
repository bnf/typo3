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
define(["jquery","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Backend/FormEngineValidation"],(function(e,t,o){"use strict";class n{constructor(){this.registerSortableEventHandler=i=>{const r=i.closest(".form-wizards-wrap").querySelector(".form-wizards-items-aside");null!==r&&r.addEventListener("click",r=>{let l;if(null===(l=r.target.closest(".t3js-btn-option")))return void(r.target.matches(".t3js-btn-option")&&(l=r.target));r.preventDefault();const s=l.dataset.fieldname;l.classList.contains("t3js-btn-moveoption-top")?n.moveOptionToTop(i):l.classList.contains("t3js-btn-moveoption-up")?n.moveOptionUp(i):l.classList.contains("t3js-btn-moveoption-down")?n.moveOptionDown(i):l.classList.contains("t3js-btn-moveoption-bottom")?n.moveOptionToBottom(i):l.classList.contains("t3js-btn-removeoption")&&n.removeOption(i,t.getFieldElement(s,"_avail").get(0)),t.updateHiddenFieldValueFromSelect(i,t.getFieldElement(s).get(0)),t.legacyFieldChangedCb(),o.markFieldAsChanged(e(i)),o.validateField(i)})}}static moveOptionToTop(e){Array.from(e.querySelectorAll(":checked")).reverse().forEach(t=>{e.insertBefore(t,e.firstElementChild)})}static moveOptionToBottom(e){e.querySelectorAll(":checked").forEach(t=>{e.insertBefore(t,null)})}static moveOptionUp(e){const t=Array.from(e.children),o=Array.from(e.querySelectorAll(":checked"));for(let n of o){if(0===t.indexOf(n)&&null===n.previousElementSibling)break;e.insertBefore(n,n.previousElementSibling)}}static moveOptionDown(e){const t=Array.from(e.children).reverse(),o=Array.from(e.querySelectorAll(":checked")).reverse();for(let n of o){if(0===t.indexOf(n)&&null===n.nextElementSibling)break;e.insertBefore(n,n.nextElementSibling.nextElementSibling)}}static removeOption(e,t){e.querySelectorAll(":checked").forEach(o=>{const n=t.querySelector('option[value="'+o.value+'"]');null!==n&&(n.classList.remove("hidden"),n.disabled=!1),e.removeChild(o)})}}return{AbstractSortableSelectItems:n}}));