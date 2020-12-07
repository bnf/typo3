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
define(["jquery"],(function(t){"use strict";return new class{constructor(){this.urlParameters={},this.parameters={},this.additionalLinkAttributes={},this.loadTarget=e=>{const i=t(e.currentTarget);t(".t3js-linkTarget").val(i.val()),i.get(0).selectedIndex=0},t(()=>{const e=t("body").data();this.urlParameters=e.urlParameters,this.parameters=e.parameters,this.linkAttributeFields=e.linkAttributeFields,t(".t3js-targetPreselect").on("change",this.loadTarget),t("form.t3js-dummyform").on("submit",t=>{t.preventDefault()})})}getLinkAttributeValues(){const e={};return t.each(this.linkAttributeFields,(i,r)=>{const n=t('[name="l'+r+'"]').val();n&&(e[r]=n)}),t.extend(e,this.additionalLinkAttributes),e}encodeGetParameters(t,e,i){const r=[];for(const n of Object.entries(t)){const[t,s]=n,a=e?e+"["+t+"]":t;i.includes(a+"=")||r.push("object"==typeof s?this.encodeGetParameters(s,a,i):encodeURIComponent(a)+"="+encodeURIComponent(s))}return"&"+r.join("&")}setAdditionalLinkAttribute(t,e){this.additionalLinkAttributes[t]=e}finalizeFunction(t){throw"The link browser requires the finalizeFunction to be set. Seems like you discovered a major bug."}}}));