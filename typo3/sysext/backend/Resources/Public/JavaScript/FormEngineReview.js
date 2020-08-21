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
define(["jquery","TYPO3/CMS/Backend/FormEngine","bootstrap"],(function(t,e){"use strict";class i{constructor(){this.checkForReviewableField=()=>{const e=this,a=i.findInvalidField(),n=t("."+this.toggleButtonClass);if(a.length>0){const i=t("<div />",{class:"list-group"});a.each((function(){const a=t(this),n=a.find("[data-formengine-validation-rules]");let s=n.attr("id");void 0===s&&(s=n.parent().children("[id]").first().attr("id")),i.append(t("<a />",{class:"list-group-item "+e.fieldListItemClass,"data-field-id":s,href:"#"}).text(a.find(e.labelSelector).text()))})),n.removeClass("hidden");const s=n.data("bs.popover");s&&(s.options.content=i.wrapAll("<div>").parent().html(),s.setContent(),s.$tip.addClass(s.options.placement))}else n.addClass("hidden").popover("hide")},this.switchToField=e=>{e.preventDefault();const i=t(e.currentTarget).data("fieldId"),a=t("#"+i);a.parents('[id][role="tabpanel"]').each((function(){t('[aria-controls="'+t(this).attr("id")+'"]').tab("show")})),a.focus()},this.toggleButtonClass="t3js-toggle-review-panel",this.fieldListItemClass="t3js-field-item",this.labelSelector=".t3js-formengine-label",this.initialize()}static findInvalidField(){return t(document).find(".tab-content ."+e.Validation.errorClass)}static attachButtonToModuleHeader(e){const i=t(".t3js-module-docheader-bar-buttons").children().last().find('[role="toolbar"]'),a=t("<a />",{class:"btn btn-danger btn-sm hidden "+e.toggleButtonClass,href:"#",title:TYPO3.lang["buttons.reviewFailedValidationFields"]}).append(t("<span />",{class:"fa fa-fw fa-info"}));a.popover({container:"body",html:!0,placement:"bottom"}),i.prepend(a)}initialize(){const e=this,a=t(document);t(()=>{i.attachButtonToModuleHeader(e)}),a.on("click","."+this.fieldListItemClass,this.switchToField),a.on("t3-formengine-postfieldvalidation",this.checkForReviewableField)}}return new i}));