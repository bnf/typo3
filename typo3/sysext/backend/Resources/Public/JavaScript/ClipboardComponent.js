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
define((function(){"use strict";class e{static setCheckboxValue(e,t){const c="CBC["+e+"]",s=document.querySelector('input[name="'+c+'"]');null!==s&&(s.checked=t)}constructor(){this.registerCheckboxTogglers()}registerCheckboxTogglers(){const t=".t3js-toggle-all-checkboxes";document.addEventListener("click",c=>{let s,n=c.target;if(!n.matches(t)){let e=n.closest(t);if(null===e)return;n=e}c.preventDefault(),"checked"in n.dataset&&"none"!==n.dataset.checked?(n.dataset.checked="none",s=!1):(n.dataset.checked="all",s=!0);const o=n.dataset.checkboxesNames.split(",");for(let t of o)e.setCheckboxValue(t,s)})}}return new e}));