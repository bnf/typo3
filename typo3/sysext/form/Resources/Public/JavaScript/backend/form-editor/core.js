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
import $ from"jquery";export function assert(e,t,r){if("function"==typeof e&&(e=!1!==e()),!e){if(t=t||"Assertion failed",r&&(t=t+" ("+r+")"),"undefined"!=typeof Error)throw new Error(t);throw t}}export class Utility{assert(e,t,r){assert(e,t,r)}isUndefinedOrNull(e){return null==e}isNonEmptyArray(e){return Array.isArray(e)&&e.length>0}isNonEmptyString(e){return"string"==typeof e&&e.length>0}canBeInterpretedAsInteger(e){if("number"==typeof e)return!0;if("string"!=typeof e)return!1;const t=e;return(1*t).toString()===t.toString()&&-1===t.toString().indexOf(".")}buildPropertyPath(e,t,r,i,n){let o="";return n=!!n,this.isNonEmptyString(t)||this.isNonEmptyString(r)?(assert(this.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475412569),assert(this.isNonEmptyString(r),'Invalid parameter "collectionName"',1475412570),o=r+"."+repository.getIndexFromPropertyCollectionElementByIdentifier(t,r,i)):o="",this.isUndefinedOrNull(e)||(assert(this.isNonEmptyString(e),'Invalid parameter "propertyPath"',1475415988),o=this.isNonEmptyString(o)?o+"."+e:e),n||assert(this.isNonEmptyString(o),"The property path could not be resolved",1475663210),o}convertToSimpleObject(e){assert("object"===$.type(e),'Invalid parameter "formElement"',1475377782);const t={},r="getObjectData"in e&&"function"==typeof e.getObjectData?e.getObjectData():e,i=r.renderables;delete r.renderables;for(const[e,i]of Object.entries(r))e.match(/^__/)||(null===i||"object"!=typeof i||Array.isArray(i)?"function"!==$.type(i)&&"undefined"!==$.type(i)&&(t[e]=i):t[e]=this.convertToSimpleObject(i));if("array"===$.type(i)){t.renderables=[];for(let e=0,r=i.length;e<r;++e)t.renderables.push(this.convertToSimpleObject(i[e]))}return t}}export class PropertyValidationService{constructor(){this.validators={}}addValidatorIdentifiersToFormElementProperty(e,t,r,i,n,o){assert("object"===$.type(e),'Invalid parameter "formElement"',1475661025),assert("array"===$.type(t),'Invalid parameter "validators"',1475661026),assert("array"===$.type(t),'Invalid parameter "validators"',1479238074);const a=e.get("__identifierPath");r=utility.buildPropertyPath(r,i,n,e);const s=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");utility.isUndefinedOrNull(s[a])&&(s[a]={}),utility.isUndefinedOrNull(s[a][r])&&(s[a][r]={validators:[],configuration:o});for(const e of t)-1===s[a][r].validators.indexOf(e)&&s[a][r].validators.push(e);getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",s)}removeValidatorIdentifiersFromFormElementProperty(e,t){assert("object"===$.type(e),'Invalid parameter "formElement"',1475700618),assert(utility.isNonEmptyString(t),'Invalid parameter "propertyPath"',1475706896);const r=e.get("__identifierPath"),i={},n=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");if(r in n)for(const e of Object.keys(n[r]||{}))e.indexOf(t)>-1||(i[e]=n[r][e]);n[r]=i,getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",n)}removeAllValidatorIdentifiersFromFormElement(e){assert("object"===$.type(e),'Invalid parameter "formElement"',1475668189);const t={},r=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");for(const i of Object.keys(r))i===e.get("__identifierPath")||i.indexOf(e.get("__identifierPath")+"/")>-1||(t[i]=r[i]);getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",t)}addValidator(e,t){assert(utility.isNonEmptyString(e),'Invalid parameter "validatorIdentifier"',1475669143),assert("function"===$.type(t),'Invalid parameter "func"',1475669144),assert("function"!==$.type(this.validators[e]),'The validator "'+e+'" is already registered',1475669145),this.validators[e]=t}validateFormElementProperty(e,t){let r;assert("object"===$.type(e),'Invalid parameter "formElement"',1475676517),assert(utility.isNonEmptyString(t),'Invalid parameter "propertyPath"',1475676518);const i=e.get("__identifierPath"),n=[],o=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");if(r={propertyValidatorsMode:"AND"},!utility.isUndefinedOrNull(o[i])&&"object"===$.type(o[i][t])&&"array"===$.type(o[i][t].validators)){r=o[i][t].configuration;for(let r=0,a=o[i][t].validators.length;r<a;++r){const a=o[i][t].validators[r];if("function"!==$.type(this.validators[a]))continue;const s=this.validators[a](e,t);utility.isNonEmptyString(s)&&n.push(s)}}return n.length>0&&"OR"===r.propertyValidatorsMode&&n.length!==o[i][t].validators.length?[]:n}validateFormElement(e){assert("object"===$.type(e),'Invalid parameter "formElement"',1475749668);const t=e.get("__identifierPath"),r=[],i=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");if(!utility.isUndefinedOrNull(i[t]))for(const n of Object.keys(i[t]))r.push({propertyPath:n,validationResults:this.validateFormElementProperty(e,n)});return r}validationResultsHasErrors(e){assert("array"===$.type(e),'Invalid parameter "validationResults"',1478613477);for(let t=0,r=e.length;t<r;++t)for(let r=0,i=e[t].validationResults.length;r<i;++r)if(e[t].validationResults[r].validationResults&&e[t].validationResults[r].validationResults.length>0)return!0;return!1}validateFormElementRecursive(e,t,r){if(assert("object"===$.type(e),'Invalid parameter "formElement"',1475756764),t=!!t,(r=r||[]).push({formElementIdentifierPath:e.get("__identifierPath"),validationResults:this.validateFormElement(e)}),t&&this.validationResultsHasErrors(r))return r;const i=e.get("renderables");if("array"===$.type(i))for(let e=0,n=i.length;e<n;++e)if(this.validateFormElementRecursive(i[e],t,r),t&&this.validationResultsHasErrors(r))return r;return r}addValidatorIdentifiersFromFormElementPropertyCollections(e){assert("object"===$.type(e),'Invalid parameter "formElement"',1475707334);const t=repository.getFormEditorDefinition("formElements",e.get("type"));if(!utility.isUndefinedOrNull(t.propertyCollections))for(const r of Object.keys(t.propertyCollections))if(Array.isArray(t.propertyCollections[r]))for(let i=0,n=t.propertyCollections[r].length;i<n;++i)if("array"===$.type(t.propertyCollections[r][i].editors)&&-1!==repository.getIndexFromPropertyCollectionElementByIdentifier(t.propertyCollections[r][i].identifier,r,e))for(let n=0,o=t.propertyCollections[r][i].editors.length;n<o;++n){if("array"!==$.type(t.propertyCollections[r][i].editors[n].propertyValidators))continue;const o={propertyValidatorsMode:"AND"};utility.isUndefinedOrNull(t.propertyCollections[r][i].editors[n].propertyValidatorsMode)||"OR"!==t.propertyCollections[r][i].editors[n].propertyValidatorsMode||(o.propertyValidatorsMode="OR"),this.addValidatorIdentifiersToFormElementProperty(e,t.propertyCollections[r][i].editors[n].propertyValidators,t.propertyCollections[r][i].editors[n].propertyPath,t.propertyCollections[r][i].identifier,r,o)}}}export class PublisherSubscriber{constructor(){this.topics={},this.subscriberUid=-1}publish(e,t){if(assert(utility.isNonEmptyString(e),'Invalid parameter "topic"',1475358066),utility.isUndefinedOrNull(this.topics[e]))return;const r=this.topics[e];for(const i of r)i.func(e,t)}subscribe(e,t){assert(utility.isNonEmptyString(e),'Invalid parameter "topic"',1475358067),assert("function"===$.type(t),'Invalid parameter "func"',1475411986),utility.isUndefinedOrNull(this.topics[e])&&(this.topics[e]=[]);const r=(++this.subscriberUid).toString();return this.topics[e].push({token:r,func:t}),r}unsubscribe(e){assert(utility.isNonEmptyString(e),'Invalid parameter "token"',1475358068);for(const t of Object.values(this.topics)){const r=t;for(let t=0,i=r.length;t<i;++t)if(r[t].token===e)return r.splice(t,1),e}return null}}function extendModel(e,t,r,i){if(assert("object"===$.type(e),'Invalid parameter "modelToExtend"',1475358069),assert("object"===$.type(t)||"array"===$.type(t),'Invalid parameter "modelExtension"',1475358070),i=!!i,r=r||"",$.isEmptyObject(t))assert(""!==r,"Empty path is not allowed",1474640022),e.on(r,"core/formElement/somePropertyChanged"),e.set(r,t,i);else{const n={...t};for(const o of Object.keys(n)){const a=""===r?o:r+"."+o;e.on(a,"core/formElement/somePropertyChanged"),null===n[o]||"object"!=typeof n[o]&&!Array.isArray(n[o])?"properties.options"===r?e.set(r,t,i):e.set(a,n[o],i):extendModel(e,n[o],a,i)}}}export class Model{constructor(){this.objectData={},this.publisherTopics={}}get(e){let t,r;for(assert(utility.isNonEmptyString(e),'Invalid parameter "key"',1475361755),r=this.objectData;e.indexOf(".")>0;){if(t=e.slice(0,e.indexOf(".")),e=e.slice(t.length+1),!(t in r))return;r=r[t]}return r[e]}set(e,t,r){let i,n,o,a,s;assert(utility.isNonEmptyString(e),'Invalid parameter "key"',1475361756),r=!!r;const l=this.get(e);for(s=this.objectData,i=e;i.indexOf(".")>0;)n=i.slice(0,i.indexOf(".")),i=i.slice(n.length+1),$.isNumeric(n)&&(n=parseInt(n,10)),a=i.indexOf("."),o=-1===a?i:i.slice(0,a),"undefined"===$.type(s[n])?$.isNumeric(o)?s[n]=[]:s[n]={}:!1===$.isNumeric(o)&&"array"===$.type(s[n])&&(s[n]=s[n].reduce((function(e,t,r){return e[r]=t,e}),{})),s=s[n];if(s[i]=t,!utility.isUndefinedOrNull(this.publisherTopics[e])&&!r)for(let r=0,i=this.publisherTopics[e].length;r<i;++r)publisherSubscriber.publish(this.publisherTopics[e][r],[e,t,l,this.objectData.__identifierPath])}unset(e,t){let r,i,n;assert(utility.isNonEmptyString(e),'Invalid parameter "key"',1489321637),t=!!t;const o=this.get(e);if(e.indexOf(".")>0?(i=e.split("."),n=i.pop(),i=i.join("."),r=this.get(i),delete r[n]):assert(!1,"remove toplevel properties is not supported",1489319753),!utility.isUndefinedOrNull(this.publisherTopics[e])&&!t)for(let t=0,r=this.publisherTopics[e].length;t<r;++t)publisherSubscriber.publish(this.publisherTopics[e][t],[e,void 0,o,this.objectData.__identifierPath])}on(e,t){assert(utility.isNonEmptyString(e),'Invalid parameter "key"',1475361757),assert(utility.isNonEmptyString(t),'Invalid parameter "topicName"',1475361758),"array"!==$.type(this.publisherTopics[e])&&(this.publisherTopics[e]=[]),-1===this.publisherTopics[e].indexOf(t)&&this.publisherTopics[e].push(t)}off(e,t){assert(utility.isNonEmptyString(e),'Invalid parameter "key"',1475361759),assert(utility.isNonEmptyString(t),'Invalid parameter "topicName"',1475361760),"array"===$.type(this.publisherTopics[e])&&(this.publisherTopics[e]=this.publisherTopics[e].filter((e=>t!==e)))}getObjectData(){return $.extend(!0,{},this.objectData)}toString(){const e=this.getObjectData(),t=e.renderables||null;delete e.renderables;let r=null;utility.isUndefinedOrNull(e.__parentRenderable)||(r=e.__parentRenderable.getObjectData().__identifierPath+" (filtered)",delete e.__parentRenderable);const i=e;if(null!==r&&(i.__parentRenderable=r),null!==t&&Array.isArray(t)){const e=[];for(let r=0,i=t.length;r<i;++r){const i=t[r];e.push(JSON.parse(i.toString()))}i.renderables=e}return JSON.stringify(i,null,2)}clone(){const e=this.getObjectData(),t=e.renderables||null;delete e.renderables,delete e.__parentRenderable,e.renderables=!!t||null;const r=new Model;if(extendModel(r,e,"",!0),null!==t&&Array.isArray(t)){const e=[];for(let i=0,n=t.length;i<n;++i){let n=t[i];n=n.clone(),n.set("__parentRenderable",r,!0),e.push(n)}r.set("renderables",e,!0)}return r}}function createModel(e){e=e||{};const t=new Model;return extendModel(t,e,"",!0),t}export class Repository{setFormEditorDefinitions(e){assert("object"===$.type(e),'Invalid parameter "formEditorDefinitions"',1475364394);for(const t of Object.keys(e)){const r=t;if(null===e[r]||"object"==typeof e[r])for(const t of Object.keys(e[r])){const i=t;null!==e[r][i]&&"object"==typeof e[r][i]||(e[r][i]={})}}this.formEditorDefinitions=e}getFormEditorDefinition(e,t){return assert(utility.isNonEmptyString(e),'Invalid parameter "definitionName"',1475364952),assert(utility.isNonEmptyString(t),'Invalid parameter "subject"',1475364953),$.extend(!0,{},this.formEditorDefinitions[e][t])}getRootFormElement(){return getApplicationStateStack().getCurrentState("formDefinition")}addFormElement(e,t,r,i){let n,o,a;assert("object"===$.type(e),'Invalid parameter "formElement"',1475436224),assert("object"===$.type(t),'Invalid parameter "referenceFormElement"',1475364956),utility.isUndefinedOrNull(i)&&(i=!0),i=!!i,r=!!r;const s=this.getFormEditorDefinition("formElements",e.get("type")),l=this.getFormEditorDefinition("formElements",t.get("type"));if(!s._isTopLevelFormElement&&l._isCompositeFormElement?("array"!==$.type(t.get("renderables"))&&t.set("renderables",[],i),e.set("__parentRenderable",t,i),e.set("__identifierPath",t.get("__identifierPath")+"/"+e.get("identifier"),i),t.get("renderables").push(e)):(t.get("__identifierPath")===getApplicationStateStack().getCurrentState("formDefinition").get("__identifierPath")?(a=t.get("renderables"),t=a[a.length-1]):s._isTopLevelFormElement&&!l._isTopLevelFormElement?t=this.findEnclosingCompositeFormElementWhichIsOnTopLevel(t):s._isCompositeFormElement&&(n=this.findEnclosingCompositeFormElementWhichIsNotOnTopLevel(t),n&&(t=n)),e.set("__parentRenderable",t.get("__parentRenderable"),i),e.set("__identifierPath",t.get("__parentRenderable").get("__identifierPath")+"/"+e.get("identifier"),i),o=t.get("__parentRenderable").get("renderables"),o.splice(o.indexOf(t)+1,0,e)),r&&"array"===$.type(s.editors))for(let t=0,r=s.editors.length;t<r;++t){if("array"!==$.type(s.editors[t].propertyValidators))continue;const r={propertyValidatorsMode:"AND"};utility.isUndefinedOrNull(s.editors[t].propertyValidatorsMode)||"OR"!==s.editors[t].propertyValidatorsMode||(r.propertyValidatorsMode="OR"),propertyValidationService.addValidatorIdentifiersToFormElementProperty(e,s.editors[t].propertyValidators,s.editors[t].propertyPath,void 0,void 0,r)}return e}removeFormElement(e,t,r){utility.isUndefinedOrNull(r)&&(r=!0),r=!!r,t=!!t,assert("object"===$.type(e),'Invalid parameter "formElement"',1475364957),assert("object"===$.type(e.get("__parentRenderable")),"Removing the root element is not allowed",1472553024);const i=e.get("__parentRenderable").get("renderables");i.splice(i.indexOf(e),1),e.get("__parentRenderable").set("renderables",i,r),t&&propertyValidationService.removeAllValidatorIdentifiersFromFormElement(e)}moveFormElement(e,t,r,i){let n,o,a;assert("object"===$.type(e),'Invalid parameter "formElementToMove"',1475364958),assert("after"===t||"before"===t||"inside"===t,'Invalid position "'+t+'"',1475364959),assert("object"===$.type(r),'Invalid parameter "referenceFormElement"',1475364960),utility.isUndefinedOrNull(i)&&(i=!0),i=!!i;const s=this.getFormEditorDefinition("formElements",e.get("type")),l=this.getFormEditorDefinition("formElements",r.get("type"));this.removeFormElement(e,!1);const p=(e,t)=>{assert("object"===$.type(e),'Invalid parameter "formElement"',1475364961),assert(utility.isNonEmptyString(t),'Invalid parameter "pathPrefix"',1475364962);const r=e.get("__identifierPath"),n=t+"/"+e.get("identifier"),o=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators");utility.isUndefinedOrNull(o[r])||(o[n]=o[r],delete o[r]),getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",o),e.set("__identifierPath",n,i);const a=e.get("renderables");if("array"===$.type(a))for(let t=0,r=a.length;t<r;++t)p(a[t],e.get("__identifierPath"))};return"inside"===t?(assert(!s._isTopLevelFormElement,"This move is not allowed",1476993731),assert(l._isCompositeFormElement,"This move is not allowed",1476993732),e.set("__parentRenderable",r,i),p(e,r.get("__identifierPath")),o=r.get("renderables"),utility.isUndefinedOrNull(o)&&(o=[]),o.splice(0,0,e),r.set("renderables",o,i)):s._isTopLevelFormElement&&l._isTopLevelFormElement?(n=r.get("__parentRenderable").get("renderables"),a=n.indexOf(r),"after"===t?n.splice(a+1,0,e):n.splice(a,0,e),r.get("__parentRenderable").set("renderables",n,i)):(e.get("__parentRenderable").get("identifier")===r.get("__parentRenderable").get("identifier")?(n=r.get("__parentRenderable").get("renderables"),a=n.indexOf(r)):(e.set("__parentRenderable",r.get("__parentRenderable"),i),p(e,r.get("__parentRenderable").get("__identifierPath")),n=r.get("__parentRenderable").get("renderables"),a=n.indexOf(r)),"after"===t?n.splice(a+1,0,e):n.splice(a,0,e),r.get("__parentRenderable").set("renderables",n,i)),e}getIndexForEnclosingCompositeFormElementWhichIsOnTopLevelForFormElement(e){let t;assert("object"===$.type(e),'Invalid parameter "formElement"',1475364963);const r=this.getFormEditorDefinition("formElements",e.get("type"));return t=r._isTopLevelFormElement&&r._isCompositeFormElement?e:e.get("__identifierPath")===getApplicationStateStack().getCurrentState("formDefinition").get("__identifierPath")?getApplicationStateStack().getCurrentState("formDefinition").get("renderables")[0]:this.findEnclosingCompositeFormElementWhichIsOnTopLevel(e),t.get("__parentRenderable").get("renderables").indexOf(t)}findEnclosingCompositeFormElementWhichIsOnTopLevel(e){let t;for(assert("object"===$.type(e),'Invalid parameter "formElement"',1475364964),assert("object"===$.type(e.get("__parentRenderable")),"The root element is never encloused by anything",1472556223),t=this.getFormEditorDefinition("formElements",e.get("type"));!t._isTopLevelFormElement;)e=e.get("__parentRenderable"),t=this.getFormEditorDefinition("formElements",e.get("type"));return e}findEnclosingGridRowFormElement(e){let t;for(assert("object"===$.type(e),'Invalid parameter "formElement"',1490520271),t=this.getFormEditorDefinition("formElements",e.get("type"));!t._isGridRowFormElement;){if(t._isTopLevelFormElement)return null;e=e.get("__parentRenderable"),t=this.getFormEditorDefinition("formElements",e.get("type"))}return t._isTopLevelFormElement?null:e}findEnclosingCompositeFormElementWhichIsNotOnTopLevel(e){let t;for(assert("object"===$.type(e),'Invalid parameter "formElement"',1475364965),t=this.getFormEditorDefinition("formElements",e.get("type"));!t._isCompositeFormElement;){if(t._isTopLevelFormElement)return null;e=e.get("__parentRenderable"),t=this.getFormEditorDefinition("formElements",e.get("type"))}return t._isTopLevelFormElement?null:e}getNonCompositeNonToplevelFormElements(){const e=[],t=r=>{assert("object"===$.type(r),'Invalid parameter "formElement"',1475364961);const i=this.getFormEditorDefinition("formElements",r.get("type"));i._isTopLevelFormElement||i._isCompositeFormElement||e.push(r);const n=r.get("renderables");if("array"===$.type(n))for(let e=0,r=n.length;e<r;++e)t(n[e])};return t(this.getRootFormElement()),e}isFormElementIdentifierUsed(e){let t;assert(utility.isNonEmptyString(e),'Invalid parameter "identifier"',1475364966);const r=i=>{let n;if(i.get("identifier")===e&&(t=!0),!t&&(n=i.get("renderables"),"array"===$.type(n)))for(let e=0,i=n.length;e<i&&(r(n[e]),!t);++e);};return r(getApplicationStateStack().getCurrentState("formDefinition")),t}getNextFreeFormElementIdentifier(e){let t;assert(utility.isNonEmptyString(e),'Invalid parameter "formElementType"',1475373676);const r=e.toLowerCase().replace(/[^a-z0-9]/g,"-")+"-";for(t=1;this.isFormElementIdentifierUsed(r+t);)t++;return r+t}findFormElementByIdentifierPath(e){let t,r;assert(utility.isNonEmptyString(e),'Invalid parameter "identifierPath"',1475373677);let i=getApplicationStateStack().getCurrentState("formDefinition");const n=e.split("/"),o=n.length;for(let a=0;a<o;++a){const s=n[a];if(0!==a&&a!==o)if(r=i.get("renderables"),Array.isArray(r)){t=null;for(let e=0,i=r.length;e<i;++e)if(s===r[e].get("identifier")){t=r[e];break}assert("null"!==$.type(t),'Could not find form element "'+s+'" in path "'+e+'"',1472424334),i=t}else assert(!1,"No form elements found",1472424330);else assert(s===i.get("identifier"),'"'+s+'" does not exist in path "'+e+'"',1472424333)}return i}findFormElement(e){return"object"==typeof e&&(e=e.get("__identifierPath")),this.findFormElementByIdentifierPath(e)}findCollectionElementByIdentifierPath(e,t){assert(utility.isNonEmptyString(e),'Invalid parameter "collectionElementIdentifier"',1475375281),assert("array"===$.type(t),'Invalid parameter "collection"',1475375282);for(let r=0,i=t.length;r<i;++r)if(t[r].identifier===e)return t[r]}getIndexFromPropertyCollectionElementByIdentifier(e,t,r){assert(utility.isNonEmptyString(e),'Invalid parameter "collectionElementIdentifier"',1475375283),assert("object"===$.type(r),'Invalid parameter "formElement"',1475375284),assert(utility.isNonEmptyString(t),'Invalid parameter "collectionName"',1475375285);const i=r.get(t);if("array"===$.type(i))for(let t=0,r=i.length;t<r;++t)if(i[t].identifier===e)return t;return-1}addPropertyCollectionElement(e,t,r,i,n){let o,a;assert("object"===$.type(e),'Invalid parameter "collectionElementToAdd"',1475375686),assert("object"===$.type(r),'Invalid parameter "formElement"',1475375687),assert(utility.isNonEmptyString(t),'Invalid parameter "collectionName"',1475375688),utility.isUndefinedOrNull(n)&&(n=!0),n=!!n,o=r.get(t),"array"!==$.type(o)&&(extendModel(r,[],t,!0),o=r.get(t)),utility.isUndefinedOrNull(i)?a=0:(a=this.getIndexFromPropertyCollectionElementByIdentifier(i,t,r)+1,assert(-1<a,"Could not find collection element "+i+" within collection "+t,1477413154)),o.splice(a,0,e),r.set(t,o,!0),propertyValidationService.removeValidatorIdentifiersFromFormElementProperty(r,t);for(let e=0,i=o.length;e<i;++e)extendModel(r,o[e],t+"."+e,!0);return r.set(t,o,!0),propertyValidationService.addValidatorIdentifiersFromFormElementPropertyCollections(r),r.set(t,o,n),r}removePropertyCollectionElementByIdentifier(e,t,r,i){assert(utility.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475375689),assert("object"===$.type(e),'Invalid parameter "formElement"',1475375690),assert(utility.isNonEmptyString(r),'Invalid parameter "collectionName"',1475375691);const n=e.get(r);assert("array"===$.type(n),'The collection "'+r+'" does not exist',1475375692),utility.isUndefinedOrNull(i)&&(i=!0),i=!!i,propertyValidationService.removeValidatorIdentifiersFromFormElementProperty(e,r);const o=this.getIndexFromPropertyCollectionElementByIdentifier(t,r,e);n.splice(o,1),e.set(r,n,i),propertyValidationService.addValidatorIdentifiersFromFormElementPropertyCollections(e)}movePropertyCollectionElement(e,t,r,i,n,o){let a;assert("after"===t||"before"===t,'Invalid position "'+t+'"',1477404485),assert("string"===$.type(r),'Invalid parameter "referenceCollectionElementIdentifier"',1477404486),assert("object"===$.type(n),'Invalid parameter "formElement"',1477404488);const s=n.get(i);assert("array"===$.type(s),'The collection "'+i+'" does not exist',1477404490);const l=this.findCollectionElementByIdentifierPath(e,s);assert("object"===$.type(l),'Invalid parameter "collectionElementToMove"',1477404484),this.removePropertyCollectionElementByIdentifier(n,e,i);const p=this.getIndexFromPropertyCollectionElementByIdentifier(r,i,n);assert(-1<p,"Could not find collection element "+r+" within collection "+i,1477404489),"before"===t&&(a=s[p-1],r=utility.isUndefinedOrNull(a)?void 0:a.identifier),this.addPropertyCollectionElement(l,i,n,r,o)}}export class Factory{createFormElement(e,t,r,i,n){let o;assert("object"===$.type(e),'Invalid parameter "configuration"',1475375693),assert(utility.isNonEmptyString(e.identifier),'"identifier" must not be empty',1475436040),assert(utility.isNonEmptyString(e.type),'"type" must not be empty',1475604050),i=!!i,utility.isUndefinedOrNull(n)&&(n=!0),n=!!n;const a=repository.getFormEditorDefinition("formElements",e.type),s=e.renderables;delete e.renderables;const l={},p=a.predefinedDefaults||{};for(const t of Object.keys(e))utility.isUndefinedOrNull(repository.formEditorDefinitions[t])||(p[t]=p[t]||{},l[t]=$.extend(p[t]||{},e[t]),delete p[t],delete e[t]);const d=""===(t=t||"")?e.identifier:t+"/"+e.identifier,c=createModel({...p,...e,renderables:!!s||null,__parentRenderable:null,__identifierPath:d});c.set("__parentRenderable",r||null,n);for(const[e,t]of Object.entries(l)){let r=0;for(const i of Object.values(t)){let t;const n=this.createPropertyCollectionElement(i.identifier,i,e);r>0&&(t=l[e][r-1].identifier),repository.addPropertyCollectionElement(n,e,c,t,!0),++r}}if(i&&"array"===$.type(a.editors))for(let e=0,t=a.editors.length;e<t;++e){if("array"!==$.type(a.editors[e].propertyValidators))continue;const t={propertyValidatorsMode:"AND"};utility.isUndefinedOrNull(a.editors[e].propertyValidatorsMode)||"OR"!==a.editors[e].propertyValidatorsMode||(t.propertyValidatorsMode="OR"),propertyValidationService.addValidatorIdentifiersToFormElementProperty(c,a.editors[e].propertyValidators,a.editors[e].propertyPath,void 0,void 0,t)}if("array"===$.type(s)){o=[];for(let e=0,t=s.length;e<t;++e)o.push(this.createFormElement(s[e],d,c,i,n));c.set("renderables",o,n)}return c}createPropertyCollectionElement(e,t,r){let i;assert(utility.isNonEmptyString(e),'Invalid parameter "collectionElementIdentifier"',1475377160),assert("object"===$.type(t),'Invalid parameter "collectionElementConfiguration"',1475377161),assert(utility.isNonEmptyString(r),'Invalid parameter "collectionName"',1475377162),t.identifier=e;const n=repository.getFormEditorDefinition(r,e);return i="predefinedDefaults"in n&&n.predefinedDefaults?n.predefinedDefaults:{},$.extend(i,t)}}export class DataBackend{constructor(){this.endpoints={},this.prototypeName=null,this.persistenceIdentifier=null}setEndpoints(e){assert("object"===$.type(e),'Invalid parameter "endpoints"',1475377488),this.endpoints=e}setPrototypeName(e){assert(utility.isNonEmptyString(e),'Invalid parameter "prototypeName"',1475928095),this.prototypeName=e}setPersistenceIdentifier(e){assert(utility.isNonEmptyString(e),'Invalid parameter "persistenceIdentifier"',1475377489),this.persistenceIdentifier=e}saveFormDefinition(){assert(utility.isNonEmptyString(this.endpoints.saveForm),'The endpoint "saveForm" is not configured',1475520918),runningAjaxRequests.saveForm&&runningAjaxRequests.saveForm.abort(),runningAjaxRequests.saveForm=$.post(this.endpoints.saveForm,{formPersistenceIdentifier:this.persistenceIdentifier,formDefinition:JSON.stringify(utility.convertToSimpleObject(getApplicationStateStack().getCurrentState("formDefinition")))},(function(e,t,r){runningAjaxRequests.saveForm===r&&(runningAjaxRequests.saveForm=null,"success"===e.status?publisherSubscriber.publish("core/ajax/saveFormDefinition/success",[e]):publisherSubscriber.publish("core/ajax/saveFormDefinition/error",[e]))})),runningAjaxRequests.saveForm.fail((function(e,t,r){publisherSubscriber.publish("core/ajax/error",[e,t,r])}))}renderFormDefinitionPage(e){assert($.isNumeric(e),'Invalid parameter "pageIndex"',1475377781),assert(utility.isNonEmptyString(this.endpoints.formPageRenderer),'The endpoint "formPageRenderer" is not configured',1473447677),runningAjaxRequests.renderFormDefinitionPage&&runningAjaxRequests.renderFormDefinitionPage.abort(),runningAjaxRequests.renderFormDefinitionPage=$.post(this.endpoints.formPageRenderer,{formDefinition:JSON.stringify(utility.convertToSimpleObject(getApplicationStateStack().getCurrentState("formDefinition"))),pageIndex:e,prototypeName:this.prototypeName},(function(t,r,i){runningAjaxRequests.renderFormDefinitionPage===i&&(runningAjaxRequests.renderFormDefinitionPage=null,publisherSubscriber.publish("core/ajax/renderFormDefinitionPage/success",[t,e]))})),runningAjaxRequests.renderFormDefinitionPage.fail((function(e,t,r){publisherSubscriber.publish("core/ajax/error",[e,t,r])}))}}export class ApplicationStateStack{constructor(){this.stackSize=10,this.stackPointer=0,this.stack=[]}add(e,t){assert("object"===$.type(e),'Invalid parameter "applicationState"',1477847415),t=!!t,$.extend(e,{propertyValidationServiceRegisteredValidators:$.extend(!0,{},this.getCurrentState("propertyValidationServiceRegisteredValidators"))}),this.stack.splice(0,0,e),this.stack.length>this.stackSize&&this.stack.splice(this.stackSize-1,this.stack.length-this.stackSize),t||publisherSubscriber.publish("core/applicationState/add",[e,this.getCurrentStackPointer(),this.getCurrentStackSize()])}addAndReset(e,t){assert("object"===$.type(e),'Invalid parameter "applicationState"',1477872641),this.stackPointer>0&&this.stack.splice(0,this.stackPointer),this.stackPointer=0,this.add(e,!0),t||publisherSubscriber.publish("core/applicationState/add",[this.getCurrentState(),this.getCurrentStackPointer(),this.getCurrentStackSize()])}getCurrentState(e){return void 0===e?this.stack[this.stackPointer]||void 0:(assert("formDefinition"===e||"currentlySelectedPageIndex"===e||"currentlySelectedFormElementIdentifierPath"===e||"propertyValidationServiceRegisteredValidators"===e,'Invalid parameter "type"',1477932754),"undefined"!==$.type(this.stack[this.stackPointer])?this.stack[this.stackPointer][e]:void 0)}setCurrentState(e,t){assert("formDefinition"===e||"currentlySelectedPageIndex"===e||"currentlySelectedFormElementIdentifierPath"===e||"propertyValidationServiceRegisteredValidators"===e,'Invalid parameter "type"',1477934111),this.stack[this.stackPointer][e]=t}setMaximalStackSize(e){assert("number"===$.type(e),'Invalid parameter "size"',1477846933),this.stackSize=e}getMaximalStackSize(){return this.stackSize}getCurrentStackSize(){return this.stack.length}getCurrentStackPointer(){return this.stackPointer}setCurrentStackPointer(e){assert("number"===$.type(e),'Invalid parameter "size"',1477852138),e<0?this.stackPointer=0:e>this.stack.length-1?this.stackPointer=this.stack.length-1:this.stackPointer=e}decrementCurrentStackPointer(){this.setCurrentStackPointer(--this.stackPointer)}incrementCurrentStackPointer(){this.setCurrentStackPointer(++this.stackPointer)}}export function getRunningAjaxRequest(e){return assert(utility.isNonEmptyString(e),'Invalid parameter "ajaxRequestIdentifier"',1475358064),runningAjaxRequests[e]||null}const utility=new Utility,dataBackend=new DataBackend,runningAjaxRequests={},propertyValidationService=new PropertyValidationService,applicationStateStack=new ApplicationStateStack,publisherSubscriber=new PublisherSubscriber,repository=new Repository,factory=new Factory;export function getUtility(){return utility}export function getDataBackend(){return dataBackend}export function getPropertyValidationService(){return propertyValidationService}export function getApplicationStateStack(){return applicationStateStack}export function getPublisherSubscriber(){return publisherSubscriber}export function getFactory(){return factory}export function getRepository(){return repository}