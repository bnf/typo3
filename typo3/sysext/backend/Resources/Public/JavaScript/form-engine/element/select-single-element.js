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
import e from"@typo3/core/event/regular-event.js";import t from"@typo3/core/document-service.js";import i from"@typo3/backend/form-engine.js";import{selector as n}from"@typo3/core/literals.js";var o=new class{constructor(){this.initialize=(t,o)=>{const s=document.querySelector(t);null!==s&&(o=o||{},new e("change",(e=>{const t=e.target,i=t.parentElement.querySelector(".input-group-icon");null!==i&&(i.innerHTML=t.options[t.selectedIndex].dataset.icon);const o=t.closest(".t3js-formengine-field-item").querySelector(".t3js-forms-select-single-icons");if(null!==o){const e=o.querySelector(".form-wizard-icon-list-item a.active");null!==e&&e.classList.remove("active");const i=o.querySelector(n`[data-select-index="${t.selectedIndex.toString(10)}"]`);null!==i&&i.closest(".form-wizard-icon-list-item a").classList.add("active")}})).bindTo(s),o.onChange instanceof Array&&new e("change",(()=>i.processOnFieldChange(o.onChange))).bindTo(s),new e("click",((e,t)=>{const i=t.closest(".t3js-forms-select-single-icons").querySelector(".form-wizard-icon-list-item a.active");null!==i&&i.classList.remove("active"),s.selectedIndex=parseInt(t.dataset.selectIndex,10),s.dispatchEvent(new Event("change")),t.closest(".form-wizard-icon-list-item a").classList.add("active")})).delegateTo(s.closest(".form-control-wrap"),".t3js-forms-select-single-icons .form-wizard-icon-list-item a:not(.active)"))}}initializeOnReady(e,i){t.ready().then((()=>{this.initialize(e,i)}))}};export{o as default};