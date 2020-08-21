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
define(["jquery","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Core/Contrib/jquery.autocomplete"],(function(e,t){"use strict";return class{constructor(t){e(()=>{this.initialize(t)})}initialize(a){const s=a.closest(".t3-form-suggest-container"),n=a.dataset.tablename,i=a.dataset.fieldname,o=a.dataset.field,r=parseInt(a.dataset.uid,10),d=parseInt(a.dataset.pid,10),l=a.dataset.datastructureidentifier,u=a.dataset.flexformsheetname,c=a.dataset.flexformfieldname,m=a.dataset.flexformcontainername,f=a.dataset.flexformcontainerfieldname,p=parseInt(a.dataset.minchars,10),g=TYPO3.settings.ajaxUrls.record_suggest,x={tableName:n,fieldName:i,uid:r,pid:d,dataStructureIdentifier:l,flexFormSheetName:u,flexFormFieldName:c,flexFormContainerName:m,flexFormContainerFieldName:f};e(a).autocomplete({serviceUrl:g,params:x,type:"POST",paramName:"value",dataType:"json",minChars:p,groupBy:"typeLabel",containerClass:"autocomplete-results",appendTo:s,forceFixPosition:!1,preserveInput:!0,showNoSuggestionNotice:!0,noSuggestionNotice:'<div class="autocomplete-info">No results</div>',minLength:p,preventBadQueries:!1,transformResult:e=>({suggestions:e.map(e=>({value:e.text,data:e}))}),formatResult:t=>e("<div>").append(e('<a class="autocomplete-suggestion-link" href="#">'+t.data.sprite+t.data.text+"</a></div>").attr({"data-label":t.data.label,"data-table":t.data.table,"data-uid":t.data.uid})).html(),onSearchComplete:function(){s.classList.add("open")},beforeRender:function(e){e.attr("style",""),s.classList.add("open")},onHide:function(){s.classList.remove("open")},onSelect:function(){!function(s){let n="";n="select"===a.dataset.fieldtype?s.dataset.uid:s.dataset.table+"_"+s.dataset.uid,t.setSelectOptionFromExternalSource(o,n,s.dataset.label,s.dataset.label),t.Validation.markFieldAsChanged(e(document.querySelector('input[name="'+o+'"]')))}(s.querySelector(".autocomplete-selected a"))}})}}}));