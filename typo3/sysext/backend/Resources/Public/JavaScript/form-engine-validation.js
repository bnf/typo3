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
import{DateTime}from"luxon"
import Md5 from"@typo3/backend/hashing/md5.js"
import Modal from"@typo3/backend/modal.js"
import Severity from"@typo3/backend/severity.js"
import Utility from"@typo3/backend/utility.js"
import RegularEvent from"@typo3/core/event/regular-event.js"
import DomHelper from"@typo3/backend/utility/dom-helper.js"
import{selector}from"@typo3/core/literals.js"
import SubmitInterceptor from"@typo3/backend/form/submit-interceptor.js"
import{FormEngineReview}from"@typo3/backend/form-engine-review.js"
let formEngineFormElement,validationSuspended=!1
const customEvaluations=new Map
export default class FormEngineValidation{static{this.rulesSelector="[data-formengine-validation-rules]"}static{this.inputSelector="[data-formengine-input-params]"}static{this.markerSelector=".t3js-formengine-validation-marker"}static{this.labelSelector=".t3js-formengine-label"}static{this.errorClass="has-error"}static{this.validationErrorClass="has-validation-error"}static{this.passwordDummy="********"}static initialize(e){(formEngineFormElement=e).querySelectorAll("."+FormEngineValidation.errorClass).forEach((e=>e.classList.remove(FormEngineValidation.errorClass))),FormEngineValidation.initializeInputFields(),new FormEngineReview(e),new RegularEvent("change",((e,t)=>{FormEngineValidation.validateField(t),FormEngineValidation.markFieldAsChanged(t)})).delegateTo(formEngineFormElement,FormEngineValidation.rulesSelector),FormEngineValidation.registerSubmitCallback(),FormEngineValidation.validate()}static initializeInputFields(){formEngineFormElement.querySelectorAll(FormEngineValidation.inputSelector).forEach((e=>{const t=JSON.parse(e.dataset.formengineInputParams).field,a=formEngineFormElement.querySelector(selector`[name="${t}"]`)
"formengineInputInitialized"in e.dataset||(a.dataset.config=e.dataset.formengineInputParams,FormEngineValidation.initializeInputField(t))}))}static initializeInputField(e){const t=formEngineFormElement.querySelector(selector`[name="${e}"]`),a=formEngineFormElement.querySelector(selector`[data-formengine-input-name="${e}"]`)
if(void 0!==t.dataset.config){const i=JSON.parse(t.dataset.config),n=FormEngineValidation.formatByEvals(i,t.value)
n.length&&(a.value=n)}new RegularEvent("change",(()=>{FormEngineValidation.updateInputField(a.dataset.formengineInputName)})).bindTo(a),a.dataset.formengineInputInitialized="true"}static registerCustomEvaluation(e,t){customEvaluations.has(e)||customEvaluations.set(e,t)}static formatByEvals(e,t){if(void 0!==e.evalList){const a=Utility.trimExplode(",",e.evalList)
for(const i of a)t=FormEngineValidation.formatValue(i,t)}return t}static formatValue(e,t){switch(e){case"date":case"datetime":case"time":case"timesec":if(""===t||"0"===t)return""
const a=DateTime.fromISO(String(t),{zone:"utc"})
if(!a.isValid)throw new Error("Invalid ISO8601 DateTime string: "+t)
return a.toISO({suppressMilliseconds:!0})
case"password":return t?FormEngineValidation.passwordDummy:""
default:return t.toString()}}static updateInputField(e){const t=formEngineFormElement.querySelector(selector`[name="${e}"]`),a=formEngineFormElement.querySelector(selector`[data-formengine-input-name="${e}"]`)
if(void 0!==t.dataset.config){const i=JSON.parse(t.dataset.config),n=FormEngineValidation.processByEvals(i,a.value),r=FormEngineValidation.formatByEvals(i,n)
t.value!==n&&(t.disabled&&t.dataset.enableOnModification&&(t.disabled=!1),t.value=n,t.dispatchEvent(new Event("change"))),a.value!==r&&(a.value=r)}}static validateField(e){if(void 0===e.dataset.formengineValidationRules)return
let t=e.value||""
const a=JSON.parse(e.dataset.formengineValidationRules)
let i,n,r,o=!1,s=0
Array.isArray(t)||(t=t.trimStart())
for(const l of a){if(o)break
switch(l.type){case"required":""===t&&(o=!0,e.classList.add(FormEngineValidation.errorClass),e.closest(FormEngineValidation.markerSelector)?.querySelector(FormEngineValidation.labelSelector)?.classList.add(FormEngineValidation.errorClass))
break
case"range":if(""!==t){if((l.minItems||l.maxItems)&&(s=null!==(i=formEngineFormElement.querySelector(selector`[name="${e.dataset.relatedfieldname}"]`))?Utility.trimExplode(",",i.value).length:parseInt(e.value,10),void 0!==l.minItems&&(n=1*l.minItems,!isNaN(n)&&s<n&&(o=!0)),void 0!==l.maxItems&&(r=1*l.maxItems,!isNaN(r)&&s>r&&(o=!0))),void 0!==l.lower)if("datetimepicker"===e.dataset.inputType){const m=DateTime.fromISO(t,{zone:"utc"}),c=DateTime.fromISO(l.lower,{zone:"utc"});(!m.isValid||m<c.minus(1e3*c.second))&&(o=!0)}else{const d=1*l.lower
!isNaN(d)&&parseInt(t,10)<d&&(o=!0)}if(void 0!==l.upper)if("datetimepicker"===e.dataset.inputType){m=DateTime.fromISO(t,{zone:"utc"})
const u=DateTime.fromISO(l.upper,{zone:"utc"});(!m.isValid||m>u.plus(1e3*(59-u.second)))&&(o=!0)}else{const g=1*l.upper
!isNaN(g)&&parseInt(t,10)>g&&(o=!0)}}break
case"select":case"category":(l.minItems||l.maxItems)&&(s=null!==(i=formEngineFormElement.querySelector(selector`[name="${e.dataset.relatedfieldname}"]`))?Utility.trimExplode(",",i.value).length:e instanceof HTMLSelectElement?e.querySelectorAll("option:checked").length:e.querySelectorAll("input[value]:checked").length,void 0!==l.minItems&&(n=1*l.minItems,!isNaN(n)&&s<n&&(o=!0)),void 0!==l.maxItems&&(r=1*l.maxItems,!isNaN(r)&&s>r&&(o=!0)))
break
case"group":case"folder":case"inline":(l.minItems||l.maxItems)&&(s=Utility.trimExplode(",",e.value).length,void 0!==l.minItems&&(n=1*l.minItems,!isNaN(n)&&s<n&&(o=!0)),void 0!==l.maxItems&&(r=1*l.maxItems,!isNaN(r)&&s>r&&(o=!0)))
break
case"min":(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&e.value.length>0&&e.value.length<e.minLength&&(o=!0)}}const p=!o
e.classList.toggle(FormEngineValidation.errorClass,!p),e.closest(FormEngineValidation.markerSelector)?.querySelector(FormEngineValidation.labelSelector)?.classList.toggle(FormEngineValidation.errorClass,!p),FormEngineValidation.markParentTab(e,p),formEngineFormElement.dispatchEvent(new CustomEvent("t3-formengine-postfieldvalidation",{detail:{field:e,isValid:p},cancelable:!1,bubbles:!0}))}static processByEvals(e,t){if(void 0!==e.evalList){const a=Utility.trimExplode(",",e.evalList)
for(const i of a)t=FormEngineValidation.processValue(i,t,e)}return t}static processValue(e,t,a){let i="",n="",r=0,o=t
switch(e){case"alpha":case"num":case"alphanum":case"alphanum_x":for(i="",r=0;r<t.length;r++){const s=t.substr(r,1)
let l="_"===s||"-"===s,m=s>="a"&&s<="z"||s>="A"&&s<="Z",c=s>="0"&&s<="9"
switch(e){case"alphanum":l=!1
break
case"alpha":c=!1,l=!1
break
case"num":m=!1,l=!1}(m||c||l)&&(i+=s)}i!==t&&(o=i)
break
case"is_in":if(a.is_in){n=""+t,a.is_in=a.is_in.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")
const d=new RegExp("[^"+a.is_in+"]+","g")
i=n.replace(d,"")}else i=n
o=i
break
case"nospace":o=(""+t).replace(/ /g,"")
break
case"md5":""!==t&&(o=Md5.hash(t))
break
case"upper":o=t.toUpperCase()
break
case"lower":o=t.toLowerCase()
break
case"integer":""!==t&&(o=FormEngineValidation.parseInt(t).toString())
break
case"decimal":""!==t&&(o=FormEngineValidation.parseDouble(t))
break
case"trim":o=String(t).trim()
break
case"time":case"timesec":if(""!==t){o=DateTime.fromISO(t,{zone:"utc"}).set({year:1970,month:1,day:1}).toISO({suppressMilliseconds:!0})}break
case"year":if(""!==t){let u=parseInt(t,10)
isNaN(u)&&(u=(new Date).getUTCFullYear()),o=u.toString(10)}break
case"null":case"password":break
default:customEvaluations.has(e)?o=customEvaluations.get(e).call(null,t):"object"==typeof TBE_EDITOR&&void 0!==TBE_EDITOR.customEvalFunctions&&"function"==typeof TBE_EDITOR.customEvalFunctions[e]&&(o=TBE_EDITOR.customEvalFunctions[e](t))}return o}static validate(e){(void 0===e||e instanceof Document)&&formEngineFormElement.querySelectorAll(FormEngineValidation.markerSelector+", .t3js-tabmenu-item").forEach((e=>{e.classList.remove(FormEngineValidation.validationErrorClass)}))
const t=e||document
for(const a of t.querySelectorAll(FormEngineValidation.rulesSelector))null===a.closest(".t3js-flex-section-deleted, .t3js-inline-record-deleted, .t3js-file-reference-deleted")&&FormEngineValidation.validateField(a)}static markFieldAsChanged(e){e.classList.add("has-change")
const t=e.closest(".t3js-formengine-palette-field")?.querySelector(".t3js-formengine-label")
null!==t&&t.classList.add("has-change")}static parseInt(e){if(!e)return 0
const t=parseInt(""+e,10)
return isNaN(t)?0:t}static parseDouble(e,precision=2){let t=""+e
const a=(t=t.replace(/[^0-9,.-]/g,"")).startsWith("-");-1===(t=(t=t.replace(/-/g,"")).replace(/,/g,".")).indexOf(".")&&(t+=".0")
const i=t.split("."),n=i.pop()
let r=Number(i.join("")+"."+n)
return a&&(r*=-1),t=r.toFixed(precision)}static pol(foreign,value){return eval(("-"==foreign?"-":"")+value)}static markParentTab(e,t){DomHelper.parents(e,".tab-pane").forEach((e=>{t&&(t=null===e.querySelector(".has-error"))
const a=e.id
formEngineFormElement.querySelector('[data-bs-target="#'+a+'"]').closest(".t3js-tabmenu-item").classList.toggle(FormEngineValidation.validationErrorClass,!t)}))}static suspend(){validationSuspended=!0}static resume(){validationSuspended=!1}static registerSubmitCallback(){new SubmitInterceptor(formEngineFormElement).addPreSubmitCallback((()=>{if(validationSuspended||null===document.querySelector("."+FormEngineValidation.errorClass))return!0
const e=Modal.confirm(TYPO3.lang.alert||"Alert",TYPO3.lang["FormEngine.fieldsMissing"],Severity.error,[{text:TYPO3.lang["button.ok"]||"OK",active:!0,btnClass:"btn-default",name:"ok"}])
return e.addEventListener("button.clicked",(()=>e.hideModal())),!1}))}}