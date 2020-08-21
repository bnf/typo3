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
define(["jquery"],(function(e){"use strict";var t;!function(e){e.fieldContainerSelector=".t3js-formengine-field-group",e.filterTextFieldSelector=".t3js-formengine-multiselect-filter-textfield",e.filterSelectFieldSelector=".t3js-formengine-multiselect-filter-dropdown"}(t||(t={}));return class{constructor(e){this.selectElement=null,this.filterText="",this.$availableOptions=null,this.selectElement=e,this.initializeEvents()}initializeEvents(){const e=this.selectElement.closest(".form-wizards-element");null!==e&&(e.addEventListener("keyup",e=>{e.target.matches(t.filterTextFieldSelector)&&this.filter(e.target.value)}),e.addEventListener("change",e=>{e.target.matches(t.filterSelectFieldSelector)&&this.filter(e.target.value)}))}filter(t){this.filterText=t,this.$availableOptions||(this.$availableOptions=e(this.selectElement).find("option").clone()),this.selectElement.innerHTML="";const i=new RegExp(t,"i");this.$availableOptions.each((e,l)=>{(0===t.length||l.textContent.match(i))&&this.selectElement.appendChild(l)})}}}));