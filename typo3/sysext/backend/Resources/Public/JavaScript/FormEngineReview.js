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
define(["jquery","TYPO3/CMS/Backend/FormEngine","bootstrap"],(function(t,e){"use strict";class i{constructor(){this.checkForReviewableField=()=>{const e=this,n=i.findInvalidField(),a=t("."+this.toggleButtonClass);if(n.length>0){const i=t("<div />",{class:"list-group"});n.each((function(){const n=t(this),a=n.find("[data-formengine-validation-rules]");let s=a.attr("id");void 0===s&&(s=a.parent().children("[id]").first().attr("id")),i.append(t("<a />",{class:"list-group-item "+e.fieldListItemClass,"data-field-id":s,href:"#"}).text(n.find(e.labelSelector).text()))})),a.removeClass("hidden");const s=a.data("bs.popover");s&&(s.options.html=!0,s.options.content=i.wrapAll("<div>").parent().html(),s.setContent(s.$tip),s.$tip.addClass(s.options.placement))}else a.addClass("hidden").popover("hide")},this.switchToField=e=>{e.preventDefault();const i=t(e.currentTarget).data("fieldId"),n=t("#"+i);n.parents('[id][role="tabpanel"]').each((function(){t('[aria-controls="'+t(this).attr("id")+'"]').tab("show")})),n.focus()},this.toggleButtonClass="t3js-toggle-review-panel",this.fieldListItemClass="t3js-field-item",this.labelSelector=".t3js-formengine-label",this.initialize()}static findInvalidField(){return t(document).find(".tab-content ."+e.Validation.errorClass)}static attachButtonToModuleHeader(e){const i=t(".t3js-module-docheader-bar-buttons").children().last().find('[role="toolbar"]'),n=t("<a />",{class:"btn btn-danger btn-sm hidden "+e.toggleButtonClass,href:"#",title:TYPO3.lang["buttons.reviewFailedValidationFields"]}).append(t("<span />",{class:"fa fa-fw fa-info"}));n.popover({container:"body",html:!0,placement:"bottom"}),i.prepend(n)}initialize(){const e=this,n=t(document);t(()=>{i.attachButtonToModuleHeader(e)}),n.on("click","."+this.fieldListItemClass,this.switchToField),n.on("t3-formengine-postfieldvalidation",this.checkForReviewableField)}}return new i}));