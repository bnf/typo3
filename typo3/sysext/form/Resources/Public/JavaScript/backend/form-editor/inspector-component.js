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
import o from"@typo3/backend/icons.js"
import r from"@typo3/backend/modal.js"
import{MessageUtility as n}from"@typo3/backend/utility/message-utility.js"
import i from"sortablejs"
import{selector as a}from"@typo3/core/literals.js"
const l={domElementClassNames:{buttonFormElementRemove:"formeditor-inspector-element-remove-button",collectionElement:"formeditor-inspector-collection-element",finisherEditorPrefix:"t3-form-inspector-finishers-editor-",inspectorEditor:"formeditor-inspector-element",inspectorInputGroup:"input-group",validatorEditorPrefix:"formeditor-inspector-validators-editor-"},domElementDataAttributeNames:{contentElementSelectorTarget:"data-insert-target",finisher:"data-finisher-identifier",validator:"data-validator-identifier",randomId:"data-random-id",randomIdTarget:"data-random-id-attribute",randomIdIndex:"data-random-id-number",maximumFileSize:"data-maximumFileSize"},domElementDataAttributeValues:{collapse:"actions-view-table-expand",editorControlsInputGroup:"inspectorEditorControlsGroup",editorWrapper:"editorWrapper",editorControlsWrapper:"inspectorEditorControlsWrapper",formElementHeaderEditor:"inspectorFormElementHeaderEditor",formElementSelectorControlsWrapper:"inspectorEditorFormElementSelectorControlsWrapper",formElementSelectorSplitButtonContainer:"inspectorEditorFormElementSelectorSplitButtonContainer",formElementSelectorSplitButtonListContainer:"inspectorEditorFormElementSelectorSplitButtonListContainer",iconNotAvailable:"actions-close",inspector:"inspector","Inspector-CheckboxEditor":"Inspector-CheckboxEditor","Inspector-CollectionElementHeaderEditor":"Inspector-CollectionElementHeaderEditor","Inspector-FinishersEditor":"Inspector-FinishersEditor","Inspector-FormElementHeaderEditor":"Inspector-FormElementHeaderEditor","Inspector-PropertyGridEditor":"Inspector-PropertyGridEditor","Inspector-RemoveElementEditor":"Inspector-RemoveElementEditor","Inspector-RequiredValidatorEditor":"Inspector-RequiredValidatorEditor","Inspector-SingleSelectEditor":"Inspector-SingleSelectEditor","Inspector-MultiSelectEditor":"Inspector-MultiSelectEditor","Inspector-GridColumnViewPortConfigurationEditor":"Inspector-GridColumnViewPortConfigurationEditor","Inspector-TextareaEditor":"Inspector-TextareaEditor","Inspector-TextEditor":"Inspector-TextEditor","Inspector-Typo3WinBrowserEditor":"Inspector-Typo3WinBrowserEditor","Inspector-ValidatorsEditor":"Inspector-ValidatorsEditor","Inspector-ValidationErrorMessageEditor":"Inspector-ValidationErrorMessageEditor",inspectorFinishers:"inspectorFinishers",inspectorValidators:"inspectorValidators",propertyGridEditorHeaderRow:"headerRow",propertyGridEditorAddRow:"addRow",propertyGridEditorAddRowItem:"addRowItem",propertyGridEditorContainer:"propertyGridContainer",propertyGridEditorDeleteRow:"deleteRow",propertyGridEditorLabel:"label",propertyGridEditorRowItem:"rowItem",propertyGridEditorColumn:"column",propertyGridEditorSelectValue:"selectValue",propertyGridEditorSortRow:"sortRow",propertyGridEditorValue:"value",viewportButton:"viewportButton"},domElementIdNames:{finisherPrefix:"t3-form-inspector-finishers-",validatorPrefix:"t3-form-inspector-validators-"},isSortable:!0}
let p=null,d=null
function s(){return d}function m(){return s().getViewModel()}function c(e){return E().isUndefinedOrNull(e)?t.setConfiguration(p):t.setConfiguration(e)}function E(){return s().getUtility()}function f(e,t,o){return s().assert(e,t,o)}function u(){return s().getRootFormElement()}function g(){return s().getCurrentlySelectedFormElement()}function y(){return s().getPublisherSubscriber()}function b(e,t){return s().getFormElementDefinition(e,t)}function h(e,t,o,r){switch(e.templateName){case"Inspector-FormElementHeaderEditor":renderFormElementHeaderEditor(e,t)
break
case"Inspector-CollectionElementHeaderEditor":renderCollectionElementHeaderEditor(e,t,o,r)
break
case"Inspector-MaximumFileSizeEditor":renderFileMaxSizeEditor(e,t)
break
case"Inspector-TextEditor":renderTextEditor(e,t,o,r)
break
case"Inspector-FinishersEditor":renderCollectionElementSelectionEditor("finishers",e,t)
break
case"Inspector-ValidatorsEditor":renderCollectionElementSelectionEditor("validators",e,t)
break
case"Inspector-ValidationErrorMessageEditor":renderValidationErrorMessageEditor(e,t)
break
case"Inspector-RemoveElementEditor":renderRemoveElementEditor(e,t,o,r)
break
case"Inspector-RequiredValidatorEditor":renderRequiredValidatorEditor(e,t,o,r)
break
case"Inspector-CheckboxEditor":renderCheckboxEditor(e,t,o,r)
break
case"Inspector-CountrySelectEditor":renderCountrySelectEditor(e,t,o,r)
break
case"Inspector-SingleSelectEditor":renderSingleSelectEditor(e,t,o,r)
break
case"Inspector-MultiSelectEditor":renderMultiSelectEditor(e,t,o,r)
break
case"Inspector-GridColumnViewPortConfigurationEditor":renderGridColumnViewPortConfigurationEditor(e,t)
break
case"Inspector-PropertyGridEditor":renderPropertyGridEditor(e,t,o,r)
break
case"Inspector-TextareaEditor":renderTextareaEditor(e,t,o,r)
break
case"Inspector-Typo3WinBrowserEditor":renderTypo3WinBrowserEditor(e,t,o,r)}y().publish("view/inspector/editor/insert/perform",[e,t,o,r])}function D(e,t){return"finishers"===e?c().getDomElementClassName("finisherEditorPrefix")+t:c().getDomElementClassName("validatorEditorPrefix")+t}function v(e,t,o){return"finishers"===e?c().getDomElementIdName("finisherPrefix",o)+t:c().getDomElementIdName("validatorPrefix",o)+t}function I(t,o,r,n){let i
if(o){const a=[]
e(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer")+" "+c().getDomElementDataIdentifierSelector("propertyGridEditorSelectValue")+":checked",e(t)).each((function(){i=e(this).closest(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem")).find(c().getDomElementDataIdentifierSelector("propertyGridEditorValue")).val(),E().canBeInterpretedAsInteger(i)&&(i=parseInt(i,10)),a.push(i)})),g().set(n+"defaultValue",a)}else i=e(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer")+" "+c().getDomElementDataIdentifierSelector("propertyGridEditorSelectValue")+":checked",e(t)).first().closest(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem")).find(c().getDomElementDataIdentifierSelector("propertyGridEditorValue")).val(),E().canBeInterpretedAsInteger(i)&&(i=parseInt(i,10)),g().set(n+"defaultValue",i,!0)
const l=[]
e(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer")+" "+c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem"),e(t)).each((function(){let t=e(this).find(c().getDomElementDataIdentifierSelector("propertyGridEditorValue")).val()
const o=e(this).find(c().getDomElementDataIdentifierSelector("propertyGridEditorLabel")).val()
""===t&&(t=o)
l.push({_label:o,_value:t})})),g().set(n+r,l),C(n+r,t)}function P(t){return e(c().getDomElementDataIdentifierSelector("editorWrapper"),e(t))}function S(t){return e(c().getDomElementDataIdentifierSelector("editorControlsWrapper"),e(t))}function C(e,t){let o,r,n;(n=s().validateCurrentlySelectedFormElementProperty(e)).length>0?(c().getTemplatePropertyDomElement("validationErrors",t).html('<span class="text-danger">'+n[0]+"</span>"),m().setElementValidationErrorClass(S(t),"hasError")):(c().getTemplatePropertyDomElement("validationErrors",t).html(""),m().removeElementValidationErrorClass(S(t),"hasError")),n=s().validateFormElement(g()),r=(r=e.split("."))[0]+"."+r[1],o=!1
for(let i=0,a=n.length;i<a;++i)if(0===n[i].propertyPath.indexOf(r,0)&&n[i].validationResults&&n[i].validationResults.length>0){o=!0
break}o?m().setElementValidationErrorClass(S(t).closest(c().getDomElementClassName("collectionElement",!0))):m().removeElementValidationErrorClass(S(t).closest(c().getDomElementClassName("collectionElement",!0)))}function x(t,o){f("array"===e.type(t),'Invalid configuration "errorCodes"',1489932939),f("array"===e.type(o),'Invalid configuration "propertyData"',1489932940)
for(let r=0,n=t.length;r<n;++r)for(let i=0,a=o.length;i<a;++i)if(parseInt(t[r],10)===parseInt(o[i].code,10)&&E().isNonEmptyString(o[i].message))return o[i].message
return null}function T(t,o,r){if(f("array"===e.type(o),'Invalid configuration "propertyData"',1489932942),!E().isUndefinedOrNull(t)&&"array"===e.type(t)){const n=[]
for(let i=0,a=t.length;i<a;++i){let l=!1
for(let p=0,d=o.length;p<d;++p)parseInt(t[i],10)===parseInt(o[p].code,10)&&(l=!0,E().isNonEmptyString(r)?o[p].message=r:(o.splice(p,1),--d))
l||E().isNonEmptyString(r)&&n.push({code:t[i],message:r})}o=o.concat(n)}return o}function N(t){f("object"===e.type(t),'Invalid input "html"',1523904699),e(c().getDomElementClassName("inspectorEditor",!0)).each((function(){const t=e(this),o={}
e(c().getDomElementDataAttribute("randomId","bracesWithKey"),t).each((function(){const t=e(this),r=t.attr(c().getDomElementDataAttribute("randomIdTarget")),n=t.attr(c().getDomElementDataAttribute("randomIdIndex"))
t.is("["+r+"]")||(n in o||(o[n]="fe"+Math.floor(42*Math.random())+Date.now()),t.attr(r,o[n]))}))}))}export function getInspectorDomElement(){return e(c().getDomElementDataIdentifierSelector("inspector"))}export function getFinishersContainerDomElement(){return e(c().getDomElementDataIdentifierSelector("inspectorFinishers"),getInspectorDomElement())}export function getValidatorsContainerDomElement(){return e(c().getDomElementDataIdentifierSelector("inspectorValidators"),getInspectorDomElement())}export function getCollectionElementDomElement(t,o){return"finishers"===t?e(c().getDomElementDataAttribute("finisher","bracesWithKeyValue",[o]),getFinishersContainerDomElement()):e(c().getDomElementDataAttribute("validator","bracesWithKeyValue",[o]),getValidatorsContainerDomElement())}export function renderEditors(t,o){E().isUndefinedOrNull(t)&&(t=g()),getInspectorDomElement().off().empty()
const r=b(t,void 0)
if("array"===e.type(r.editors)){for(let n=0,i=r.editors.length;n<i;++n){const a=c().getTemplate(r.editors[n].templateName).clone()
if(!a.length)continue
const l=e(a.html())
e(l).first().addClass(c().getDomElementClassName("inspectorEditor")),getInspectorDomElement().append(e(l)),N(l),h(r.editors[n],l)}"function"===e.type(o)&&o()}}export function renderCollectionElementEditors(t,o){let r,n,a
f(E().isNonEmptyString(t),'Invalid parameter "collectionName"',1478354853),f(E().isNonEmptyString(o),'Invalid parameter "collectionElementIdentifier"',1478354854)
const l=s().getPropertyCollectionElementConfiguration(o,t)
if("array"!==e.type(l.editors))return
const d=e("<div></div>").addClass(c().getDomElementClassName("collectionElement")).addClass("panel").addClass("panel-default")
"finishers"===t?(a=getFinishersContainerDomElement(),d.attr(c().getDomElementDataAttribute("finisher"),o)):(a=getValidatorsContainerDomElement(),d.attr(c().getDomElementDataAttribute("validator"),o)),a.append(d)
const m=l.editors.length
m>0&&"header"===l.editors[0].identifier&&((n=document.createElement("div")).classList.add("panel-body"),(r=document.createElement("div")).classList.add("panel-collapse","collapse"),r.id=v(t,o),r.appendChild(n))
for(let u=0;u<m;++u){const g=c().getTemplate(l.editors[u].templateName).clone()
if(!g.length)continue
const b=e(g.html())
e(b).first().addClass(D(t,l.editors[u].identifier)).addClass(c().getDomElementClassName("inspectorEditor")),0===u&&r?getCollectionElementDomElement(t,o).append(b).append(r):u===m-1&&r&&"removeButton"===l.editors[u].identifier||u>0&&r?n.append(b.get(0)):getCollectionElementDomElement(t,o).append(b),N(b),h(l.editors[u],b,o,t)}(2===m&&"header"===l.editors[0].identifier&&"removeButton"===l.editors[1].identifier||1===m&&"header"===l.editors[0].identifier)&&e(c().getDomElementDataIdentifierSelector("collapse"),d).remove(),p.isSortable&&function(t,o){t.addClass(c().getDomElementClassName("sortable")),new i(t.get(0),{draggable:c().getDomElementClassName("collectionElement",!0),filter:"input,textarea,select",preventOnFilter:!1,animation:200,fallbackTolerance:200,swapThreshold:.6,dragClass:"formeditor-sortable-drag",ghostClass:"formeditor-sortable-ghost",onEnd:function(t){let r
r="finishers"===o?c().getDomElementDataAttribute("finisher"):c().getDomElementDataAttribute("validator")
const n=e(t.item).attr(r),i=e(t.item).prevAll(c().getDomElementClassName("collectionElement",!0)).first().attr(r),a=e(t.item).nextAll(c().getDomElementClassName("collectionElement",!0)).first().attr(r)
y().publish("view/inspector/collectionElements/dnd/update",[n,i,a,o])}})}(a,t)}export function renderCollectionElementSelectionEditor(t,o,r){let n,i,l
f(E().isNonEmptyString(t),'Invalid configuration "collectionName"',1478362968),f("object"===e.type(o),'Invalid parameter "editorConfiguration"',1475423098),f("object"===e.type(r),'Invalid parameter "editorHtml"',1475423099),f(E().isNonEmptyString(o.label),'Invalid configuration "label"',1475423100),f("array"===e.type(o.selectOptions),'Invalid configuration "selectOptions"',1475423101),"finishers"===t?(i=getFinishersContainerDomElement(),n=u().get(t)):(i=getValidatorsContainerDomElement(),n=g().get(t)),i.off().empty(),c().getTemplatePropertyDomElement("label",r).text(o.label)
const p=c().getTemplatePropertyDomElement("selectOptions",r),d=!E().isUndefinedOrNull(n)&&n.length>0
if(d)for(let m=0,b=n.length;m<b;++m)y().publish("view/inspector/collectionElement/existing/selected",[n[m].identifier,t])
l=!0
m=0
for(let h=o.selectOptions.length;m<h;++m){let D=!0
if(!E().isUndefinedOrNull(n))for(let v=0,I=n.length;v<I;++v)if(n[v].identifier===o.selectOptions[m].value){D=!1
break}D&&(p.append(new Option(o.selectOptions[m].label,o.selectOptions[m].value)),""!==o.selectOptions[m].value&&(l=!1))}if(l){c().getTemplatePropertyDomElement("select-group",r).off().empty().remove()
const P=c().getTemplatePropertyDomElement("label-no-select",r)
d?P.text(o.label):P.remove()}else c().getTemplatePropertyDomElement("label-no-select",r).remove(),p.on("change",(function(){if(""!==e(this).val()){const o=e(this).val()
e(a`option[value="${o}"]`,e(this)).remove(),s().getPublisherSubscriber().publish("view/inspector/collectionElement/new/selected",[o,t])}}))}export function renderFormElementHeaderEditor(t,r){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475421525),f("object"===e.type(r),'Invalid parameter "editorHtml"',1475421526),o.getIcon(b(g(),"iconIdentifier"),o.sizes.small,null,o.states.default).then((function(t){c().getTemplatePropertyDomElement("header-label",r).append(e(t).addClass(c().getDomElementClassName("icon"))).append(buildTitleByFormElement()).append("<code>"+g().get("identifier")+"</code>")}))}export function renderCollectionElementHeaderEditor(t,r,n,i){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475421258),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475421257),f("object"===e.type(r),'Invalid parameter "editorHtml"',1475421259)
const a=function(e){const t=c().getTemplatePropertyDomElement("panel-icon",r)
e?t.replaceWith(e):t.remove()
const o=s().getPropertyCollectionElementConfiguration(n,i).editors
if(!(2===o.length&&"header"===o[0].identifier&&"removeButton"===o[1].identifier||1===o.length&&"header"===o[0].identifier)){const a=document.createElement("button")
a.classList.add("panel-button","collapsed"),a.setAttribute("type","button"),a.setAttribute("data-bs-toggle","collapse"),a.setAttribute("data-bs-target",v(i,n,!0)),a.setAttribute("aria-expaned","false"),a.setAttribute("aria-controls",v(i,n))
const l=document.createElement("span")
l.classList.add("caret"),c().getTemplatePropertyDomElement("panel-heading-row",r).find(".panel-title").before(l),c().getTemplatePropertyDomElement("panel-heading-row",r).wrapInner(a)}const p=getCollectionElementDomElement(i,n).get(0).querySelector(".formeditor-inspector-element-remove-button")
if(p){const d=p.querySelector("button")
d.classList.add("btn-sm"),d.querySelector(".btn-label").classList.add("visually-hidden")
const m=document.createElement("div")
m.classList.add("panel-actions"),m.append(d),c().getTemplatePropertyDomElement("panel-heading-row",r).append(m)}p?.remove()},l=s().getFormEditorDefinition(i,n)
"iconIdentifier"in l?o.getIcon(l.iconIdentifier,o.sizes.small,null,o.states.default).then((function(e){a(e)})):a(),t.label&&c().getTemplatePropertyDomElement("panel-title",r).removeAttr("data-template-property").append(t.label)}export function renderFileMaxSizeEditor(t,o){if(f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475421258),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475421257),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475421259),t.label){const r=c().getTemplatePropertyDomElement("label",o),n=r.attr(c().getDomElementDataAttribute("maximumFileSize"))
r.append(t.label.replace("{0}",n))}}export function renderTextEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475421053),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475421054),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475421055),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1475421056),c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",o).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",o).remove(),E().isNonEmptyString(t.placeholder)&&c().getTemplatePropertyDomElement("propertyPath",o).attr("placeholder",t.placeholder)
const i=s().buildPropertyPath(t.propertyPath,r,n),a=g().get(i)
if(C(i,o),c().getTemplatePropertyDomElement("propertyPath",o).val(a),!E().isUndefinedOrNull(t.additionalElementPropertyPaths)&&"array"===e.type(t.additionalElementPropertyPaths))for(let l=0,p=t.additionalElementPropertyPaths.length;l<p;++l)g().set(t.additionalElementPropertyPaths[l],a)
renderFormElementSelectorEditorAddition(t,o,i),c().getTemplatePropertyDomElement("propertyPath",o).on("keyup paste",(function(){if(t.doNotSetIfPropertyValueIsEmpty&&!E().isNonEmptyString(e(this).val())?g().unset(i):g().set(i,e(this).val()),C(i,o),!E().isUndefinedOrNull(t.additionalElementPropertyPaths)&&"array"===e.type(t.additionalElementPropertyPaths))for(let r=0,n=t.additionalElementPropertyPaths.length;r<n;++r)t.doNotSetIfPropertyValueIsEmpty&&!E().isNonEmptyString(e(this).val())?g().unset(t.additionalElementPropertyPaths[r]):g().set(t.additionalElementPropertyPaths[r],e(this).val())}))}export function renderValidationErrorMessageEditor(t,o){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1489874121),f("object"===e.type(o),'Invalid parameter "editorHtml"',1489874122),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1489874123),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1489874124),c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",o).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",o).remove()
const r=s().buildPropertyPath(t.propertyPath)
let n=g().get(r)
if(!E().isUndefinedOrNull(n)&&"array"===e.type(n)){const i=x(t.errorCodes,n)
E().isUndefinedOrNull(i)||c().getTemplatePropertyDomElement("propertyPath",o).val(i)}c().getTemplatePropertyDomElement("propertyPath",o).on("keyup paste",(function(){n=g().get(r),E().isUndefinedOrNull(n)&&(n=[]),g().set(r,T(t.errorCodes,n,e(this).val()))}))}export function renderCountrySelectEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1674826430),f("object"===e.type(o),'Invalid parameter "editorHtml"',1674826431),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1674826432)
const i=s().buildPropertyPath(t.propertyPath,r,n)
c().getTemplatePropertyDomElement("label",o).append(t.label)
const a=c().getTemplatePropertyDomElement("selectOptions",o),l=g().get(i)||{},p=e("option",a)
a.empty()
for(let d=0,m=p.length;d<m;++d){let u=!1
for(const y of Object.keys(l))if(p[d].value===l[y]){u=!0
break}const b=new Option(p[d].text,d.toString(),!1,u)
e(b).data({value:p[d].value}),a.append(b)}a.on("change",(function(){const t=[]
e("option:selected",e(this)).each((function(){t.push(e(this).data("value"))})),g().set(i,t)}))}export function renderSingleSelectEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475421048),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475421049),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475421050),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1475421051),f("array"===e.type(t.selectOptions),'Invalid configuration "selectOptions"',1475421052)
const i=s().buildPropertyPath(t.propertyPath,r,n)
c().getTemplatePropertyDomElement("label",o).append(t.label)
const a=c().getTemplatePropertyDomElement("selectOptions",o),l=g().get(i)
for(let p=0,d=t.selectOptions.length;p<d;++p){let m
m=t.selectOptions[p].value===l?new Option(t.selectOptions[p].label,p.toString(),!1,!0):new Option(t.selectOptions[p].label,p.toString()),e(m).data({value:t.selectOptions[p].value}),a.append(m)}a.on("change",(function(){g().set(i,e("option:selected",e(this)).data("value"))}))}export function renderMultiSelectEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1485712399),f("object"===e.type(o),'Invalid parameter "editorHtml"',1485712400),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1485712401),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1485712402),f("array"===e.type(t.selectOptions),'Invalid configuration "selectOptions"',1485712403)
const i=s().buildPropertyPath(t.propertyPath,r,n)
c().getTemplatePropertyDomElement("label",o).append(t.label)
const a=c().getTemplatePropertyDomElement("selectOptions",o),l=g().get(i)||{}
for(let p=0,d=t.selectOptions.length;p<d;++p){let m=null
for(const u of Object.keys(l))if(t.selectOptions[p].value===l[u]){m=new Option(t.selectOptions[p].label,p.toString(),!1,!0)
break}m||(m=new Option(t.selectOptions[p].label,p.toString())),e(m).data({value:t.selectOptions[p].value}),a.append(m)}a.on("change",(function(){const t=[]
e("option:selected",e(this)).each((function(){t.push(e(this).data("value"))})),g().set(i,t)}))}export function renderGridColumnViewPortConfigurationEditor(t,o){if(f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1489528242),f("object"===e.type(o),'Invalid parameter "editorHtml"',1489528243),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1489528244),f("array"===e.type(t.configurationOptions.viewPorts),'Invalid configurationOptions "viewPorts"',1489528245),f(!E().isUndefinedOrNull(t.configurationOptions.numbersOfColumnsToUse.label),'Invalid configurationOptions "numbersOfColumnsToUse"',1489528246),f(!E().isUndefinedOrNull(t.configurationOptions.numbersOfColumnsToUse.propertyPath),'Invalid configuration "selectOptions"',1489528247),!b(g().get("__parentRenderable"),"_isGridRowFormElement"))return void o.remove()
c().getTemplatePropertyDomElement("label",o).append(t.label)
const r=e(c().getDomElementDataIdentifierSelector("viewportButton"),e(o)).clone()
e(c().getDomElementDataIdentifierSelector("viewportButton"),e(o)).remove()
const n=c().getTemplatePropertyDomElement("numbersOfColumnsToUse",e(o)).clone()
c().getTemplatePropertyDomElement("numbersOfColumnsToUse",e(o)).remove()
const i=S(o),a=function(r){c().getTemplatePropertyDomElement("numbersOfColumnsToUse",e(o)).off().empty().remove()
const i=e(n).clone(!0,!0)
P(o).after(i),e("input",i).focus(),c().getTemplatePropertyDomElement("numbersOfColumnsToUse-label",i).append(t.configurationOptions.numbersOfColumnsToUse.label.replace("{@viewPortLabel}",r.data("viewPortLabel"))),c().getTemplatePropertyDomElement("numbersOfColumnsToUse-fieldExplanationText",i).append(t.configurationOptions.numbersOfColumnsToUse.fieldExplanationText)
const a=t.configurationOptions.numbersOfColumnsToUse.propertyPath.replace("{@viewPortIdentifier}",r.data("viewPortIdentifier"))
c().getTemplatePropertyDomElement("numbersOfColumnsToUse-propertyPath",i).val(g().get(a)),c().getTemplatePropertyDomElement("numbersOfColumnsToUse-propertyPath",i).on("keyup paste change",(function(){const t=e(this)
e.isNumeric(t.val())||t.val(""),g().set(a,t.val())}))}
for(let l=0,p=t.configurationOptions.viewPorts.length;l<p;++l){const d=t.configurationOptions.viewPorts[l].viewPortIdentifier,s=t.configurationOptions.viewPorts[l].label,m=e(r).clone(!0,!0)
if(m.text(d),m.data("viewPortIdentifier",d),m.data("viewPortLabel",s),m.attr("title",s),i.append(m),l===p-1){const u=e(n).clone(!0,!0)
P(o).after(u),a(m),m.addClass(c().getDomElementClassName("active"))}e("button",i).on("click",(function(){const t=e(this)
e("button",i).removeClass(c().getDomElementClassName("active")),t.addClass(c().getDomElementClassName("active")),a(t)}))}}export function renderPropertyGridEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475419226),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475419227),f("boolean"===e.type(t.enableAddRow),'Invalid configuration "enableAddRow"',1475419228),f("boolean"===e.type(t.enableDeleteRow),'Invalid configuration "enableDeleteRow"',1475419230),f("boolean"===e.type(t.isSortable),'Invalid configuration "isSortable"',1475419229),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1475419231),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475419232),c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",o).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",o).remove()
let a,l=s().buildPropertyPath(void 0,r,n,void 0,!0)
E().isNonEmptyString(l)&&(l+="."),a=!!E().isUndefinedOrNull(t.useLabelAsFallbackValue)||t.useLabelAsFallbackValue
let p=[{name:"label",title:"Label"},{name:"value",title:"Value"},{name:"selected",title:"Selected"}]
E().isNonEmptyArray(t.gridColumns)&&(p=t.gridColumns)
const d=p.map((function(e){return e.name})),m=p.map((function(e){return e.title||null}))
let u
e([c().getDomElementDataIdentifierSelector("propertyGridEditorHeaderRow"),c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem"),c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem")].join(","),e(o)).each((function(t,o){const r=e(c().getDomElementDataIdentifierSelector("propertyGridEditorColumn"),o),n=r.last().nextAll(),i={}
r.detach().each((function(t,o){const r=e(o),n=r.data("column")
d.includes(n)&&(i[n]=r)})),d.forEach((function(e,t){const r=i[e]
r.is("th")&&r.append(m[t]),r.appendTo(o)})),n.appendTo(o)})),u=!E().isUndefinedOrNull(t.multiSelection)&&!!t.multiSelection
const y=e(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem"),e(o)).clone()
if(e(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem"),e(o)).remove(),t.enableDeleteRow?e(c().getDomElementDataIdentifierSelector("propertyGridEditorDeleteRow"),e(y)).on("click",(function(){e(this).closest(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem")).off().empty().remove(),I(e(o),u,t.propertyPath,l)})):e(c().getDomElementDataIdentifierSelector("propertyGridEditorDeleteRow"),e(y)).parent().off().empty(),t.isSortable?e(o).get(0).querySelectorAll(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer")+" tbody").forEach((function(r){new i(r,{group:c().getDomElementDataAttributeValue("propertyGridEditorContainer"),handle:c().getDomElementDataIdentifierSelector("propertyGridEditorSortRow"),draggable:c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem"),pull:"clone",swapThreshold:.6,dragClass:"formeditor-sortable-drag",ghostClass:"formeditor-sortable-ghost",onUpdate:function(){I(e(o),u,t.propertyPath,l)}})})):e(c().getDomElementDataIdentifierSelector("propertyGridEditorSortRow"),e(y)).parent().off().empty(),e(c().getDomElementDataIdentifierSelector("propertyGridEditorSelectValue"),e(y)).on("change",(function(){u||e(c().getDomElementDataIdentifierSelector("propertyGridEditorSelectValue")+":checked",e(o)).not(e(this)).prop("checked",!1),I(e(o),u,t.propertyPath,l)})),e(c().getDomElementDataIdentifierSelector("propertyGridEditorLabel")+","+c().getDomElementDataIdentifierSelector("propertyGridEditorValue"),e(y)).on("keyup paste",(function(){I(e(o),u,t.propertyPath,l)})),a&&e(c().getDomElementDataIdentifierSelector("propertyGridEditorLabel"),e(y)).on("focusout",(function(){""===e(this).closest(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem")).find(c().getDomElementDataIdentifierSelector("propertyGridEditorValue")).val()&&e(this).closest(c().getDomElementDataIdentifierSelector("propertyGridEditorRowItem")).find(c().getDomElementDataIdentifierSelector("propertyGridEditorValue")).val(e(this).val())})),t.enableAddRow){const b=e(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem"),e(o)).clone()
e(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem"),e(o)).remove(),e(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRow"),e(b)).on("click",(function(){e(this).closest(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem")).before(e(y).clone(!0,!0)),I(e(o),u,t.propertyPath,l)})),e(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer"),e(o)).prepend(e(b).clone(!0,!0))}else e(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem"),e(o)).remove()
let h={}
u?E().isUndefinedOrNull(g().get(l+"defaultValue"))||(h=g().get(l+"defaultValue")):E().isUndefinedOrNull(g().get(l+"defaultValue"))||(h={0:g().get(l+"defaultValue")})
const D=g().get(l+t.propertyPath)||{},v=function(r,n){let i=!1
const a=e(y).clone(!0,!0)
for(const l of Object.keys(h))if(h[l]===n){i=!0
break}e(c().getDomElementDataIdentifierSelector("propertyGridEditorLabel"),e(a)).val(r),e(c().getDomElementDataIdentifierSelector("propertyGridEditorValue"),e(a)).val(n),i&&e(c().getDomElementDataIdentifierSelector("propertyGridEditorSelectValue"),e(a)).prop("checked",!0),t.enableAddRow?e(c().getDomElementDataIdentifierSelector("propertyGridEditorAddRowItem"),e(o)).before(e(a)):e(c().getDomElementDataIdentifierSelector("propertyGridEditorContainer"),e(o)).prepend(e(a))}
if("object"===e.type(D))for(const P of Object.keys(D))v(D[P],P)
else if("array"===e.type(D))for(const P in D)D.hasOwnProperty(P)&&(E().isUndefinedOrNull(D[P]._label)?v(D[P],P):v(D[P]._label,D[P]._value))
C(l+t.propertyPath,o)}export function renderRequiredValidatorEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475417093),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475417094),f(E().isNonEmptyString(t.validatorIdentifier),'Invalid configuration "validatorIdentifier"',1475417095),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475417096)
const i=t.validatorIdentifier
let a,l,p
c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.propertyPath)&&(l=s().buildPropertyPath(t.propertyPath,r,n)),a=E().isNonEmptyString(t.propertyValue)?t.propertyValue:""
const d=s().buildPropertyPath(t.configurationOptions.validationErrorMessage.propertyPath),m=c().getTemplatePropertyDomElement("validationErrorMessage",e(o)).clone()
c().getTemplatePropertyDomElement("validationErrorMessage",e(o)).remove()
const u=function(){const r=e(m).clone(!0,!0)
P(o).after(r),c().getTemplatePropertyDomElement("validationErrorMessage-label",r).append(t.configurationOptions.validationErrorMessage.label),c().getTemplatePropertyDomElement("validationErrorMessage-fieldExplanationText",r).append(t.configurationOptions.validationErrorMessage.fieldExplanationText),p=g().get(d),E().isUndefinedOrNull(p)&&(p=[])
const n=x(t.configurationOptions.validationErrorMessage.errorCodes,p)
E().isUndefinedOrNull(n)||c().getTemplatePropertyDomElement("validationErrorMessage-propertyPath",r).val(n),c().getTemplatePropertyDomElement("validationErrorMessage-propertyPath",r).on("keyup paste",(function(){let o=g().get(d)
E().isUndefinedOrNull(o)&&(o=[]),g().set(d,T(t.configurationOptions.validationErrorMessage.errorCodes,o,e(this).val()))}))};-1!==s().getIndexFromPropertyCollectionElement(i,"validators")&&(e('input[type="checkbox"]',e(o)).prop("checked",!0),E().isNonEmptyString(l)&&g().set(l,a),u()),e('input[type="checkbox"]',e(o)).on("change",(function(){c().getTemplatePropertyDomElement("validationErrorMessage",e(o)).off().empty().remove(),e(this).is(":checked")?(u(),y().publish("view/inspector/collectionElement/new/selected",[i,"validators"]),E().isNonEmptyString(l)&&g().set(l,a)):(y().publish("view/inspector/removeCollectionElement/perform",[i,"validators"]),E().isNonEmptyString(l)&&g().unset(l),p=g().get(d),E().isUndefinedOrNull(p)&&(p=[]),g().set(d,T(t.configurationOptions.validationErrorMessage.errorCodes,p,"")))}))}export function renderCheckboxEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1476218671),f("object"===e.type(o),'Invalid parameter "editorHtml"',1476218672),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1476218673),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1476218674),c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",o).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",o).remove()
const i=s().buildPropertyPath(t.propertyPath,r,n),a=g().get(i);("boolean"===e.type(a)&&a||"true"===a||1===a||"1"===a)&&e('input[type="checkbox"]',e(o)).prop("checked",!0),e('input[type="checkbox"]',e(o)).on("change",(function(){e(this).is(":checked")?g().set(i,!0):g().set(i,!1)}))}export function renderTextareaEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475412567),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475412568),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1475416098),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1475416099)
const i=s().buildPropertyPath(t.propertyPath,r,n)
c().getTemplatePropertyDomElement("label",o).append(t.label),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",o).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",o).remove()
const a=g().get(i)
e("textarea",e(o)).val(a),e("textarea",e(o)).on("keyup paste",(function(){g().set(i,e(this).val())}))}export function renderTypo3WinBrowserEditor(t,i,a,l){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1477300587),f("object"===e.type(i),'Invalid parameter "editorHtml"',1477300588),f(E().isNonEmptyString(t.label),'Invalid configuration "label"',1477300589),f(E().isNonEmptyString(t.buttonLabel),'Invalid configuration "buttonLabel"',1477318981),f(E().isNonEmptyString(t.propertyPath),'Invalid configuration "propertyPath"',1477300590),c().getTemplatePropertyDomElement("label",i).append(t.label),c().getTemplatePropertyDomElement("buttonLabel",i).append(t.buttonLabel),E().isNonEmptyString(t.fieldExplanationText)?c().getTemplatePropertyDomElement("fieldExplanationText",i).text(t.fieldExplanationText):c().getTemplatePropertyDomElement("fieldExplanationText",i).remove(),e("form",e(i)).prop("name",t.propertyPath),o.getIcon(t.iconIdentifier,o.sizes.small).then((function(t){c().getTemplatePropertyDomElement("image",i).append(e(t))})),c().getTemplatePropertyDomElement("onclick",i).on("click",(function(){const o=Math.floor(1e5*Math.random()+1)
var n,i
e(this).closest(c().getDomElementDataIdentifierSelector("editorControlsWrapper")).find(c().getDomElementDataAttribute("contentElementSelectorTarget","bracesWithKey")).attr(c().getDomElementDataAttribute("contentElementSelectorTarget"),o),n="db",i=o+"|||"+t.browsableType,r.advanced({type:r.types.iframe,content:TYPO3.settings.FormEditor.typo3WinBrowserUrl+"&mode="+n+"&bparams="+i,size:r.sizes.large})})),window.addEventListener("message",(function(t){if(!n.verifyOrigin(t.origin))throw"Denied message sent by "+t.origin
if("typo3:elementBrowser:elementAdded"===t.data.actionName){if(void 0===t.data.fieldName)throw"fieldName not defined in message"
if(void 0===t.data.value)throw"value not defined in message"
const o=t.data.value.split("_")
e(c().getDomElementDataAttribute("contentElementSelectorTarget","bracesWithKeyValue",[t.data.fieldName])).val(o.pop()).trigger("paste")}}))
const p=s().buildPropertyPath(t.propertyPath,a,l),d=g().get(p)
C(p,i),c().getTemplatePropertyDomElement("propertyPath",i).val(d),c().getTemplatePropertyDomElement("propertyPath",i).on("keyup paste",(function(){g().set(p,e(this).val()),C(p,i)}))}export function renderRemoveElementEditor(t,o,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1475412563),f("object"===e.type(o),'Invalid parameter "editorHtml"',1475412564),E().isUndefinedOrNull(r)?e("button",e(o)).addClass(c().getDomElementClassName("buttonFormElementRemove")+" "+c().getDomElementClassName("buttonFormEditor")):e("button",e(o)).addClass(c().getDomElementClassName("buttonCollectionElementRemove")),e("button",e(o)).on("click",(function(){E().isUndefinedOrNull(r)?m().showRemoveFormElementModal():m().showRemoveCollectionElementModal(r,n)}))}export function renderFormElementSelectorEditorAddition(t,r,n){f("object"===e.type(t),'Invalid parameter "editorConfiguration"',1484574704),f("object"===e.type(r),'Invalid parameter "editorHtml"',1484574705),f(E().isNonEmptyString(n),'Invalid parameter "propertyPath"',1484574706)
const i=e(c().getDomElementDataIdentifierSelector("formElementSelectorControlsWrapper"),r)
if(!0===t.enableFormelementSelectionButton){if(0===i.length)return
const l=e(c().getDomElementDataIdentifierSelector("formElementSelectorSplitButtonListContainer"),r)
l.off().empty()
const p=s().getNonCompositeNonToplevelFormElements()
0===p.length?o.getIcon(c().getDomElementDataAttributeValue("iconNotAvailable"),o.sizes.small,null,o.states.default).then((function(t){const o=e('<li data-no-sorting><span class="dropdown-item"></span></li>')
o.find("span").append(e(t)).append(" "+b(u(),"inspectorEditorFormElementSelectorNoElements")),l.append(o)})):e.each(p,(function(t,i){o.getIcon(b(i,"iconIdentifier"),o.sizes.small,null,o.states.default).then((function(t){const o=e('<li data-no-sorting><a href="#" class="dropdown-item" data-formelement-identifier="'+i.get("identifier")+'"></a></li>')
e(a`[data-formelement-identifier="${i.get("identifier")}"]`,o).append(e(t)).append(" "+i.get("label")),e("a",o).on("click",(function(){let t
t=0===(t=g().get(n)||"").length?"{"+e(this).attr("data-formelement-identifier")+"}":t+" {"+e(this).attr("data-formelement-identifier")+"}",g().set(n,t),c().getTemplatePropertyDomElement("propertyPath",r).val(t),C(n,r)})),l.append(o)}))}))}else e(c().getDomElementDataIdentifierSelector("editorControlsInputGroup"),r).removeClass(c().getDomElementClassName("inspectorInputGroup")),i.off().empty().remove()}export function buildTitleByFormElement(t){let o
E().isUndefinedOrNull(t)&&(t=g()),f("object"===e.type(t),'Invalid parameter "formElement"',1478967319),o="Form"===t.get("type")?t.get("type"):b(t,"label")?b(t,"label"):t.get("identifier")
const r=document.createElement("span")
return r.textContent=o,r}export function bootstrap(o,r){return d=o,p=e.extend(!0,l,r||{}),t.bootstrap(d),this}