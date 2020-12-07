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
define(["TYPO3/CMS/Core/Event/RegularEvent"],(function(e){"use strict";return new class{constructor(){this.initialize=(t,n)=>{let s=document.querySelector(t);n=n||{},new e("change",e=>{const t=e.target,n=t.parentElement.querySelector(".input-group-icon");null!==n&&(n.innerHTML=t.options[t.selectedIndex].dataset.icon);const s=t.closest(".t3js-formengine-field-item").querySelector(".t3js-forms-select-single-icons");if(null!==s){const e=s.querySelector(".item.active");null!==e&&e.classList.remove("active");const n=s.querySelector('[data-select-index="'+t.selectedIndex+'"]');null!==n&&n.closest(".item").classList.add("active")}}).bindTo(s),"function"==typeof n.onChange&&new e("change",n.onChange).bindTo(s),"function"==typeof n.onFocus&&new e("focus",n.onFocus).bindTo(s),new e("click",(e,t)=>{const n=t.closest(".t3js-forms-select-single-icons").querySelector(".item.active");null!==n&&n.classList.remove("active"),s.selectedIndex=parseInt(t.dataset.selectIndex,10),s.dispatchEvent(new Event("change")),t.closest(".item").classList.add("active")}).delegateTo(s.closest(".form-control-wrap"),".t3js-forms-select-single-icons .item:not(.active) a")}}}}));