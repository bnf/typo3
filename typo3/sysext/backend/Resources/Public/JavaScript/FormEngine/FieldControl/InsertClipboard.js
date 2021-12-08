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
import DocumentService from"TYPO3/CMS/Core/DocumentService.js";import FormEngine from"TYPO3/CMS/Backend/FormEngine.js";class InsertClipboard{constructor(e){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault();const t=this.controlElement.dataset.element,r=JSON.parse(this.controlElement.dataset.clipboardItems);for(let e of r)FormEngine.setSelectOptionFromExternalSource(t,e.value,e.title,e.title)},DocumentService.ready().then(()=>{this.controlElement=document.querySelector(e),this.controlElement.addEventListener("click",this.registerClickHandler)})}}export default InsertClipboard;