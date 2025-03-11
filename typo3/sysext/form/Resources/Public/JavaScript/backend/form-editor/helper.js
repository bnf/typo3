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
let t=null,r=null
const n={domElementClassNames:{active:"active",buttonCollectionElementRemove:"formeditor-inspector-collection-element-remove-button",buttonFormEditor:"formeditor-button",disabled:"disabled",hidden:"hidden",icon:"formeditor-icon",sortableHover:"sortable-hover"},domElementDataAttributeNames:{elementIdentifier:"data-element-identifier-path",identifier:"data-identifier",template:"data-template-name",templateProperty:"data-template-property"},domElementSelectorPattern:{bracesWithKey:"[{0}]",bracesWithKeyValue:'[{0}="{1}"]',class:".{0}",id:"#{0}",keyValue:'{0}="{1}"'}}
function a(){return t}function l(){return a().getUtility()}function i(e,t,r){return a().assert(e,t,r)}export function setConfiguration(t){return i("object"===e.type(t),'Invalid parameter "partialConfiguration"',1478950623),r=e.extend(!0,n,t),this}export function buildDomElementSelectorHelper(t,n){let a
i(!l().isUndefinedOrNull(r.domElementSelectorPattern[t]),'Invalid parameter "patternIdentifier" ('+t+")",1478801251),i("array"===e.type(n),'Invalid parameter "replacements"',1478801252),a=r.domElementSelectorPattern[t]
for(let o=0,m=n.length;o<m;++o)a=a.replace("{"+o+"}",n[o])
return a}export function getDomElementSelector(e,t){return i(!l().isUndefinedOrNull(r.domElementSelectorPattern[e]),'Invalid parameter "selectorIdentifier" ('+e+")",1478372374),buildDomElementSelectorHelper(e,t)}export function getDomElementClassName(e,t){let n
return i(!l().isUndefinedOrNull(r.domElementClassNames[e]),'Invalid parameter "classNameIdentifier" ('+e+")",1478803906),n=r.domElementClassNames[e],t&&(n=getDomElementSelector("class",[n])),n}export function getDomElementIdName(e,t){let n
return i(!l().isUndefinedOrNull(r.domElementIdNames[e]),'Invalid parameter "domElementIdNames" ('+e+")",1479251518),n=r.domElementIdNames[e],t&&(n=getDomElementSelector("id",[n])),n}export function getDomElementDataAttributeValue(e){return i(!l().isUndefinedOrNull(r.domElementDataAttributeValues[e]),'Invalid parameter "dataAttributeValueIdentifier" ('+e+")",1478806884),r.domElementDataAttributeValues[e]}export function getDomElementDataAttribute(e,t,n){return i(!l().isUndefinedOrNull(r.domElementDataAttributeNames[e]),'Invalid parameter "dataAttributeIdentifier" ('+e+")",1478808035),l().isUndefinedOrNull(t)?r.domElementDataAttributeNames[e]:(n=n||[],getDomElementSelector(t,[r.domElementDataAttributeNames[e]].concat(n)))}export function getDomElementDataIdentifierSelector(e){return getDomElementDataAttribute("identifier","bracesWithKeyValue",[getDomElementDataAttributeValue(e)])}export function getTemplate(t){return l().isUndefinedOrNull(r.domElementDataAttributeValues[t])||(t=getDomElementDataAttributeValue(t)),e(getDomElementDataAttribute("template","bracesWithKeyValue",[t]))}export function getTemplatePropertyDomElement(t,r){return e(getDomElementDataAttribute("templateProperty","bracesWithKeyValue",[t]),e(r))}export function bootstrap(e){t=e}