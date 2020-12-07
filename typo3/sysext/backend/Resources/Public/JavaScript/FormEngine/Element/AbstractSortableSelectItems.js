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
define(["jquery","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Backend/FormEngineValidation"],(function(e,t,o){"use strict";class n{constructor(){this.registerSortableEventHandler=r=>{const i=r.closest(".form-wizards-wrap").querySelector(".form-wizards-items-aside");null!==i&&i.addEventListener("click",i=>{let l;if(null===(l=i.target.closest(".t3js-btn-option")))return void(i.target.matches(".t3js-btn-option")&&(l=i.target));i.preventDefault();const s=l.dataset.fieldname;l.classList.contains("t3js-btn-moveoption-top")?n.moveOptionToTop(r):l.classList.contains("t3js-btn-moveoption-up")?n.moveOptionUp(r):l.classList.contains("t3js-btn-moveoption-down")?n.moveOptionDown(r):l.classList.contains("t3js-btn-moveoption-bottom")?n.moveOptionToBottom(r):l.classList.contains("t3js-btn-removeoption")&&n.removeOption(r,t.getFieldElement(s,"_avail").get(0)),t.updateHiddenFieldValueFromSelect(r,t.getFieldElement(s).get(0)),t.legacyFieldChangedCb(),o.markFieldAsChanged(e(r)),o.validate()})}}static moveOptionToTop(e){Array.from(e.querySelectorAll(":checked")).reverse().forEach(t=>{e.insertBefore(t,e.firstElementChild)})}static moveOptionToBottom(e){e.querySelectorAll(":checked").forEach(t=>{e.insertBefore(t,null)})}static moveOptionUp(e){const t=Array.from(e.children),o=Array.from(e.querySelectorAll(":checked"));for(let n of o){if(0===t.indexOf(n)&&null===n.previousElementSibling)break;e.insertBefore(n,n.previousElementSibling)}}static moveOptionDown(e){const t=Array.from(e.children).reverse(),o=Array.from(e.querySelectorAll(":checked")).reverse();for(let n of o){if(0===t.indexOf(n)&&null===n.nextElementSibling)break;e.insertBefore(n,n.nextElementSibling.nextElementSibling)}}static removeOption(e,t){e.querySelectorAll(":checked").forEach(o=>{const n=t.querySelector('option[value="'+o.value+'"]');null!==n&&(n.classList.remove("hidden"),n.disabled=!1),e.removeChild(o)})}}return{AbstractSortableSelectItems:n}}));