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
import{DateTime}from"luxon";import Md5 from"@typo3/backend/hashing/md5.js";import Modal from"@typo3/backend/modal.js";import Severity from"@typo3/backend/severity.js";import Utility from"@typo3/backend/utility.js";import RegularEvent from"@typo3/core/event/regular-event.js";import DomHelper from"@typo3/backend/utility/dom-helper.js";import{selector}from"@typo3/core/literals.js";import SubmitInterceptor from"@typo3/backend/form/submit-interceptor.js";import{FormEngineReview}from"@typo3/backend/form-engine-review.js";let formEngineFormElement,validationSuspended=!1;const customEvaluations=new Map;class FormEngineValidation{static initialize(e){formEngineFormElement=e,formEngineFormElement.querySelectorAll("."+FormEngineValidation.errorClass).forEach((e=>e.classList.remove(FormEngineValidation.errorClass))),FormEngineValidation.initializeInputFields(),new FormEngineReview(e),new RegularEvent("change",((e,t)=>{FormEngineValidation.validateField(t),FormEngineValidation.markFieldAsChanged(t)})).delegateTo(formEngineFormElement,FormEngineValidation.rulesSelector),FormEngineValidation.registerSubmitCallback(),FormEngineValidation.validate()}static initializeInputFields(){formEngineFormElement.querySelectorAll(FormEngineValidation.inputSelector).forEach((e=>{const t=JSON.parse(e.dataset.formengineInputParams).field,a=formEngineFormElement.querySelector(selector`[name="${t}"]`);"formengineInputInitialized"in e.dataset||(a.dataset.config=e.dataset.formengineInputParams,FormEngineValidation.initializeInputField(t))}))}static initializeInputField(e){const t=formEngineFormElement.querySelector(selector`[name="${e}"]`),a=formEngineFormElement.querySelector(selector`[data-formengine-input-name="${e}"]`);if(void 0!==t.dataset.config){const e=JSON.parse(t.dataset.config);let i;try{i=FormEngineValidation.formatByEvals(e,t.value)}catch(e){return void console.error("Internal error in FormEngineValidation.formatByEvals",t,e)}i.length&&(a.value=i)}new RegularEvent("change",(()=>{FormEngineValidation.updateInputField(a.dataset.formengineInputName)})).bindTo(a),a.dataset.formengineInputInitialized="true"}static registerCustomEvaluation(e,t){customEvaluations.has(e)||customEvaluations.set(e,t)}static formatByEvals(e,t){if(void 0!==e.evalList){const a=Utility.trimExplode(",",e.evalList);for(const e of a)t=FormEngineValidation.formatValue(e,t)}return t}static formatValue(e,t){switch(e){case"date":case"datetime":case"time":case"timesec":if(""===t||"0"===t)return"";const e=DateTime.fromISO(String(t));if(!e.isValid)throw new Error("Invalid ISO8601 DateTime string: "+t);return e.toISO({suppressMilliseconds:!0,includeOffset:!1});case"password":return t?FormEngineValidation.passwordDummy:"";default:return t.toString()}}static updateInputField(e){const t=formEngineFormElement.querySelector(selector`[name="${e}"]`),a=formEngineFormElement.querySelector(selector`[data-formengine-input-name="${e}"]`);if(void 0!==t.dataset.config){const e=JSON.parse(t.dataset.config),i=FormEngineValidation.processByEvals(e,a.value);let n;try{n=FormEngineValidation.formatByEvals(e,i)}catch(e){return void console.error("Internal error in FormEngineValidation.formatByEvals",t,e)}t.value!==i&&(t.disabled&&t.dataset.enableOnModification&&(t.disabled=!1),t.value=i,t.dispatchEvent(new Event("change"))),a.value!==n&&(a.value=n)}}static validateField(e,t){if(t=t||e.value||"",void 0===e.dataset.formengineValidationRules)return t;const a=JSON.parse(e.dataset.formengineValidationRules);let i=!1,n=0;const r=t;let o,l,s;Array.isArray(t)||(t=t.trimStart());for(const r of a){if(i)break;switch(r.type){case"required":""===t&&(i=!0,e.closest(FormEngineValidation.markerSelector).classList.add(FormEngineValidation.errorClass));break;case"range":if(""!==t){if((r.minItems||r.maxItems)&&(o=formEngineFormElement.querySelector(selector`[name="${e.dataset.relatedfieldname}"]`),n=null!==o?Utility.trimExplode(",",o.value).length:parseInt(e.value,10),void 0!==r.minItems&&(l=1*r.minItems,!isNaN(l)&&n<l&&(i=!0)),void 0!==r.maxItems&&(s=1*r.maxItems,!isNaN(s)&&n>s&&(i=!0))),void 0!==r.lower)if("datetimepicker"===e.dataset.inputType){const e=DateTime.fromISO(t,{zone:"utc"}),a=DateTime.fromISO(r.lower,{zone:"utc"});(!e.isValid||e<a.minus(1e3*a.second))&&(i=!0)}else{const e=1*r.lower;!isNaN(e)&&parseInt(t,10)<e&&(i=!0)}if(void 0!==r.upper)if("datetimepicker"===e.dataset.inputType){const e=DateTime.fromISO(t,{zone:"utc"}),a=DateTime.fromISO(r.upper,{zone:"utc"});(!e.isValid||e>a.plus(1e3*(59-a.second)))&&(i=!0)}else{const e=1*r.upper;!isNaN(e)&&parseInt(t,10)>e&&(i=!0)}}break;case"select":case"category":(r.minItems||r.maxItems)&&(o=formEngineFormElement.querySelector(selector`[name="${e.dataset.relatedfieldname}"]`),n=null!==o?Utility.trimExplode(",",o.value).length:e instanceof HTMLSelectElement?e.querySelectorAll("option:checked").length:e.querySelectorAll("input[value]:checked").length,void 0!==r.minItems&&(l=1*r.minItems,!isNaN(l)&&n<l&&(i=!0)),void 0!==r.maxItems&&(s=1*r.maxItems,!isNaN(s)&&n>s&&(i=!0)));break;case"group":case"folder":case"inline":(r.minItems||r.maxItems)&&(n=Utility.trimExplode(",",e.value).length,void 0!==r.minItems&&(l=1*r.minItems,!isNaN(l)&&n<l&&(i=!0)),void 0!==r.maxItems&&(s=1*r.maxItems,!isNaN(s)&&n>s&&(i=!0)));break;case"min":(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&e.value.length>0&&e.value.length<e.minLength&&(i=!0)}}const m=!i,c=e.closest(FormEngineValidation.markerSelector);return null!==c&&c.classList.toggle(FormEngineValidation.errorClass,!m),FormEngineValidation.markParentTab(e,m),formEngineFormElement.dispatchEvent(new CustomEvent("t3-formengine-postfieldvalidation",{detail:{field:e,isValid:m},cancelable:!1,bubbles:!0})),r}static processByEvals(e,t){if(void 0!==e.evalList){const a=Utility.trimExplode(",",e.evalList);for(const i of a)t=FormEngineValidation.processValue(i,t,e)}return t}static processValue(e,t,a){let i="",n="",r=0,o=t;switch(e){case"alpha":case"num":case"alphanum":case"alphanum_x":for(i="",r=0;r<t.length;r++){const a=t.substr(r,1);let n="_"===a||"-"===a,o=a>="a"&&a<="z"||a>="A"&&a<="Z",l=a>="0"&&a<="9";switch(e){case"alphanum":n=!1;break;case"alpha":l=!1,n=!1;break;case"num":o=!1,n=!1}(o||l||n)&&(i+=a)}i!==t&&(o=i);break;case"is_in":if(a.is_in){n=""+t,a.is_in=a.is_in.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");const e=new RegExp("[^"+a.is_in+"]+","g");i=n.replace(e,"")}else i=n;o=i;break;case"nospace":o=(""+t).replace(/ /g,"");break;case"md5":""!==t&&(o=Md5.hash(t));break;case"upper":o=t.toUpperCase();break;case"lower":o=t.toLowerCase();break;case"integer":""!==t&&(o=FormEngineValidation.parseInt(t).toString());break;case"decimal":""!==t&&(o=FormEngineValidation.parseDouble(t));break;case"trim":o=String(t).trim();break;case"time":case"timesec":if(""!==t){o=DateTime.fromISO(t).set({year:1970,month:1,day:1}).toISO({suppressMilliseconds:!0,includeOffset:!1})}break;case"year":if(""!==t){let e=parseInt(t,10);isNaN(e)&&(e=(new Date).getUTCFullYear()),o=e.toString(10)}break;case"null":case"password":break;default:customEvaluations.has(e)?o=customEvaluations.get(e).call(null,t):"object"==typeof TBE_EDITOR&&void 0!==TBE_EDITOR.customEvalFunctions&&"function"==typeof TBE_EDITOR.customEvalFunctions[e]&&(o=TBE_EDITOR.customEvalFunctions[e](t))}return o}static validate(e){(void 0===e||e instanceof Document)&&formEngineFormElement.querySelectorAll(FormEngineValidation.markerSelector+", .t3js-tabmenu-item").forEach((e=>{e.classList.remove(FormEngineValidation.errorClass,"has-validation-error")}));const t=e||document;for(const e of t.querySelectorAll(FormEngineValidation.rulesSelector))if(null===e.closest(".t3js-flex-section-deleted, .t3js-inline-record-deleted, .t3js-file-reference-deleted")){let t=!1;const a=e.value,i=FormEngineValidation.validateField(e,a);if(Array.isArray(i)&&Array.isArray(a)){if(i.length!==a.length)t=!0;else for(let e=0;e<i.length;e++)if(i[e]!==a[e]){t=!0;break}}else i.length&&a!==i&&(t=!0);t&&(e.disabled&&e.dataset.enableOnModification&&(e.disabled=!1),e.value=i)}}static markFieldAsChanged(e){e.classList.add("has-change");const t=e.closest(".t3js-formengine-palette-field")?.querySelector(".t3js-formengine-label");null!==t&&t.classList.add("has-change")}static parseInt(e){if(!e)return 0;const t=parseInt(""+e,10);return isNaN(t)?0:t}static parseDouble(e,t=2){let a=""+e;a=a.replace(/[^0-9,.-]/g,"");const i=a.startsWith("-");a=a.replace(/-/g,""),a=a.replace(/,/g,"."),-1===a.indexOf(".")&&(a+=".0");const n=a.split("."),r=n.pop();let o=Number(n.join("")+"."+r);return i&&(o*=-1),a=o.toFixed(t),a}static pol(foreign,value){return eval(("-"==foreign?"-":"")+value)}static markParentTab(e,t){DomHelper.parents(e,".tab-pane").forEach((e=>{t&&(t=null===e.querySelector(".has-error"));const a=e.id;formEngineFormElement.querySelector('[data-bs-target="#'+a+'"]').closest(".t3js-tabmenu-item").classList.toggle("has-validation-error",!t)}))}static suspend(){validationSuspended=!0}static resume(){validationSuspended=!1}static registerSubmitCallback(){new SubmitInterceptor(formEngineFormElement).addPreSubmitCallback((()=>{if(validationSuspended||null===document.querySelector("."+FormEngineValidation.errorClass))return!0;const e=Modal.confirm(TYPO3.lang.alert||"Alert",TYPO3.lang["FormEngine.fieldsMissing"],Severity.error,[{text:TYPO3.lang["button.ok"]||"OK",active:!0,btnClass:"btn-default",name:"ok"}]);return e.addEventListener("button.clicked",(()=>e.hideModal())),!1}))}}FormEngineValidation.rulesSelector="[data-formengine-validation-rules]",FormEngineValidation.inputSelector="[data-formengine-input-params]",FormEngineValidation.markerSelector=".t3js-formengine-validation-marker",FormEngineValidation.errorClass="has-error",FormEngineValidation.passwordDummy="********";export default FormEngineValidation;