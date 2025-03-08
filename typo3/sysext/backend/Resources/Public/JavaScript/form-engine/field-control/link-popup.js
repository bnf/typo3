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
import e from"@typo3/core/document-service.js"
import t from"@typo3/backend/form-engine.js"
import o from"@typo3/backend/modal.js"
export default class{constructor(n){this.controlElement=null,this.handleControlClick=e=>{e.preventDefault()
const n=this.controlElement.dataset.itemName,l=this.controlElement.getAttribute("href")+"&P[currentValue]="+encodeURIComponent(document.forms.namedItem("editform")[n].value)+"&P[currentSelectedValues]="+encodeURIComponent(t.getFieldElement(n).val())
o.advanced({type:o.types.iframe,content:l,size:o.sizes.large})},e.ready().then((()=>{this.controlElement=document.querySelector(n),null!==this.controlElement&&this.controlElement.addEventListener("click",this.handleControlClick)}))}}