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
import e from"@typo3/core/document-service.js"
import t from"@typo3/core/event/regular-event.js"
import n from"@typo3/backend/viewport.js"
export default new class{constructor(){this.options={onChangeSelector:'[data-global-event="change"]',onClickSelector:'[data-global-event="click"]',onSubmitSelector:'form[data-global-event="submit"]'},e.ready().then((()=>this.registerEvents()))}registerEvents(){new t("change",this.handleChangeEvent.bind(this)).delegateTo(document,this.options.onChangeSelector),new t("click",this.handleClickEvent.bind(this)).delegateTo(document,this.options.onClickSelector),new t("submit",this.handleSubmitEvent.bind(this)).delegateTo(document,this.options.onSubmitSelector)}handleChangeEvent(e,t){e.preventDefault(),this.handleFormChildAction(e,t)||this.handleFormChildNavigateAction(e,t)}handleClickEvent(e,t){e.preventDefault(),this.handleFormChildAction(e,t)}handleSubmitEvent(e,t){e.preventDefault(),this.handleFormNavigateAction(e,t)}handleFormChildAction(e,t){const n=t.dataset.actionSubmit,l=t.dataset.actionFocus
if(!n&&!l)return!1
let a=null
const o=t.closest("form")
if(n){const i="$form"!==n?document.querySelector(n):null
if("$form"===n&&this.isHTMLFormChildElement(t)?a=t.form:"$form"===n&&o?a=o:i instanceof HTMLFormElement&&(a=i),!(a instanceof HTMLFormElement))return!1
this.assignFormValues(a,t),a.submit()}if(l&&o){if(!(o instanceof HTMLFormElement))return!1
const r=o.querySelector(l)
if(null===r)return!1
r.focus()}return!0}assignFormValues(e,t){const n=t.dataset.formValues,l=n?JSON.parse(n):null
return null!==l&&l instanceof Object&&(Object.entries(l).forEach((([name,value])=>{let t=e.querySelector("[name="+CSS.escape(name)+"]")
t instanceof HTMLElement?this.assignHTMLFormChildElementValue(t,value.toString()):((t=document.createElement("input")).setAttribute("type","hidden"),t.setAttribute("name",name),t.setAttribute("value",value.toString()),e.appendChild(t))})),!0)}handleFormChildNavigateAction(e,t){const l=t.dataset.actionNavigate
if(!l)return!1
const a=this.resolveHTMLFormChildElementValue(t),o=t.dataset.navigateValue
let i=null
return"$data=~s/$value/"===l&&o&&null!==a?i=this.substituteValueVariable(o,a):"$data"===l&&o?i=o:"$value"===l&&a&&(i=a),null!==i&&(n.ContentContainer.setUrl(i),!0)}handleFormNavigateAction(e,t){const l=t.action,a=t.dataset.actionNavigate
if(!l||!a)return!1
const o=t.dataset.navigateValue,i=t.dataset.valueSelector,r=this.resolveHTMLFormChildElementValue(t.querySelector(i))
let s=null
return"$form=~s/$value/"===a&&o&&null!==r?s=this.substituteValueVariable(o,r):"$form"===a&&(s=l),null!==s&&(n.ContentContainer.setUrl(s),!0)}substituteValueVariable(e,t){return e.replace(/(\$\{value\}|%24%7Bvalue%7D|\$\[value\]|%24%5Bvalue%5D)/gi,t)}isHTMLFormChildElement(e){return e instanceof HTMLSelectElement||e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement}resolveHTMLFormChildElementValue(e){const t=e.getAttribute("type")
if(e instanceof HTMLSelectElement)return e.options[e.selectedIndex].value
if(e instanceof HTMLInputElement&&"checkbox"===t){const n=e.dataset.emptyValue
return e.checked?e.value:void 0!==n?n:""}return e instanceof HTMLInputElement?e.value:null}assignHTMLFormChildElementValue(e,t){const n=e.getAttribute("type")
if(e instanceof HTMLSelectElement)Array.from(e.options).some(((n,l)=>n.value===t&&(e.selectedIndex=l,!0)))
else if(e instanceof HTMLInputElement&&"checkbox"===n){const l=e.dataset.emptyValue
void 0!==l&&l===t?e.checked=!1:e.value===t&&(e.checked=!0)}else e instanceof HTMLInputElement&&(e.value=t)}}
