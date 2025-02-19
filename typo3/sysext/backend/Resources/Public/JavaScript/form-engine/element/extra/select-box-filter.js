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
import e from"@typo3/core/event/regular-event.js";var t;!function(e){e.fieldContainerSelector=".t3js-formengine-field-group",e.filterTextFieldSelector=".t3js-formengine-multiselect-filter-textfield",e.filterSelectFieldSelector=".t3js-formengine-multiselect-filter-dropdown"}(t||(t={}));class l{constructor(e){this.selectElement=null,this.availableOptions=null,this.selectElement=e,this.initializeEvents()}static toggleOptGroup(e){const t=e.parentElement;t instanceof HTMLOptGroupElement&&(0===t.querySelectorAll("option:not([hidden]):not([disabled]):not(.hidden)").length?t.hidden=!0:(t.hidden=!1,t.disabled=!1,t.classList.remove("hidden")))}initializeEvents(){const l=this.selectElement.closest(".form-wizards-wrap");null!==l&&(new e("input",(e=>{this.filter(e.target.value)})).delegateTo(l,t.filterTextFieldSelector),new e("change",(e=>{this.filter(e.target.value)})).delegateTo(l,t.filterSelectFieldSelector))}filter(e){null===this.availableOptions&&(this.availableOptions=this.selectElement.querySelectorAll("option"));const t=new RegExp(e,"i");this.availableOptions.forEach((i=>{i.hidden=e.length>0&&null===i.textContent.match(t),l.toggleOptGroup(i)}))}}export{l as default};