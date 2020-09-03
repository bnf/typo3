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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Backend/FormEngine","jquery/autocomplete"],(function(e,t,a,s){"use strict";a=__importDefault(a);return class{constructor(e){a.default(()=>{this.initialize(e)})}initialize(e){const t=e.closest(".t3-form-suggest-container"),i=e.dataset.tablename,n=e.dataset.fieldname,o=e.dataset.field,l=parseInt(e.dataset.uid,10),r=parseInt(e.dataset.pid,10),d=e.dataset.datastructureidentifier,u=e.dataset.flexformsheetname,m=e.dataset.flexformfieldname,c=e.dataset.flexformcontainername,f=e.dataset.flexformcontainerfieldname,p=parseInt(e.dataset.minchars,10),g=TYPO3.settings.ajaxUrls.record_suggest,x={tableName:i,fieldName:n,uid:l,pid:r,dataStructureIdentifier:d,flexFormSheetName:u,flexFormFieldName:m,flexFormContainerName:c,flexFormContainerFieldName:f};a.default(e).autocomplete({serviceUrl:g,params:x,type:"POST",paramName:"value",dataType:"json",minChars:p,groupBy:"typeLabel",containerClass:"autocomplete-results",appendTo:t,forceFixPosition:!1,preserveInput:!0,showNoSuggestionNotice:!0,noSuggestionNotice:'<div class="autocomplete-info">No results</div>',minLength:p,preventBadQueries:!1,transformResult:e=>({suggestions:e.map(e=>({value:e.text,data:e}))}),formatResult:e=>a.default("<div>").append(a.default('<a class="autocomplete-suggestion-link" href="#">'+e.data.sprite+e.data.text+"</a></div>").attr({"data-label":e.data.label,"data-table":e.data.table,"data-uid":e.data.uid})).html(),onSearchComplete:function(){t.classList.add("open")},beforeRender:function(e){e.attr("style",""),t.classList.add("open")},onHide:function(){t.classList.remove("open")},onSelect:function(){!function(t){let i="";i="select"===e.dataset.fieldtype?t.dataset.uid:t.dataset.table+"_"+t.dataset.uid,s.setSelectOptionFromExternalSource(o,i,t.dataset.label,t.dataset.label),s.Validation.markFieldAsChanged(a.default(document.querySelector('input[name="'+o+'"]')))}(t.querySelector(".autocomplete-selected a"))}})}}}));