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
import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent";import DocumentService from"TYPO3/CMS/Core/DocumentService";import FormEngine from"TYPO3/CMS/Backend/FormEngine";class SelectSingleElement{constructor(){this.initialize=(e,t)=>{let n=document.querySelector(e);t=t||{},new RegularEvent("change",e=>{const t=e.target,n=t.parentElement.querySelector(".input-group-icon");null!==n&&(n.innerHTML=t.options[t.selectedIndex].dataset.icon);const i=t.closest(".t3js-formengine-field-item").querySelector(".t3js-forms-select-single-icons");if(null!==i){const e=i.querySelector(".item.active");null!==e&&e.classList.remove("active");const n=i.querySelector('[data-select-index="'+t.selectedIndex+'"]');null!==n&&n.closest(".item").classList.add("active")}}).bindTo(n),t.onChange instanceof Array?new RegularEvent("change",()=>{FormEngine.processOnFieldChange(t.onChange)}).bindTo(n):"function"==typeof t.onChange&&new RegularEvent("change",t.onChange).bindTo(n),new RegularEvent("click",(e,t)=>{const i=t.closest(".t3js-forms-select-single-icons").querySelector(".item.active");null!==i&&i.classList.remove("active"),n.selectedIndex=parseInt(t.dataset.selectIndex,10),n.dispatchEvent(new Event("change")),t.closest(".item").classList.add("active")}).delegateTo(n.closest(".form-control-wrap"),".t3js-forms-select-single-icons .item:not(.active) a")}}initializeOnReady(e,t){DocumentService.ready().then(()=>{this.initialize(e,t)})}}export default new SelectSingleElement;