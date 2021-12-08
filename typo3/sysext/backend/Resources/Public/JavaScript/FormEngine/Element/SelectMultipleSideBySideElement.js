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
define(["require","exports","TYPO3/CMS/Backend/FormEngine/Element/AbstractSortableSelectItems","TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Backend/FormEngine/Element/Extra/SelectBoxFilter"],(function(e,t,n,l,r,s){"use strict";class i extends n.AbstractSortableSelectItems{constructor(e,t){super(),this.selectedOptionsElement=null,this.availableOptionsElement=null,l.ready().then(n=>{this.selectedOptionsElement=n.getElementById(e),this.availableOptionsElement=n.getElementById(t),this.registerEventHandler()})}registerEventHandler(){this.registerSortableEventHandler(this.selectedOptionsElement),this.availableOptionsElement.addEventListener("click",e=>{const t=e.currentTarget,n=t.dataset.relatedfieldname;if(n){const e=t.dataset.exclusivevalues,l=t.querySelectorAll("option:checked");l.length>0&&l.forEach(t=>{r.setSelectOptionFromExternalSource(n,t.value,t.textContent,t.getAttribute("title"),e,t)})}}),new s(this.availableOptionsElement)}}return i}));