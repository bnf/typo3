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
import{AbstractSortableSelectItems}from"./AbstractSortableSelectItems";import DocumentService from"TYPO3/CMS/Core/DocumentService";import FormEngine from"TYPO3/CMS/Backend/FormEngine";import SelectBoxFilter from"./Extra/SelectBoxFilter";class SelectMultipleSideBySideElement extends AbstractSortableSelectItems{constructor(e,t){super(),this.selectedOptionsElement=null,this.availableOptionsElement=null,DocumentService.ready().then(l=>{this.selectedOptionsElement=l.getElementById(e),this.availableOptionsElement=l.getElementById(t),this.registerEventHandler()})}registerEventHandler(){this.registerSortableEventHandler(this.selectedOptionsElement),this.availableOptionsElement.addEventListener("click",e=>{const t=e.currentTarget,l=t.dataset.relatedfieldname;if(l){const e=t.dataset.exclusivevalues,n=t.querySelectorAll("option:checked");n.length>0&&n.forEach(t=>{FormEngine.setSelectOptionFromExternalSource(l,t.value,t.textContent,t.getAttribute("title"),e,t)})}}),new SelectBoxFilter(this.availableOptionsElement)}}export default SelectMultipleSideBySideElement;