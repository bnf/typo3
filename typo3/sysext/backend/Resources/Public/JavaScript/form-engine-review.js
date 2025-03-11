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
import"bootstrap"
import e from"@typo3/core/document-service.js"
import{selector as t}from"@typo3/core/literals.js"
import"@typo3/backend/element/icon-element.js"
import i from"@typo3/backend/popover.js"
import{Tab as o}from"bootstrap"
import n from"@typo3/backend/utility/dom-helper.js"
export class FormEngineReview{constructor(e){this.formElement=e,this.toggleButtonClass="t3js-toggle-review-panel",this.labelSelector=".t3js-formengine-label",this.invalidFields=new Set,this.initialize()}initialize(){this.formElement.addEventListener("t3-formengine-postfieldvalidation",(e=>{const t=e.detail.field
e.detail.isValid?this.invalidFields.delete(t):this.invalidFields.add(t),this.checkForReviewableField()})),e.ready().then((()=>{this.attachButtonToModuleHeader(),this.checkForReviewableField()}))}attachButtonToModuleHeader(){const e=document.querySelector(".t3js-module-docheader-bar-buttons").lastElementChild.querySelector('[role="toolbar"]'),t=document.createElement("typo3-backend-icon")
t.setAttribute("identifier","actions-exclamation-circle"),t.setAttribute("size","small")
const o=document.createElement("button")
o.type="button",o.classList.add("btn","btn-danger","btn-sm","hidden",this.toggleButtonClass),o.title=TYPO3.lang["buttons.reviewFailedValidationFields"],o.appendChild(t),i.popover(o),e.prepend(o)}checkForReviewableField(){const e=document.querySelector("."+this.toggleButtonClass)
if(null!==e)if(this.invalidFields.size>0){const t=document.createElement("div")
t.classList.add("list-group")
for(const o of this.invalidFields){const n=o.closest(".t3js-formengine-validation-marker")
if(null===n)throw console.error(o),new Error("Could not find an element containing the `t3js-formengine-validation-marker` class for the previously logged input field.")
const l=n.querySelector("[data-formengine-validation-rules]")
if(null===l)throw console.error(n),new Error("Could not find an element containing the `data-formengine-validation-rules` attribute for the previously logged container.")
const r=document.createElement("a")
r.classList.add("list-group-item"),r.href="#",r.textContent=n.querySelector(this.labelSelector)?.textContent||"",r.addEventListener("click",(e=>{this.switchToField(e,n,l)})),t.append(r)}e.classList.remove("hidden"),i.setOptions(e,{html:!0,content:t})}else e.classList.add("hidden"),i.hide(e)}switchToField(e,i,l){e.preventDefault()
let r=l
for(;r;){if(r.matches('[id][role="tabpanel"]')){const s=document.querySelector(t`[aria-controls="${r.id}"]`)
new o(s).show()}r=r.parentElement}l.checkVisibility()?l.focus():n.scrollIntoViewIfNeeded(i)}}