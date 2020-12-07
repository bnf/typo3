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
define((function(){"use strict";var e;!function(e){e.append="append",e.replace="replace",e.prepend="prepend"}(e||(e={}));class t extends HTMLElement{constructor(){super(...arguments),this.onChange=()=>{this.setValue(),this.valuePicker.selectedIndex=0,this.valuePicker.blur()}}connectedCallback(){this.valuePicker=this.querySelector("select"),null!==this.valuePicker&&this.valuePicker.addEventListener("change",this.onChange)}disconnectedCallback(){null!==this.valuePicker&&(this.valuePicker.removeEventListener("change",this.onChange),this.valuePicker=null)}setValue(){var t;const n=this.valuePicker.options[this.valuePicker.selectedIndex].value,l=document.querySelector(this.getAttribute("linked-field")),i=null!==(t=this.getAttribute("mode"))&&void 0!==t?t:e.replace;i===e.append?l.value+=n:i===e.prepend?l.value=n+l.value:l.value=n,l.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))}}return window.customElements.define("typo3-formengine-valuepicker",t),{ValuePicker:t}}));