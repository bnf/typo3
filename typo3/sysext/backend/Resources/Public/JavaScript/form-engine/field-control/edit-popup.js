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
import o from"@typo3/core/document-service.js";class l{controlElement=null;assignedFormField=null;constructor(e){o.ready().then(()=>{this.controlElement=document.querySelector(e),this.assignedFormField=document.querySelector('select[data-formengine-input-name="'+this.controlElement.dataset.element+'"]'),this.assignedFormField.options.selectedIndex===-1&&this.controlElement.classList.add("disabled"),this.assignedFormField.addEventListener("change",this.registerChangeHandler),this.controlElement.addEventListener("click",this.registerClickHandler)})}registerChangeHandler=()=>{this.controlElement.classList.toggle("disabled",this.assignedFormField.options.selectedIndex===-1)};registerClickHandler=e=>{e.preventDefault();const n=[];for(let t=0;t<this.assignedFormField.selectedOptions.length;++t){const i=this.assignedFormField.selectedOptions.item(t);n.push(i.value)}const s=this.controlElement.getAttribute("href")+"&P[currentValue]="+encodeURIComponent(this.assignedFormField.value)+"&P[currentSelectedValues]="+n.join(",");window.open(s,"",this.controlElement.dataset.windowParameters).focus()}}export{l as default};
