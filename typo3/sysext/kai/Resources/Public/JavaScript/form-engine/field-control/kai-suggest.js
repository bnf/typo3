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
import d from"@typo3/core/document-service.js";import s from"@typo3/backend/form-engine-validation.js";import r from"@typo3/core/ajax/ajax-request.js";import o from"@typo3/backend/notification.js";class c{constructor(t){this.controlElement=null,this.humanReadableField=null,this.hiddenField=null,console.log("kai2",t),d.ready().then(()=>{this.controlElement=document.getElementById(t),this.humanReadableField=document.querySelector('[data-formengine-input-name="'+this.controlElement.dataset.itemName+'"]'),this.hiddenField=document.querySelector('[name="'+this.controlElement.dataset.itemName+'"]');const{site:n}=this.controlElement.dataset,i=this.controlElement.dataset.itemName.replace(/.*\[([^\]]+)\]$/,"$1");this.controlElement.addEventListener("click",e=>this.suggest(e,n,i))})}async suggest(t,n,i){t.preventDefault();let e;try{const l=await(await new r(TYPO3.settings.ajaxUrls.kai_suggest).post({site:n,fieldName:i},{headers:{"Content-Type":"application/json"}})).resolve();if(l.status!=="ok")throw new Error("Status not ok");e=l.result}catch(a){o.error("Value could not be generated"),console.error(a);return}if(o.success(e.content.notificationTitle,e.content.notificationMessage),this.hiddenField.parentElement.tagName==="TYPO3-RTE-CKEDITOR-CKEDITOR5"){const{editor:a}=this.hiddenField.parentElement;a.setData(e.content.value)}else this.humanReadableField&&(this.humanReadableField.value=e.content.value,this.humanReadableField.dispatchEvent(new Event("change")),this.humanReadableField.value=this.hiddenField.value,s.validateField(this.humanReadableField),s.markFieldAsChanged(this.humanReadableField))}}export{c as default};
