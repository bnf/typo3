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
define(["jquery","TYPO3/CMS/Backend/Input/Clearable"],(function(t){"use strict";return new class{constructor(){this.form=null,this.limitField=null,this.initialize()}initialize(){this.form=t('form[name="queryform"]'),this.limitField=t("#queryLimit"),this.form.on("click",".t3js-submit-click",t=>{t.preventDefault(),this.doSubmit()}),this.form.on("change",".t3js-submit-change",t=>{t.preventDefault(),this.doSubmit()}),this.form.on("click",'.t3js-limit-submit input[type="button"]',i=>{i.preventDefault(),this.setLimit(t(i.currentTarget).data("value")),this.doSubmit()}),this.form.on("click",".t3js-addfield",i=>{i.preventDefault();const e=t(i.currentTarget);this.addValueToField(e.data("field"),e.val())}),this.form.on("change","[data-assign-store-control-title]",i=>{const e=t(i.currentTarget),l=this.form.find('[name="storeControl[title]"]');"0"!==e.val()?l.val(e.find("option:selected").text()):l.val("")}),document.querySelectorAll('form[name="queryform"] .t3js-clearable').forEach(t=>t.clearable({onClear:()=>{this.doSubmit()}}))}doSubmit(){this.form.trigger("submit")}setLimit(t){this.limitField.val(t)}addValueToField(t,i){const e=this.form.find('[name="'+t+'"]'),l=e.val();e.val(l+","+i)}}}));