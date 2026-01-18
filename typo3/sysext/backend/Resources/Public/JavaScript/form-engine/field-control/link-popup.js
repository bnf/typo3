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
import l from"@typo3/core/document-service.js";import r from"@typo3/backend/form-engine.js";import t from"@typo3/backend/modal.js";class m{controlElement=null;constructor(e){l.ready().then(()=>{this.controlElement=document.querySelector(e),this.controlElement!==null&&this.controlElement.addEventListener("click",this.handleControlClick)})}handleControlClick=e=>{e.preventDefault();const n=this.controlElement.dataset.itemName,o=this.controlElement.getAttribute("href")+"&P[currentValue]="+encodeURIComponent(document.forms.namedItem("editform")[n].value)+"&P[currentSelectedValues]="+encodeURIComponent(r.getFieldElement(n).val());t.advanced({type:t.types.iframe,content:o,size:t.sizes.large})}}export{m as default};
