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
export default class{constructor(o){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault()
const o=this.controlElement.dataset.element,r=JSON.parse(this.controlElement.dataset.clipboardItems)
for(const l of r)t.setSelectOptionFromExternalSource(o,l.value,l.title,l.title)},e.ready().then((()=>{this.controlElement=document.querySelector(o),this.controlElement.addEventListener("click",this.registerClickHandler)}))}}