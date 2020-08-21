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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";var l;!function(e){e.toggleAll=".t3js-toggle-checkboxes",e.singleItem=".t3js-checkbox",e.revertSelection=".t3js-revert-selection"}(l||(l={}));class c{constructor(t){this.checkBoxId="",this.table=null,this.checkedBoxes=null,this.checkBoxId=t,e.ready().then(e=>{this.table=e.getElementById(t).closest("table"),this.checkedBoxes=this.table.querySelectorAll(l.singleItem+":checked"),this.enableTriggerCheckBox(),this.registerEventHandler()})}static allCheckBoxesAreChecked(e){const t=Array.from(e);return e.length===t.filter(e=>e.checked).length}registerEventHandler(){new t("change",(e,t)=>{const s=this.table.querySelectorAll(l.singleItem),h=!c.allCheckBoxesAreChecked(s);s.forEach(e=>{e.checked=h}),t.checked=h}).delegateTo(this.table,l.toggleAll),new t("change",this.setToggleAllState.bind(this)).delegateTo(this.table,l.singleItem),new t("click",()=>{const e=this.table.querySelectorAll(l.singleItem),t=Array.from(this.checkedBoxes);e.forEach(e=>{e.checked=t.includes(e)}),this.setToggleAllState()}).delegateTo(this.table,l.revertSelection)}setToggleAllState(){const e=this.table.querySelectorAll(l.singleItem);this.table.querySelector(l.toggleAll).checked=c.allCheckBoxesAreChecked(e)}enableTriggerCheckBox(){const e=this.table.querySelectorAll(l.singleItem);document.getElementById(this.checkBoxId).checked=c.allCheckBoxesAreChecked(e)}}return c}));