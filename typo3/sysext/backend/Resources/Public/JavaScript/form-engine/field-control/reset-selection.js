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
import c from"@typo3/core/document-service.js";class r{controlElement=null;constructor(e){c.ready().then(()=>{this.controlElement=document.querySelector(e),this.controlElement!==null&&this.controlElement.addEventListener("click",this.registerClickHandler)})}registerClickHandler=e=>{e.preventDefault();const n=this.controlElement.dataset.itemName,o=JSON.parse(this.controlElement.dataset.selectedIndices),t=document.forms.namedItem("editform").querySelector('[name="'+n+'[]"]');t.selectedIndex=-1;for(const l of o)t.options[l].selected=!0}}export{r as default};
