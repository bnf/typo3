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
define(["jquery","TYPO3/CMS/Backend/FormEngine"],(function(e,t){"use strict";var l;!function(e){e.toggleAll=".t3js-toggle-checkboxes",e.singleItem=".t3js-checkbox",e.revertSelection=".t3js-revert-selection"}(l||(l={}));class c{constructor(t){this.checkBoxId="",this.$table=null,this.checkedBoxes=null,this.checkBoxId=t,e(()=>{this.$table=e("#"+t).closest("table"),this.checkedBoxes=this.$table.find(l.singleItem+":checked"),this.enableTriggerCheckBox(),this.registerEventHandler()})}static allCheckBoxesAreChecked(e){return e.length===e.filter(":checked").length}registerEventHandler(){this.$table.on("change",l.toggleAll,s=>{const i=e(s.currentTarget),h=this.$table.find(l.singleItem),n=!c.allCheckBoxesAreChecked(h);h.prop("checked",n),i.prop("checked",n),t.Validation.markFieldAsChanged(i)}).on("change",l.singleItem,()=>{this.setToggleAllState()}).on("click",l.revertSelection,()=>{this.$table.find(l.singleItem).each((e,t)=>{t.checked=this.checkedBoxes.index(t)>-1}),this.setToggleAllState()})}setToggleAllState(){const e=this.$table.find(l.singleItem),t=c.allCheckBoxesAreChecked(e);this.$table.find(l.toggleAll).prop("checked",t)}enableTriggerCheckBox(){const t=this.$table.find(l.singleItem),s=c.allCheckBoxesAreChecked(t);e("#"+this.checkBoxId).prop("checked",s)}}return c}));