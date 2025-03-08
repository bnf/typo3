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
var e
!function(e){e.append="append",e.replace="replace",e.prepend="prepend"}(e||(e={}))
export class ValuePicker extends HTMLElement{constructor(){super(),this.valuePicker=null,this.linkedField=null,this.initialValueSet=!1,this.onChange=()=>{this.setValue(),this.valuePicker.blur()},this.linkedFieldOnChange=()=>{null!==this.valuePicker&&(this.getInsertMode()===e.replace?this.selectValue(this.linkedField.value):this.valuePicker.selectedIndex=0)}
const i=document.createElement("slot")
i.addEventListener("slotchange",(()=>this.initializeValuePicker(i))),this.attachShadow({mode:"open"}).append(i)}connectedCallback(){this.linkedField=document.querySelector(this.getAttribute("linked-field")),this.linkedField?.addEventListener("change",this.linkedFieldOnChange),this.initializeValuePicker(this.shadowRoot.querySelector("slot"))}disconnectedCallback(){this.linkedField?.removeEventListener("change",this.linkedFieldOnChange),this.linkedField=null}initializeValuePicker(e){const i=e.assignedElements()[0]??null
if(null!==i&&"select"!==i.tagName.toLowerCase())throw new Error(`ValuePicker could not be initialized. Expected <select> child name, but found: ${i}`)
i!==this.valuePicker&&(this.valuePicker?.removeEventListener("change",this.onChange),this.valuePicker=i,this.valuePicker?.addEventListener("change",this.onChange),this.initialValueSet=!1),this.setInitialPickerValue()}setInitialPickerValue(){if(null!==this.linkedField&&null!==this.valuePicker&&!this.initialValueSet&&this.getInsertMode()===e.replace){const e=document.getElementsByName(this.linkedField.dataset.formengineInputName)[0]??null
null!==e&&(this.selectValue(e.value),this.initialValueSet=!0)}}selectValue(e){this.valuePicker.selectedIndex=Array.from(this.valuePicker.options).findIndex((i=>i.value===e))}getInsertMode(){return this.getAttribute("mode")??e.replace}setValue(){const i=this.valuePicker.options[this.valuePicker.selectedIndex].value
switch(this.getInsertMode()){case e.append:this.linkedField.value+=i
break
case e.prepend:this.linkedField.value=i+this.linkedField.value
break
default:this.linkedField.value=i}this.linkedField.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))}}window.customElements.define("typo3-formengine-valuepicker",ValuePicker)
