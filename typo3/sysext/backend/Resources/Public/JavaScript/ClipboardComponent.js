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
define((function(){"use strict";class e{static setCheckboxValue(e,t){const s="CBC["+e+"]",c=document.querySelector('form[name="dblistForm"] [name="'+s+'"]');null!==c&&(c.checked=t)}constructor(){this.registerCheckboxTogglers()}registerCheckboxTogglers(){const t="a.t3js-toggle-all-checkboxes";document.addEventListener("click",s=>{let c,r=s.target;if(!r.matches(t)){let e=r.closest(t);if(null===e)return;r=e}s.preventDefault(),""===r.getAttribute("rel")?(r.setAttribute("rel","allChecked"),c=!0):(r.setAttribute("rel",""),c=!1);const l=r.dataset.checkboxesNames.split(",");for(let t of l)e.setCheckboxValue(t,c)})}}return new e}));