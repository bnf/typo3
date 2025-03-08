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
import e from"jquery"
import*as t from"@typo3/form/backend/form-editor/helper.js"
import n from"@typo3/backend/modal.js"
import o from"@typo3/backend/severity.js"
let l=null
const a={domElementClassNames:{buttonDefault:"btn-default",buttonInfo:"btn-info",buttonWarning:"btn-warning"},domElementDataAttributeNames:{elementType:"element-type",fullElementType:"data-element-type"},domElementDataAttributeValues:{rowItem:"rowItem",rowLink:"rowLink",rowsContainer:"rowsContainer",templateInsertElements:"Modal-InsertElements",templateInsertPages:"Modal-InsertPages",templateValidationErrors:"Modal-ValidationErrors"}}
let r=null
function i(){return r}function m(e){return s().isUndefinedOrNull(e)?t.setConfiguration(l):t.setConfiguration(e)}function s(){return i().getUtility()}function d(e,t,n){return i().assert(e,t,n)}function u(){return i().getRootFormElement()}function c(){return i().getPublisherSubscriber()}function f(e,t){return i().getFormElementDefinition(e,t)}function g(t,l){const a=[]
d(s().isNonEmptyString(t),'Invalid parameter "publisherTopicName"',1478889049),d("array"===e.type(l),'Invalid parameter "formElement"',1478889044),a.push({text:f(u(),"modalRemoveElementCancelButton"),active:!0,btnClass:m().getDomElementClassName("buttonDefault"),name:"cancel",trigger:(e,t)=>{t.hideModal()}}),a.push({text:f(u(),"modalRemoveElementConfirmButton"),active:!0,btnClass:m().getDomElementClassName("buttonWarning"),name:"confirm",trigger:(e,n)=>{c().publish(t,l),n.hideModal()}}),n.show(f(u(),"modalRemoveElementDialogTitle"),f(u(),"modalRemoveElementDialogMessage"),o.warning,a)}function p(t,o,l){if(d(s().isNonEmptyString(o),'Invalid parameter "publisherTopicName"',1478910954),"object"===e.type(l))for(const n of Object.keys(l)){if("disableElementTypes"===n&&"array"===e.type(l[n]))for(let o=0,a=l[n].length;o<a;++o)e(m().getDomElementDataAttribute("fullElementType","bracesWithKeyValue",[l[n][o]]),t).addClass(m().getDomElementClassName("disabled"))
"onlyEnableElementTypes"===n&&"array"===e.type(l[n])&&e(m().getDomElementDataAttribute("fullElementType","bracesWithKey"),t).each((function(){for(let t=0,o=l[n].length;t<o;++t){const o=e(this)
o.data(m().getDomElementDataAttribute("elementType"))!==l[n][t]&&o.addClass(m().getDomElementClassName("disabled"))}}))}e("button",t).on("click",(function(){c().publish(o,[e(this).data(m().getDomElementDataAttribute("elementType"))]),e("button",t).off(),n.currentModal.hideModal()}))}function E(t){d("object"===e.type(t),'Invalid parameter "formElement"',1479162557)
const n=document.createElement("span")
return n.textContent=t.get("label")?t.get("label"):t.get("identifier"),n}export function showRemoveFormElementModal(e){g("view/modal/removeFormElement/perform",[e])}export function showRemoveCollectionElementModal(e,t,n){d(s().isNonEmptyString(e),'Invalid parameter "collectionElementIdentifier"',1478894420),d(s().isNonEmptyString(t),'Invalid parameter "collectionName"',1478894421),g("view/modal/removeCollectionElement/perform",[e,t,n])}export function showCloseConfirmationModal(){const e=[]
e.push({text:f(u(),"modalCloseCancelButton"),active:!0,btnClass:m().getDomElementClassName("buttonDefault"),name:"cancel",trigger:(e,t)=>{t.hideModal()}}),e.push({text:f(u(),"modalCloseConfirmButton"),active:!0,btnClass:m().getDomElementClassName("buttonWarning"),name:"confirm",trigger:(e,t)=>{c().publish("view/modal/close/perform",[]),t.hideModal()}}),n.show(f(u(),"modalCloseDialogTitle"),f(u(),"modalCloseDialogMessage"),o.warning,e)}export function showInsertElementsModal(t,l){const a=m().getTemplate("templateInsertElements")
if(a.length>0){const r=e(a.html())
p(r,t,l),n.show(f(u(),"modalInsertElementsDialogTitle"),e(r),o.info)}}export function showInsertPagesModal(t){const l=m().getTemplate("templateInsertPages")
if(l.length>0){const a=e(l.html())
p(a,t),n.show(f(u(),"modalInsertPagesDialogTitle"),e(a),o.info)}}export function showValidationErrorsModal(t){const l=[]
l.push({text:f(u(),"modalValidationErrorsConfirmButton"),active:!0,btnClass:m().getDomElementClassName("buttonDefault"),name:"confirm",trigger:function(e,t){t.hideModal()}})
const a=m().getTemplate("templateValidationErrors")
if(a.length>0){const r=e(a.html()).clone()
!function(t,o){let l,a
d("array"===e.type(o),'Invalid parameter "validationResults"',1479161268)
const r=e(m().getDomElementDataIdentifierSelector("rowItem"),t).clone()
e(m().getDomElementDataIdentifierSelector("rowItem"),t).remove()
for(let n=0,s=o.length;n<s;++n){let s=!1
for(let e=0,t=o[n].validationResults.length;e<t;++e)if(o[n].validationResults[e].validationResults&&o[n].validationResults[e].validationResults.length>0){s=!0
break}s&&(l=i().getFormElementByIdentifierPath(o[n].formElementIdentifierPath),a=r.clone(),e(m().getDomElementDataIdentifierSelector("rowLink"),a).attr(m().getDomElementDataAttribute("elementIdentifier"),o[n].formElementIdentifierPath).get(0).replaceChildren(E(l)),e(m().getDomElementDataIdentifierSelector("rowsContainer"),t).append(a))}e("a",t).on("click",(function(){c().publish("view/modal/validationErrors/element/clicked",[e(this).attr(m().getDomElementDataAttribute("elementIdentifier"))]),e("a",t).off(),n.currentModal.hideModal()}))}(r,t),n.show(f(u(),"modalValidationErrorsDialogTitle"),r,o.error,l)}}export function bootstrap(n,o){return r=n,l=e.extend(!0,a,o||{}),t.bootstrap(r),this}