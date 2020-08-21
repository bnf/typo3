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
define(["./AbstractSortableSelectItems","jquery","TYPO3/CMS/Backend/FormEngine","./Extra/SelectBoxFilter"],(function(e,t,l,n){"use strict";class s extends e.AbstractSortableSelectItems{constructor(e,l){super(),this.selectedOptionsElement=null,this.availableOptionsElement=null,t(()=>{this.selectedOptionsElement=document.getElementById(e),this.availableOptionsElement=document.getElementById(l),this.registerEventHandler()})}registerEventHandler(){this.registerSortableEventHandler(this.selectedOptionsElement),this.availableOptionsElement.addEventListener("click",e=>{const n=e.currentTarget,s=n.dataset.relatedfieldname;if(s){const e=n.dataset.exclusiveValues,i=n.querySelectorAll("option:checked");i.length>0&&i.forEach(n=>{l.setSelectOptionFromExternalSource(s,n.value,n.textContent,n.getAttribute("title"),e,t(n))})}}),new n(this.availableOptionsElement)}}return s}));