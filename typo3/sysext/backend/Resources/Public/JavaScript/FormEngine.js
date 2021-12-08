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
import $ from"jquery";import FormEngineValidation from"TYPO3/CMS/Backend/FormEngineValidation.js";import DocumentSaveActions from"TYPO3/CMS/Backend/DocumentSaveActions.js";import Icons from"TYPO3/CMS/Backend/Icons.js";import Modal from"TYPO3/CMS/Backend/Modal.js";import*as MessageUtility from"TYPO3/CMS/Backend/Utility/MessageUtility.js";import Severity from"TYPO3/CMS/Backend/Severity.js";import*as BackendExceptionModule from"TYPO3/CMS/Backend/BackendException.js";import InteractionRequestMap from"TYPO3/CMS/Backend/Event/InteractionRequestMap.js";export default(function(){function e(e,t){t?n.interactionRequestMap.resolveFor(e):n.interactionRequestMap.rejectFor(e)}const t=new Map;t.set("typo3-backend-form-update-value",(e,t)=>{const n=document.querySelector('[name="'+CSS.escape(e.elementName)+'"]'),a=document.querySelector('[data-formengine-input-name="'+CSS.escape(e.elementName)+'"]');FormEngineValidation.updateInputField(e.elementName),null!==n&&(FormEngineValidation.markFieldAsChanged(n),FormEngineValidation.validateField(n)),null!==a&&a!==n&&FormEngineValidation.validateField(a)}),t.set("typo3-backend-form-reload",(e,t)=>{e.confirm?Modal.confirm(TYPO3.lang["FormEngine.refreshRequiredTitle"],TYPO3.lang["FormEngine.refreshRequiredContent"]).on("button.clicked",e=>{"ok"==e.target.name&&n.saveDocument(),Modal.dismiss()}):n.saveDocument()}),t.set("typo3-backend-form-update-bitmask",(e,t)=>{const n=t.target,a=document.editform[e.elementName],o=n.checked!==e.invert,i=Math.pow(2,e.position),r=Math.pow(2,e.total)-i-1;a.value=o?a.value|i:a.value&r,a.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))});const n={consumeTypes:["typo3.setUrl","typo3.beforeSetUrl","typo3.refresh"],Validation:FormEngineValidation,interactionRequestMap:InteractionRequestMap,formName:TYPO3.settings.FormEngine.formName,openedPopupWindow:null,legacyFieldChangedCb:function(){!$.isFunction(TYPO3.settings.FormEngine.legacyFieldChangedCb)||TYPO3.settings.FormEngine.legacyFieldChangedCb()},browserUrl:"",openPopupWindow:function(e,t,a){return Modal.advanced({type:Modal.types.iframe,content:n.browserUrl+"&mode="+e+"&bparams="+t+(a?"&"+("db"===e?"expandPage":"expandFolder")+"="+a:""),size:Modal.sizes.large})},setSelectOptionFromExternalSource:function(e,t,a,o,i,r){i=String(i);let l,c,s=!1,d=!1;if(l=n.getFieldElement(e),c=l.get(0),null===c||"--div--"===t||c instanceof HTMLOptGroupElement)return;const u=n.getFieldElement(e,"_list",!0);if(u.length>0&&(l=u,s=l.prop("multiple")&&"1"!=l.prop("size"),d=!0),s||d){const d=n.getFieldElement(e,"_avail");if(s||(l.find("option").each((e,t)=>{const a=d.find('option[value="'+$.escapeSelector($(t).attr("value"))+'"]');a&&(a.removeClass("hidden").prop("disabled",!1),n.enableOptGroup(a.get(0)))}),l.empty()),i){let e=!1,a=new RegExp("(^|,)"+t+"($|,)");i.match(a)?(l.empty(),e=!0):1==l.find("option").length&&(a=new RegExp("(^|,)"+l.find("option").prop("value")+"($|,)"),i.match(a)&&(l.empty(),e=!0)),e&&void 0!==r&&r.closest("select").querySelectorAll("[disabled]").forEach((function(e){e.classList.remove("hidden"),e.disabled=!1,n.enableOptGroup(e)}))}let u=!0;const m=n.getFieldElement(e,"_mul",!0);if((0==m.length||0==m.val())&&(l.find("option").each((function(e,n){if($(n).prop("value")==t)return u=!1,!1})),u&&void 0!==r)){r.classList.add("hidden"),r.disabled=!0;const e=r.parentElement;e instanceof HTMLOptGroupElement&&0===e.querySelectorAll("option:not([disabled]):not([hidden]):not(.hidden)").length&&(e.disabled=!0,e.classList.add("hidden"))}if(u){const e=$("<option></option>");e.attr({value:t,title:o}).text(a),e.appendTo(l),n.updateHiddenFieldValueFromSelect(l,c),n.legacyFieldChangedCb(),FormEngineValidation.markFieldAsChanged(c),n.Validation.validateField(l),n.Validation.validateField(d)}}else{const e=/_(\d+)$/,a=t.toString().match(e);null!=a&&(t=a[1]),l.val(t),n.Validation.validateField(l)}},updateHiddenFieldValueFromSelect:function(e,t){const n=[];$(e).find("option").each((e,t)=>{n.push($(t).prop("value"))}),t.value=n.join(","),t.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},getFormElement:function(e){const t=$('form[name="'+n.formName+'"]:first');if(!e)return t;{const a=n.getFieldElement(e),o=n.getFieldElement(e,"_list");if(a.length>0&&("select-one"===a.prop("type")||o.length>0&&o.prop("type").match(/select-(one|multiple)/)))return t;console.error("Form fields missing: form: "+n.formName+", field name: "+e),alert("Form field is invalid")}},getFieldElement:function(e,t,a){const o=$('form[name="'+n.formName+'"]:first');if(t){let n;switch(t){case"_list":n=$(':input[data-formengine-input-name="'+e+'"]:not([type=hidden])',o);break;case"_avail":n=$(':input[data-relatedfieldname="'+e+'"]',o);break;case"_mul":case"_hr":n=$(':input[type=hidden][data-formengine-input-name="'+e+'"]',o);break;default:n=null}if(n&&n.length>0||!0===a)return n}return $(':input[name="'+e+'"]',o)},initializeEvents:function(){top.TYPO3&&void 0!==top.TYPO3.Backend&&(top.TYPO3.Backend.consumerScope.attach(n),$(window).on("unload",(function(){top.TYPO3.Backend.consumerScope.detach(n)}))),$(document).on("click",".t3js-editform-close",e=>{e.preventDefault(),n.preventExitIfNotSaved(n.preventExitIfNotSavedCallback)}).on("click",".t3js-editform-view",e=>{e.preventDefault(),n.previewAction(e,n.previewActionCallback)}).on("click",".t3js-editform-new",e=>{e.preventDefault(),n.newAction(e,n.newActionCallback)}).on("click",".t3js-editform-duplicate",e=>{e.preventDefault(),n.duplicateAction(e,n.duplicateActionCallback)}).on("click",".t3js-editform-delete-record",e=>{e.preventDefault(),n.deleteAction(e,n.deleteActionCallback)}).on("click",".t3js-editform-submitButton",e=>{const t=$(e.currentTarget),n=t.data("name")||e.currentTarget.name,a=$("<input />").attr("type","hidden").attr("name",n).attr("value","1");t.parents("form").append(a)}).on("change",'.t3-form-field-eval-null-checkbox input[type="checkbox"]',e=>{$(e.currentTarget).closest(".t3js-formengine-field-item").toggleClass("disabled")}).on("change",'.t3js-form-field-eval-null-placeholder-checkbox input[type="checkbox"]',e=>{n.toggleCheckboxField($(e.currentTarget)),FormEngineValidation.markFieldAsChanged($(e.currentTarget))}).on("change",(function(e){$(".module-docheader-bar .btn").removeClass("disabled").prop("disabled",!1)})).on("click",".t3js-element-browser",(function(e){e.preventDefault(),e.stopPropagation();const t=$(e.currentTarget),a=t.data("mode"),o=t.data("params"),i=t.data("entryPoint");n.openPopupWindow(a,o,i)})).on("click",'[data-formengine-field-change-event="click"]',e=>{const t=JSON.parse(e.currentTarget.dataset.formengineFieldChangeItems);n.processOnFieldChange(t,e)}).on("change",'[data-formengine-field-change-event="change"]',e=>{const t=JSON.parse(e.currentTarget.dataset.formengineFieldChangeItems);n.processOnFieldChange(t,e)}),document.editform.addEventListener("submit",(function(){if(document.editform.closeDoc.value)return;const e=["button[form]",'button[name^="_save"]','a[data-name^="_save"]','button[name="CMD"][value^="save"]','a[data-name="CMD"][data-value^="save"]'].join(","),t=document.querySelector(e);null!==t&&(t.disabled=!0,Icons.getIcon("spinner-circle-dark",Icons.sizes.small).then((function(e){t.querySelector(".t3js-icon").outerHTML=e})))})),window.addEventListener("message",n.handlePostMessage)},consume:function(t){if(!t)throw new BackendExceptionModule.BackendException("No interaction request given",1496589980);const a=$.Deferred();if(t.concernsTypes(n.consumeTypes)){const o=t.outerMostRequest;n.interactionRequestMap.attachFor(o,a),o.isProcessed()?e(o,o.getProcessedData().response):n.hasChange()?n.preventExitIfNotSaved((function(t){o.setProcessedData({response:t}),e(o,t)})):n.interactionRequestMap.resolveFor(o)}return a},handlePostMessage:function(e){if(!MessageUtility.MessageUtility.verifyOrigin(e.origin))throw"Denied message sent by "+e.origin;if("typo3:elementBrowser:elementAdded"===e.data.actionName){if(void 0===e.data.fieldName)throw"fieldName not defined in message";if(void 0===e.data.value)throw"value not defined in message";const t=e.data.label||e.data.value,a=e.data.title||t,o=e.data.exclusiveValues||"";n.setSelectOptionFromExternalSource(e.data.fieldName,e.data.value,t,a,o)}},initializeRemainingCharacterViews:function(){const e=$("[maxlength]").not(".t3js-datetimepicker").not(".t3js-charcounter-initialized");e.on("focus",e=>{const t=$(e.currentTarget),a=t.parents(".t3js-formengine-field-item:first"),o=n.getCharacterCounterProperties(t);a.append($("<div />",{class:"t3js-charcounter"}).append($("<span />",{class:o.labelClass}).text(TYPO3.lang["FormEngine.remainingCharacters"].replace("{0}",o.remainingCharacters))))}).on("blur",e=>{$(e.currentTarget).parents(".t3js-formengine-field-item:first").find(".t3js-charcounter").remove()}).on("keyup",e=>{const t=$(e.currentTarget),a=t.parents(".t3js-formengine-field-item:first"),o=n.getCharacterCounterProperties(t);a.find(".t3js-charcounter span").removeClass().addClass(o.labelClass).text(TYPO3.lang["FormEngine.remainingCharacters"].replace("{0}",o.remainingCharacters))}),e.addClass("t3js-charcounter-initialized"),$(":password").on("focus",(function(e){$(e.currentTarget).attr({type:"text","data-active-password":"true"}).trigger("select")})).on("blur",(function(e){$(e.currentTarget).attr("type","password").removeAttr("data-active-password")}))},getCharacterCounterProperties:function(e){const t=e.val(),n=e.attr("maxlength")-t.length-(t.match(/\n/g)||[]).length;let a="";return a=n<15?"label-danger":n<30?"label-warning":"label-info",{remainingCharacters:n,labelClass:"label "+a}},initializeNullNoPlaceholderCheckboxes:function(){$(".t3-form-field-eval-null-checkbox").each((function(e,t){const n=$(t),a=n.find('input[type="checkbox"]'),o=n.closest(".t3js-formengine-field-item");a.attr("checked")||o.addClass("disabled")}))},initializeNullWithPlaceholderCheckboxes:function(){$(".t3js-form-field-eval-null-placeholder-checkbox").each((e,t)=>{n.toggleCheckboxField($(t).find('input[type="checkbox"]'))})},toggleCheckboxField:function(e){const t=e.closest(".t3js-formengine-field-item");e.prop("checked")?(t.find(".t3js-formengine-placeholder-placeholder").hide(),t.find(".t3js-formengine-placeholder-formfield").show(),t.find(".t3js-formengine-placeholder-formfield").find(":input").trigger("focus")):(t.find(".t3js-formengine-placeholder-placeholder").show(),t.find(".t3js-formengine-placeholder-formfield").hide())},reinitialize:function(){const e=Array.from(document.querySelectorAll(".t3js-clearable")).filter(e=>!e.classList.contains("t3js-color-picker"));e.length>0&&import("TYPO3/CMS/Backend/Input/Clearable.js").then((function(){e.forEach(e=>e.clearable())})),n.initializeNullNoPlaceholderCheckboxes(),n.initializeNullWithPlaceholderCheckboxes(),n.initializeLocalizationStateSelector(),n.initializeRemainingCharacterViews()},initializeLocalizationStateSelector:function(){$(".t3js-l10n-state-container").each((e,t)=>{const n=$(t),a=n.closest(".t3js-formengine-field-item").find("[data-formengine-input-name]"),o=n.find('input[type="radio"]:checked').val();"parent"!==o&&"source"!==o||a.attr("disabled","disabled")})},hasChange:function(){const e=$('form[name="'+n.formName+'"] .has-change').length>0,t=$('[name^="data["].has-change').length>0;return e||t},preventExitIfNotSavedCallback:function(e){n.closeDocument()},preventFollowLinkIfNotSaved:function(e){return n.preventExitIfNotSaved((function(){window.location.href=e})),!1},preventExitIfNotSaved:function(e){if(e=e||n.preventExitIfNotSavedCallback,n.hasChange()){const t=TYPO3.lang["label.confirm.close_without_save.title"]||"Do you want to close without saving?",a=TYPO3.lang["label.confirm.close_without_save.content"]||"You currently have unsaved changes. Are you sure you want to discard these changes?",o=$("<input />").attr("type","hidden").attr("name","_saveandclosedok").attr("value","1"),i=[{text:TYPO3.lang["buttons.confirm.close_without_save.no"]||"No, I will continue editing",btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.close_without_save.yes"]||"Yes, discard my changes",btnClass:"btn-default",name:"yes"}];0===$(".has-error").length&&i.push({text:TYPO3.lang["buttons.confirm.save_and_close"]||"Save and close",btnClass:"btn-warning",name:"save",active:!0});Modal.confirm(t,a,Severity.warning,i).on("button.clicked",(function(t){"no"===t.target.name?Modal.dismiss():"yes"===t.target.name?(Modal.dismiss(),e.call(null,!0)):"save"===t.target.name&&($("form[name="+n.formName+"]").append(o),Modal.dismiss(),n.saveDocument())}))}else e.call(null,!0)},preventSaveIfHasErrors:function(){if($(".has-error").length>0){const e=TYPO3.lang["label.alert.save_with_error.title"]||"You have errors in your form!",t=TYPO3.lang["label.alert.save_with_error.content"]||"Please check the form, there is at least one error in your form.";return Modal.confirm(e,t,Severity.error,[{text:TYPO3.lang["buttons.alert.save_with_error.ok"]||"OK",btnClass:"btn-danger",name:"ok"}]).on("button.clicked",(function(e){"ok"===e.target.name&&Modal.dismiss()})),!1}return!0},requestFormEngineUpdate:function(e){if(e){Modal.confirm(TYPO3.lang["FormEngine.refreshRequiredTitle"],TYPO3.lang["FormEngine.refreshRequiredContent"]).on("button.clicked",(function(e){"ok"===e.target.name?(n.closeModalsRecursive(),n.saveDocument()):Modal.dismiss()}))}else n.saveDocument()},processOnFieldChange:function(e,n){e.forEach(e=>{const a=t.get(e.name);a instanceof Function&&a.call(null,e.data||null,n)})},registerOnFieldChangeHandler:function(e,n){t.has(e)&&console.warn("Handler for onFieldChange name `"+e+"` has been overridden."),t.set(e,n)},closeModalsRecursive:function(){void 0!==Modal.currentModal&&null!==Modal.currentModal&&(Modal.currentModal.on("hidden.bs.modal",(function(){n.closeModalsRecursive(Modal.currentModal)})),Modal.currentModal.trigger("modal-dismiss"))},previewAction:function(e,t){t=t||n.previewActionCallback;const a=e.target.href,o=e.target.dataset.hasOwnProperty("isNew"),i=$("<input />").attr("type","hidden").attr("name","_savedokview").attr("value","1");n.hasChange()?n.showPreviewModal(a,o,i,t):($("form[name="+n.formName+"]").append(i),window.open("","newTYPO3frontendWindow"),document.editform.submit())},previewActionCallback:function(e,t,a){switch(Modal.dismiss(),e){case"discard":const e=window.open(t,"newTYPO3frontendWindow");e.focus(),e.location.href===t&&e.location.reload();break;case"save":$("form[name="+n.formName+"]").append(a),window.open("","newTYPO3frontendWindow"),n.saveDocument()}},showPreviewModal:function(e,t,n,a){const o=TYPO3.lang["label.confirm.view_record_changed.title"]||"Do you want to save before viewing?",i={text:TYPO3.lang["buttons.confirm.view_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},r={text:TYPO3.lang["buttons.confirm.view_record_changed.no-save"]||"View without changes",btnClass:"btn-info",name:"discard"},l={text:TYPO3.lang["buttons.confirm.view_record_changed.save"]||"Save changes and view",btnClass:"btn-info",name:"save",active:!0};let c=[],s="";t?(c=[i,l],s=TYPO3.lang["label.confirm.view_record_changed.content.is-new-page"]||"You need to save your changes before viewing the page. Do you want to save and view them now?"):(c=[i,r,l],s=TYPO3.lang["label.confirm.view_record_changed.content"]||"You currently have unsaved changes. You can either discard these changes or save and view them.");const d=Modal.confirm(o,s,Severity.info,c);d.on("button.clicked",(function(t){a(t.target.name,e,n,d)}))},newAction:function(e,t){t=t||n.newActionCallback;const a=$("<input />").attr("type","hidden").attr("name","_savedoknew").attr("value","1"),o=e.target.dataset.hasOwnProperty("isNew");n.hasChange()?n.showNewModal(o,a,t):($("form[name="+n.formName+"]").append(a),document.editform.submit())},newActionCallback:function(e,t){const a=$("form[name="+n.formName+"]");switch(Modal.dismiss(),e){case"no":a.append(t),document.editform.submit();break;case"yes":a.append(t),n.saveDocument()}},showNewModal:function(e,t,n){const a=TYPO3.lang["label.confirm.new_record_changed.title"]||"Do you want to save before adding?",o=TYPO3.lang["label.confirm.new_record_changed.content"]||"You need to save your changes before creating a new record. Do you want to save and create now?";let i=[];const r={text:TYPO3.lang["buttons.confirm.new_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},l={text:TYPO3.lang["buttons.confirm.new_record_changed.no"]||"No, just add",btnClass:"btn-default",name:"no"},c={text:TYPO3.lang["buttons.confirm.new_record_changed.yes"]||"Yes, save and create now",btnClass:"btn-info",name:"yes",active:!0};i=e?[r,c]:[r,l,c];Modal.confirm(a,o,Severity.info,i).on("button.clicked",(function(e){n(e.target.name,t)}))},duplicateAction:function(e,t){t=t||n.duplicateActionCallback;const a=$("<input />").attr("type","hidden").attr("name","_duplicatedoc").attr("value","1"),o=e.target.dataset.hasOwnProperty("isNew");n.hasChange()?n.showDuplicateModal(o,a,t):($("form[name="+n.formName+"]").append(a),document.editform.submit())},duplicateActionCallback:function(e,t){const a=$("form[name="+n.formName+"]");switch(Modal.dismiss(),e){case"no":a.append(t),document.editform.submit();break;case"yes":a.append(t),n.saveDocument()}},showDuplicateModal:function(e,t,n){const a=TYPO3.lang["label.confirm.duplicate_record_changed.title"]||"Do you want to save before duplicating this record?",o=TYPO3.lang["label.confirm.duplicate_record_changed.content"]||"You currently have unsaved changes. Do you want to save your changes before duplicating this record?";let i=[];const r={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.cancel"]||"Cancel",btnClass:"btn-default",name:"cancel"},l={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.no"]||"No, just duplicate the original",btnClass:"btn-default",name:"no"},c={text:TYPO3.lang["buttons.confirm.duplicate_record_changed.yes"]||"Yes, save and duplicate this record",btnClass:"btn-info",name:"yes",active:!0};i=e?[r,c]:[r,l,c];Modal.confirm(a,o,Severity.info,i).on("button.clicked",(function(e){n(e.target.name,t)}))},deleteAction:function(e,t){t=t||n.deleteActionCallback;const a=$(e.target);n.showDeleteModal(a,t)},deleteActionCallback:function(e,t){Modal.dismiss(),"yes"===e&&n.invokeRecordDeletion(t)},showDeleteModal:function(e,t){const n=TYPO3.lang["label.confirm.delete_record.title"]||"Delete this record?";let a=TYPO3.lang["label.confirm.delete_record.content"]||"Are you sure you want to delete this record?";e.data("reference-count-message")&&(a+=" "+e.data("reference-count-message")),e.data("translation-count-message")&&(a+=" "+e.data("translation-count-message"));Modal.confirm(n,a,Severity.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this record",btnClass:"btn-warning",name:"yes",active:!0}]).on("button.clicked",(function(n){t(n.target.name,e)}))},enableOptGroup:function(e){const t=e.parentElement;t instanceof HTMLOptGroupElement&&t.querySelectorAll("option:not([hidden]):not([disabled]):not(.hidden)").length&&(t.hidden=!1,t.disabled=!1,t.classList.remove("hidden"))},closeDocument:function(){document.editform.closeDoc.value=1,n.dispatchSubmitEvent(),document.editform.submit()},saveDocument:function(){document.editform.doSave.value=1,n.dispatchSubmitEvent(),document.editform.submit()},dispatchSubmitEvent:function(){const e=document.createEvent("Event");e.initEvent("submit",!1,!0),document.editform.dispatchEvent(e)},initialize:function(e){DocumentSaveActions.getInstance().addPreSubmitCallback((function(){$('[data-active-password]:not([type="password"])').each((function(e,t){t.setAttribute("type","password"),t.blur()}))})),n.browserUrl=e,$((function(){n.initializeEvents(),n.Validation.initialize(),n.reinitialize(),$("#t3js-ui-block").remove()}))},invokeRecordDeletion:function(e){window.location.href=e.attr("href")}};return void 0!==TYPO3.settings.RequireJS&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/FormEngine"]&&$.each(TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/FormEngine"],(function(e,t){window.require([t])})),TYPO3.FormEngine=n,n}());