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
import l from"@typo3/core/document-service.js";import n from"@typo3/backend/form-engine.js";class s{controlElement=null;constructor(e){l.ready().then(()=>{this.controlElement=document.querySelector(e),this.controlElement.addEventListener("click",this.registerClickHandler)})}registerClickHandler=e=>{e.preventDefault();const r=this.controlElement.dataset.element,o=JSON.parse(this.controlElement.dataset.clipboardItems);for(const t of o)n.setSelectOptionFromExternalSource(r,t.value,t.title,t.title)}}export{s as default};
