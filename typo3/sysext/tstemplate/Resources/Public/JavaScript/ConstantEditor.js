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
define(["jquery"],(function(t){"use strict";var e;!function(t){t.editIconSelector=".t3js-toggle",t.colorSelectSelector=".t3js-color-select",t.colorInputSelector=".t3js-color-input",t.formFieldsSelector=".tstemplate-constanteditor [data-form-update-fragment]"}(e||(e={}));return new class{constructor(){this.updateFormFragment=e=>{const o=t(e.currentTarget).attr("data-form-update-fragment");let r=document.forms[0].action;-1!==r.indexOf("#")&&(r=r.substring(0,r.indexOf("#"))),document.forms[0].action=r+"#"+o},this.changeProperty=e=>{const o=t(e.currentTarget),r=o.attr("rel"),c=t("#defaultTS-"+r),n=t("#userTS-"+r),l=t("#check-"+r),a=o.data("bsToggle");"edit"===a?(c.hide(),n.show(),n.find("input").css({background:"#fdf8bd"}),l.prop("disabled",!1).prop("checked",!0)):"undo"===a&&(n.hide(),c.show(),l.val("").prop("disabled",!0))},this.updateColorFromSelect=e=>{const o=t(e.currentTarget);let r=o.attr("rel"),c=o.val();t("#input-"+r).val(c),t("#colorbox-"+r).css({background:c})},this.updateColorFromInput=e=>{const o=t(e.currentTarget);let r=o.attr("rel"),c=o.val();t("#colorbox-"+r).css({background:c}),t("#select-"+r).children().each((t,e)=>{e.selected=e.value===c})},t(document).on("click",e.editIconSelector,this.changeProperty).on("change",e.colorSelectSelector,this.updateColorFromSelect).on("blur",e.colorInputSelector,this.updateColorFromInput).on("change",e.formFieldsSelector,this.updateFormFragment)}}}));