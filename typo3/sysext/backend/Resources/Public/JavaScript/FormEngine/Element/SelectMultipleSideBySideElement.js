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
define(["./AbstractSortableSelectItems","TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine","./Extra/SelectBoxFilter"],(function(e,t,l,n){"use strict";class s extends e.AbstractSortableSelectItems{constructor(e,l){super(),this.selectedOptionsElement=null,this.availableOptionsElement=null,t.ready().then(t=>{this.selectedOptionsElement=t.getElementById(e),this.availableOptionsElement=t.getElementById(l),this.registerEventHandler()})}registerEventHandler(){this.registerSortableEventHandler(this.selectedOptionsElement),this.availableOptionsElement.addEventListener("click",e=>{const t=e.currentTarget,n=t.dataset.relatedfieldname;if(n){const e=t.dataset.exclusivevalues,s=t.querySelectorAll("option:checked");s.length>0&&s.forEach(t=>{l.setSelectOptionFromExternalSource(n,t.value,t.textContent,t.getAttribute("title"),e,t)})}}),new n(this.availableOptionsElement)}}return s}));