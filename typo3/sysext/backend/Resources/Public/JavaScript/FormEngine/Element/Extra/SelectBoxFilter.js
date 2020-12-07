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
define(["TYPO3/CMS/Core/Event/RegularEvent"],(function(e){"use strict";var t;!function(e){e.fieldContainerSelector=".t3js-formengine-field-group",e.filterTextFieldSelector=".t3js-formengine-multiselect-filter-textfield",e.filterSelectFieldSelector=".t3js-formengine-multiselect-filter-dropdown"}(t||(t={}));return class{constructor(e){this.selectElement=null,this.filterText="",this.availableOptions=null,this.selectElement=e,this.initializeEvents()}initializeEvents(){const l=this.selectElement.closest(".form-wizards-element");null!==l&&(new e("input",e=>{this.filter(e.target.value)}).delegateTo(l,t.filterTextFieldSelector),new e("change",e=>{this.filter(e.target.value)}).delegateTo(l,t.filterSelectFieldSelector))}filter(e){this.filterText=e,null===this.availableOptions&&(this.availableOptions=this.selectElement.querySelectorAll("option"));const t=new RegExp(e,"i");this.availableOptions.forEach(l=>{l.hidden=e.length>0&&null===l.textContent.match(t)})}}}));