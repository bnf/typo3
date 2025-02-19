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
import{AbstractSortableSelectItems as e}from"@typo3/backend/form-engine/element/abstract-sortable-select-items.js";import t from"@typo3/core/document-service.js";import n from"@typo3/backend/form-engine.js";import l from"@typo3/backend/form-engine/element/extra/select-box-filter.js";import i from"@typo3/core/event/regular-event.js";import s from"@typo3/backend/utility.js";class r extends e{constructor(e,n){super(),this.selectedOptionsElement=null,this.availableOptionsElement=null,t.ready().then((t=>{this.selectedOptionsElement=t.getElementById(e),this.availableOptionsElement=t.getElementById(n),null!==this.selectedOptionsElement&&null!==this.availableOptionsElement&&this.registerEventHandler()}))}registerEventHandler(){this.registerSortableEventHandler(this.selectedOptionsElement),this.registerKeyboardEvents(),this.availableOptionsElement.addEventListener("click",(e=>{const t=e.currentTarget;this.handleOptionChecked(t)})),new l(this.availableOptionsElement)}handleOptionChecked(e){const t=e.dataset.relatedfieldname;if(t){const l=s.trimExplode(",",e.dataset?.exclusivevalues??""),i=e.querySelectorAll("option:checked");i.length>0&&i.forEach((e=>{n.setSelectOptionFromExternalSource(t,e.value,e.textContent,e.getAttribute("title"),l,e)}))}}registerKeyboardEvents(){new i("keydown",(e=>{const t=e.currentTarget;"Enter"===e.code&&(e.preventDefault(),this.handleOptionChecked(t))})).bindTo(this.availableOptionsElement)}}export{r as default};