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
import e from"@typo3/core/document-service.js";import t from"@typo3/core/event/throttle-event.js";var i;!function(e){e.integer="integer",e.decimal="decimal"}(i||(i={}));class a extends HTMLElement{constructor(){super(...arguments),this.valueSlider=null,this.handleRangeChange=e=>{const t=e.target;this.updateValue(t),this.updateTooltipValue(t)}}async connectedCallback(){await e.ready(),this.valueSlider=this.querySelector("input"),null!==this.valueSlider&&new t("input",this.handleRangeChange,25).bindTo(this.valueSlider)}updateValue(e){const t=document.querySelector(this.getAttribute("linked-field"));t.value=e.value,t.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))}updateTooltipValue(e){let t;const a=e.value;switch(this.getAttribute("format")){case i.decimal:t=parseFloat(a).toFixed(Number(this.getAttribute("precision"))||2);break;case i.integer:default:t=parseInt(a,10)}e.title=t.toString()}}window.customElements.define("typo3-formengine-valueslider",a);export{a as ValueSlider};