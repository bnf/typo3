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
import $ from"jquery";import{SeverityEnum}from"./Enum/Severity";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import Icons from"./Icons";import Wizard from"./Wizard";class Localization{constructor(){this.triggerButton=".t3js-localize",this.localizationMode=null,this.sourceLanguage=null,this.records=[],$(()=>{this.initialize()})}initialize(){const e=this;Icons.getIcon("actions-localize",Icons.sizes.large).then(a=>{Icons.getIcon("actions-edit-copy",Icons.sizes.large).then(t=>{$(e.triggerButton).removeClass("disabled"),$(document).on("click",e.triggerButton,e=>{e.preventDefault();const l=$(e.currentTarget),i=[],s=[];let o="";l.data("allowTranslate")&&(i.push('<div class="row"><div class="col-sm-3"><label class="btn btn-block btn-default t3js-localization-option" data-helptext=".t3js-helptext-translate">'+a+'<input type="radio" name="mode" id="mode_translate" value="localize" style="display: none"><br>'+TYPO3.lang["localize.wizard.button.translate"]+'</label></div><div class="col-sm-9"><p class="t3js-helptext t3js-helptext-translate text-muted">'+TYPO3.lang["localize.educate.translate"]+"</p></div></div>"),s.push("localize")),l.data("allowCopy")&&(i.push('<div class="row"><div class="col-sm-3"><label class="btn btn-block btn-default t3js-localization-option" data-helptext=".t3js-helptext-copy">'+t+'<input type="radio" name="mode" id="mode_copy" value="copyFromLanguage" style="display: none"><br>'+TYPO3.lang["localize.wizard.button.copy"]+'</label></div><div class="col-sm-9"><p class="t3js-helptext t3js-helptext-copy text-muted">'+TYPO3.lang["localize.educate.copy"]+"</p></div></div>"),s.push("copyFromLanguage")),0===l.data("allowTranslate")&&0===l.data("allowCopy")&&i.push('<div class="row"><div class="col-sm-12"><div class="alert alert-warning"><div class="media"><div class="media-left"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-exclamation fa-stack-1x"></i></span></div><div class="media-body"><p class="alert-message">'+TYPO3.lang["localize.educate.noTranslate"]+"</p></div></div></div></div></div>"),o+='<div data-bs-toggle="buttons">'+i.join("<hr>")+"</div>",Wizard.addSlide("localize-choose-action",TYPO3.lang["localize.wizard.header_page"].replace("{0}",l.data("page")).replace("{1}",l.data("languageName")),o,SeverityEnum.info,()=>{1===s.length&&(this.localizationMode=s[0],Wizard.unlockNextStep().trigger("click"))}),Wizard.addSlide("localize-choose-language",TYPO3.lang["localize.view.chooseLanguage"],"",SeverityEnum.info,e=>{Icons.getIcon("spinner-circle-dark",Icons.sizes.large).then(a=>{e.html('<div class="text-center">'+a+"</div>"),this.loadAvailableLanguages(parseInt(l.data("pageId"),10),parseInt(l.data("languageId"),10)).then(async a=>{const t=await a.resolve();if(1===t.length)return this.sourceLanguage=t[0].uid,void Wizard.unlockNextStep().trigger("click");Wizard.getComponent().on("click",".t3js-language-option",e=>{const a=$(e.currentTarget).prev();this.sourceLanguage=a.val(),Wizard.unlockNextStep()});const l=$("<div />",{class:"row"});for(const e of t){const a="language"+e.uid,t=$("<input />",{type:"radio",name:"language",id:a,value:e.uid,style:"display: none;",class:"btn-check"}),i=$("<label />",{class:"btn btn-default btn-block t3js-language-option option",for:a}).text(" "+e.title).prepend(e.flagIcon);l.append($("<div />",{class:"col-sm-4"}).append(t).append(i))}e.empty().append(l)})})}),Wizard.addSlide("localize-summary",TYPO3.lang["localize.view.summary"],"",SeverityEnum.info,e=>{Icons.getIcon("spinner-circle-dark",Icons.sizes.large).then(a=>{e.html('<div class="text-center">'+a+"</div>")}),this.getSummary(parseInt(l.data("pageId"),10),parseInt(l.data("languageId"),10)).then(async a=>{const t=await a.resolve();e.empty(),this.records=[];const l=t.columns.columns;t.columns.columnList.forEach(a=>{if(void 0===t.records[a])return;const i=l[a],s=$("<div />",{class:"row"});t.records[a].forEach(e=>{const a=" ("+e.uid+") "+e.title;this.records.push(e.uid),s.append($("<div />",{class:"col-sm-6"}).append($("<div />",{class:"input-group"}).append($("<span />",{class:"input-group-addon"}).append($("<input />",{type:"checkbox",class:"t3js-localization-toggle-record",id:"record-uid-"+e.uid,checked:"checked","data-uid":e.uid,"aria-label":a})),$("<label />",{class:"form-control",for:"record-uid-"+e.uid}).text(a).prepend(e.icon))))}),e.append($("<fieldset />",{class:"localization-fieldset"}).append($("<label />").text(i).prepend($("<input />",{class:"t3js-localization-toggle-column",type:"checkbox",checked:"checked"})),s))}),Wizard.unlockNextStep(),Wizard.getComponent().on("change",".t3js-localization-toggle-record",e=>{const a=$(e.currentTarget),t=a.data("uid"),l=a.closest("fieldset"),i=l.find(".t3js-localization-toggle-column");if(a.is(":checked"))this.records.push(t);else{const e=this.records.indexOf(t);e>-1&&this.records.splice(e,1)}const s=l.find(".t3js-localization-toggle-record"),o=l.find(".t3js-localization-toggle-record:checked");i.prop("checked",o.length>0),i.prop("indeterminate",o.length>0&&o.length<s.length),this.records.length>0?Wizard.unlockNextStep():Wizard.lockNextStep()}).on("change",".t3js-localization-toggle-column",e=>{const a=$(e.currentTarget),t=a.closest("fieldset").find(".t3js-localization-toggle-record");t.prop("checked",a.is(":checked")),t.trigger("change")})})}),Wizard.addFinalProcessingSlide(()=>{this.localizeRecords(parseInt(l.data("pageId"),10),parseInt(l.data("languageId"),10),this.records).then(()=>{Wizard.dismiss(),document.location.reload()})}).then(()=>{Wizard.show(),Wizard.getComponent().on("click",".t3js-localization-option",e=>{const a=$(e.currentTarget),t=a.find('input[type="radio"]');if(a.data("helptext")){const t=$(e.delegateTarget);t.find(".t3js-localization-option").removeClass("active"),t.find(".t3js-helptext").addClass("text-muted"),a.addClass("active"),t.find(a.data("helptext")).removeClass("text-muted")}this.localizationMode=t.val(),Wizard.unlockNextStep()})})})})})}loadAvailableLanguages(e,a){return new AjaxRequest(TYPO3.settings.ajaxUrls.page_languages).withQueryArguments({pageId:e,languageId:a}).get()}getSummary(e,a){return new AjaxRequest(TYPO3.settings.ajaxUrls.records_localize_summary).withQueryArguments({pageId:e,destLanguageId:a,languageId:this.sourceLanguage}).get()}localizeRecords(e,a,t){return new AjaxRequest(TYPO3.settings.ajaxUrls.records_localize).withQueryArguments({pageId:e,srcLanguageId:this.sourceLanguage,destLanguageId:a,action:this.localizationMode,uidList:t}).get()}}export default new Localization;