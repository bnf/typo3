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
define(["jquery"],(function(e){"use strict";var t;!function(e){e.editIconSelector=".t3js-toggle",e.colorSelectSelector=".t3js-color-select",e.colorInputSelector=".t3js-color-input"}(t||(t={}));return new class{constructor(){this.changeProperty=t=>{const o=e(t.currentTarget),r=o.attr("rel"),c=e("#defaultTS-"+r),l=e("#userTS-"+r),n=e("#check-"+r),s=o.data("toggle");"edit"===s?(c.hide(),l.show(),l.find("input").css({background:"#fdf8bd"}),n.prop("disabled",!1).prop("checked",!0)):"undo"===s&&(l.hide(),c.show(),n.val("").prop("disabled",!0))},this.updateColorFromSelect=t=>{const o=e(t.currentTarget);let r=o.attr("rel"),c=o.val();e("#input-"+r).val(c),e("#colorbox-"+r).css({background:c})},this.updateColorFromInput=t=>{const o=e(t.currentTarget);let r=o.attr("rel"),c=o.val();e("#colorbox-"+r).css({background:c}),e("#select-"+r).children().each((e,t)=>{t.selected=t.value===c})},e(document).on("click",t.editIconSelector,this.changeProperty).on("change",t.colorSelectSelector,this.updateColorFromSelect).on("blur",t.colorInputSelector,this.updateColorFromInput)}}}));