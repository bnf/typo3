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
import e from"@typo3/backend/modal.js"
import t from"@typo3/core/document-service.js"
import i from"@typo3/backend/date-time-picker.js"
import"@typo3/backend/input/clearable.js"
import{MessageUtility as a}from"@typo3/backend/utility/message-utility.js"
export default new class{constructor(){this.clearableElements=null,this.dateTimePickerElements=null,this.elementBrowserElements=null,t.ready().then((()=>{this.clearableElements=document.querySelectorAll(".t3js-clearable"),this.dateTimePickerElements=document.querySelectorAll(".t3js-datetimepicker"),this.elementBrowserElements=document.querySelectorAll(".t3js-element-browser"),this.initializeClearableElements(),this.initializeDateTimePickerElements(),this.initializeElementBrowserElements(),this.initializeElementBrowserEventListener()}))}initializeClearableElements(){this.clearableElements.forEach((e=>e.clearable()))}initializeDateTimePickerElements(){this.dateTimePickerElements.forEach((e=>i.initialize(e)))}initializeElementBrowserElements(){this.elementBrowserElements.forEach((t=>{const i=document.getElementById(t.dataset.triggerFor)
t.dataset.params=i.name+"|||pages",t.addEventListener("click",(t=>{t.preventDefault()
const i=t.currentTarget
e.advanced({type:e.types.iframe,content:i.dataset.target+"&mode="+i.dataset.mode+"&bparams="+i.dataset.params,size:e.sizes.large})}))}))}initializeElementBrowserEventListener(){window.addEventListener("message",(e=>{if(!a.verifyOrigin(e.origin)||"typo3:elementBrowser:elementAdded"!==e.data.actionName||"string"!=typeof e.data.fieldName||"string"!=typeof e.data.value)return
const t=document.querySelector('input[name="'+e.data.fieldName+'"]')
t&&(t.value=e.data.value.split("_").pop())}))}}
