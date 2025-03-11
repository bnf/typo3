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
export function assert(e,t,r){if("function"==typeof e&&(e=!1!==e()),!e){if(t=t||"Assertion failed",r&&(t=t+" ("+r+")"),"undefined"!=typeof Error)throw new Error(t)
throw t}}export class Utility{assert(e,t,r){assert(e,t,r)}isUndefinedOrNull(e){return null==e}isNonEmptyArray(e){return Array.isArray(e)&&e.length>0}isNonEmptyString(e){return"string"==typeof e&&e.length>0}canBeInterpretedAsInteger(e){if("number"==typeof e)return!0
if("string"!=typeof e)return!1
const t=e
return(1*t).toString()===t.toString()&&-1===t.toString().indexOf(".")}buildPropertyPath(e,t,r,i,n){let o=""
return n=!!n,this.isNonEmptyString(t)||this.isNonEmptyString(r)?(assert(this.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475412569),assert(this.isNonEmptyString(r),'Invalid parameter "collectionName"',1475412570),o=r+"."+l.getIndexFromPropertyCollectionElementByIdentifier(t,r,i)):o="",this.isUndefinedOrNull(e)||(assert(this.isNonEmptyString(e),'Invalid parameter "propertyPath"',1475415988),o=this.isNonEmptyString(o)?o+"."+e:e),n||assert(this.isNonEmptyString(o),"The property path could not be resolved",1475663210),o}convertToSimpleObject(t){assert("object"===e.type(t),'Invalid parameter "formElement"',1475377782)
const r={},i="getObjectData"in t&&"function"==typeof t.getObjectData?t.getObjectData():t,n=i.renderables
delete i.renderables
for(const[key,value]of Object.entries(i))key.match(/^__/)||(null===value||"object"!=typeof value||Array.isArray(value)?"function"!==e.type(value)&&"undefined"!==e.type(value)&&(r[key]=value):r[key]=this.convertToSimpleObject(value))
if("array"===e.type(n)){r.renderables=[]
for(let o=0,a=n.length;o<a;++o)r.renderables.push(this.convertToSimpleObject(n[o]))}return r}}export class PropertyValidationService{constructor(){this.validators={}}addValidatorIdentifiersToFormElementProperty(t,i,n,o,a,s){assert("object"===e.type(t),'Invalid parameter "formElement"',1475661025),assert("array"===e.type(i),'Invalid parameter "validators"',1475661026),assert("array"===e.type(i),'Invalid parameter "validators"',1479238074)
const l=t.get("__identifierPath")
n=r.buildPropertyPath(n,o,a,t)
const d=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
r.isUndefinedOrNull(d[l])&&(d[l]={}),r.isUndefinedOrNull(d[l][n])&&(d[l][n]={validators:[],configuration:s})
for(const p of i)-1===d[l][n].validators.indexOf(p)&&d[l][n].validators.push(p)
getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",d)}removeValidatorIdentifiersFromFormElementProperty(t,i){assert("object"===e.type(t),'Invalid parameter "formElement"',1475700618),assert(r.isNonEmptyString(i),'Invalid parameter "propertyPath"',1475706896)
const n=t.get("__identifierPath"),o={},a=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
if(n in a)for(const s of Object.keys(a[n]||{}))s.indexOf(i)>-1||(o[s]=a[n][s])
a[n]=o,getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",a)}removeAllValidatorIdentifiersFromFormElement(t){assert("object"===e.type(t),'Invalid parameter "formElement"',1475668189)
const r={},i=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
for(const n of Object.keys(i||{}))n===t.get("__identifierPath")||n.indexOf(t.get("__identifierPath")+"/")>-1||(r[n]=i[n])
getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",r)}addValidator(t,i){assert(r.isNonEmptyString(t),'Invalid parameter "validatorIdentifier"',1475669143),assert("function"===e.type(i),'Invalid parameter "func"',1475669144),assert("function"!==e.type(this.validators[t]),'The validator "'+t+'" is already registered',1475669145),this.validators[t]=i}validateFormElementProperty(t,i){let n
assert("object"===e.type(t),'Invalid parameter "formElement"',1475676517),assert(r.isNonEmptyString(i),'Invalid parameter "propertyPath"',1475676518)
const o=t.get("__identifierPath"),a=[],s=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
if(n={propertyValidatorsMode:"AND"},!r.isUndefinedOrNull(s[o])&&"object"===e.type(s[o][i])&&"array"===e.type(s[o][i].validators)){n=s[o][i].configuration
for(let l=0,d=s[o][i].validators.length;l<d;++l){const p=s[o][i].validators[l]
if("function"!==e.type(this.validators[p]))continue
const m=this.validators[p](t,i)
r.isNonEmptyString(m)&&a.push(m)}}return a.length>0&&"OR"===n.propertyValidatorsMode&&a.length!==s[o][i].validators.length?[]:a}validateFormElement(t){assert("object"===e.type(t),'Invalid parameter "formElement"',1475749668)
const i=t.get("__identifierPath"),n=[],o=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
if(!r.isUndefinedOrNull(o[i]))for(const a of Object.keys(o[i]))n.push({propertyPath:a,validationResults:this.validateFormElementProperty(t,a)})
return n}validationResultsHasErrors(t){assert("array"===e.type(t),'Invalid parameter "validationResults"',1478613477)
for(let r=0,i=t.length;r<i;++r)for(let n=0,o=t[r].validationResults.length;n<o;++n)if(t[r].validationResults[n].validationResults&&t[r].validationResults[n].validationResults.length>0)return!0
return!1}validateFormElementRecursive(t,r,i){if(assert("object"===e.type(t),'Invalid parameter "formElement"',1475756764),r=!!r,(i=i||[]).push({formElementIdentifierPath:t.get("__identifierPath"),validationResults:this.validateFormElement(t)}),r&&this.validationResultsHasErrors(i))return i
const n=t.get("renderables")
if("array"===e.type(n))for(let o=0,a=n.length;o<a;++o)if(this.validateFormElementRecursive(n[o],r,i),r&&this.validationResultsHasErrors(i))return i
return i}addValidatorIdentifiersFromFormElementPropertyCollections(t){assert("object"===e.type(t),'Invalid parameter "formElement"',1475707334)
const i=l.getFormEditorDefinition("formElements",t.get("type"))
if(!r.isUndefinedOrNull(i.propertyCollections))for(const n of Object.keys(i.propertyCollections))if(Array.isArray(i.propertyCollections[n]))for(let o=0,a=i.propertyCollections[n].length;o<a;++o)if("array"===e.type(i.propertyCollections[n][o].editors)&&-1!==l.getIndexFromPropertyCollectionElementByIdentifier(i.propertyCollections[n][o].identifier,n,t))for(let s=0,d=i.propertyCollections[n][o].editors.length;s<d;++s){if("array"!==e.type(i.propertyCollections[n][o].editors[s].propertyValidators))continue
const p={propertyValidatorsMode:"AND"}
r.isUndefinedOrNull(i.propertyCollections[n][o].editors[s].propertyValidatorsMode)||"OR"!==i.propertyCollections[n][o].editors[s].propertyValidatorsMode||(p.propertyValidatorsMode="OR"),this.addValidatorIdentifiersToFormElementProperty(t,i.propertyCollections[n][o].editors[s].propertyValidators,i.propertyCollections[n][o].editors[s].propertyPath,i.propertyCollections[n][o].identifier,n,p)}}}export class PublisherSubscriber{constructor(){this.topics={},this.subscriberUid=-1}publish(e,t){if(assert(r.isNonEmptyString(e),'Invalid parameter "topic"',1475358066),r.isUndefinedOrNull(this.topics[e]))return
const i=this.topics[e]
for(const n of i)n.func(e,t)}subscribe(t,i){assert(r.isNonEmptyString(t),'Invalid parameter "topic"',1475358067),assert("function"===e.type(i),'Invalid parameter "func"',1475411986),r.isUndefinedOrNull(this.topics[t])&&(this.topics[t]=[])
const n=(++this.subscriberUid).toString()
return this.topics[t].push({token:n,func:i}),n}unsubscribe(e){assert(r.isNonEmptyString(e),'Invalid parameter "token"',1475358068)
for(const t of Object.values(this.topics)){const i=t
for(let n=0,o=i.length;n<o;++n)if(i[n].token===e)return i.splice(n,1),e}return null}}function t(r,i,n,o){if(assert("object"===e.type(r),'Invalid parameter "modelToExtend"',1475358069),assert("object"===e.type(i)||"array"===e.type(i),'Invalid parameter "modelExtension"',1475358070),o=!!o,n=n||"",e.isEmptyObject(i))assert(""!==n,"Empty path is not allowed",1474640022),r.on(n,"core/formElement/somePropertyChanged"),r.set(n,i,o)
else{const a={...i}
for(const s of Object.keys(a)){const l=""===n?s:n+"."+s
r.on(l,"core/formElement/somePropertyChanged"),null===a[s]||"object"!=typeof a[s]&&!Array.isArray(a[s])?"properties.options"===n?r.set(n,i,o):r.set(l,a[s],o):t(r,a[s],l,o)}}}export class Model{constructor(){this.objectData={},this.publisherTopics={}}get(e){let t,i
for(assert(r.isNonEmptyString(e),'Invalid parameter "key"',1475361755),i=this.objectData;e.indexOf(".")>0;){if(t=e.slice(0,e.indexOf(".")),e=e.slice(t.length+1),!(t in i))return
i=i[t]}return i[e]}set(t,i,n){let o,a,l,d,p
assert(r.isNonEmptyString(t),'Invalid parameter "key"',1475361756),n=!!n
const m=this.get(t)
for(p=this.objectData,o=t;o.indexOf(".")>0;)a=o.slice(0,o.indexOf(".")),o=o.slice(a.length+1),e.isNumeric(a)&&(a=parseInt(a,10)),l=-1===(d=o.indexOf("."))?o:o.slice(0,d),"undefined"===e.type(p[a])?e.isNumeric(l)?p[a]=[]:p[a]={}:!1===e.isNumeric(l)&&"array"===e.type(p[a])&&(p[a]={...p[a]}),p=p[a]
if(p[o]=i,!r.isUndefinedOrNull(this.publisherTopics[t])&&!n)for(let c=0,f=this.publisherTopics[t].length;c<f;++c)s.publish(this.publisherTopics[t][c],[t,i,m,this.objectData.__identifierPath])}unset(e,t){let i,n,o
assert(r.isNonEmptyString(e),'Invalid parameter "key"',1489321637),t=!!t
const a=this.get(e)
if(e.indexOf(".")>0?(o=(n=e.split(".")).pop(),n=n.join("."),void 0!==(i=this.get(n))&&delete i[o]):assert(!1,"remove toplevel properties is not supported",1489319753),!r.isUndefinedOrNull(this.publisherTopics[e])&&!t)for(let l=0,d=this.publisherTopics[e].length;l<d;++l)s.publish(this.publisherTopics[e][l],[e,void 0,a,this.objectData.__identifierPath])}on(t,i){assert(r.isNonEmptyString(t),'Invalid parameter "key"',1475361757),assert(r.isNonEmptyString(i),'Invalid parameter "topicName"',1475361758),"array"!==e.type(this.publisherTopics[t])&&(this.publisherTopics[t]=[]),-1===this.publisherTopics[t].indexOf(i)&&this.publisherTopics[t].push(i)}off(t,i){assert(r.isNonEmptyString(t),'Invalid parameter "key"',1475361759),assert(r.isNonEmptyString(i),'Invalid parameter "topicName"',1475361760),"array"===e.type(this.publisherTopics[t])&&(this.publisherTopics[t]=this.publisherTopics[t].filter((e=>i!==e)))}getObjectData(){return e.extend(!0,{},this.objectData)}toString(){const e=this.getObjectData(),{renderables:o,__parentRenderable,...restObjectData}=e,t=o||null
let i=null
r.isUndefinedOrNull(__parentRenderable)||(i=__parentRenderable.getObjectData().__identifierPath+" (filtered)")
const n=restObjectData
if(null!==i&&(n.__parentRenderable=i),null!==t&&Array.isArray(t)){const o=[]
for(let a=0,s=t.length;a<s;++a){const l=t[a]
o.push(JSON.parse(l.toString()))}n.renderables=o}return JSON.stringify(n,null,2)}clone(){const e=this.getObjectData(),r=e.renderables||null
delete e.renderables,delete e.__parentRenderable,e.renderables=!!r||null
const i=new Model
if(t(i,e,"",!0),null!==r&&Array.isArray(r)){const n=[]
for(let o=0,a=r.length;o<a;++o){let s=r[o];(s=s.clone()).set("__parentRenderable",i,!0),n.push(s)}i.set("renderables",n,!0)}return i}}export class Repository{setFormEditorDefinitions(t){assert("object"===e.type(t),'Invalid parameter "formEditorDefinitions"',1475364394)
for(const r of Object.keys(t)){const i=r
if(null===t[i]||"object"==typeof t[i])for(const n of Object.keys(t[i]))null!==t[i][n]&&"object"==typeof t[i][n]||(t[i][n]={})}this.formEditorDefinitions=t}getFormEditorDefinition(t,i){return assert(r.isNonEmptyString(t),'Invalid parameter "definitionName"',1475364952),assert(r.isNonEmptyString(i),'Invalid parameter "subject"',1475364953),e.extend(!0,{},this.formEditorDefinitions[t][i])}getRootFormElement(){return getApplicationStateStack().getCurrentState("formDefinition")}addFormElement(t,i,n,a){let s,l,d
assert("object"===e.type(t),'Invalid parameter "formElement"',1475436224),assert("object"===e.type(i),'Invalid parameter "referenceFormElement"',1475364956),r.isUndefinedOrNull(a)&&(a=!0),a=!!a,n=!!n
const p=this.getFormEditorDefinition("formElements",t.get("type")),m=this.getFormEditorDefinition("formElements",i.get("type"))
if(!p._isTopLevelFormElement&&m._isCompositeFormElement?("array"!==e.type(i.get("renderables"))&&i.set("renderables",[],a),t.set("__parentRenderable",i,a),t.set("__identifierPath",i.get("__identifierPath")+"/"+t.get("identifier"),a),i.get("renderables").push(t)):(i.get("__identifierPath")===getApplicationStateStack().getCurrentState("formDefinition").get("__identifierPath")?(d=i.get("renderables"),i=d[d.length-1]):p._isTopLevelFormElement&&!m._isTopLevelFormElement?i=this.findEnclosingCompositeFormElementWhichIsOnTopLevel(i):p._isCompositeFormElement&&(s=this.findEnclosingCompositeFormElementWhichIsNotOnTopLevel(i))&&(i=s),t.set("__parentRenderable",i.get("__parentRenderable"),a),t.set("__identifierPath",i.get("__parentRenderable").get("__identifierPath")+"/"+t.get("identifier"),a),(l=i.get("__parentRenderable").get("renderables")).splice(l.indexOf(i)+1,0,t)),n&&"array"===e.type(p.editors))for(let c=0,f=p.editors.length;c<f;++c){if("array"!==e.type(p.editors[c].propertyValidators))continue
const y={propertyValidatorsMode:"AND"}
r.isUndefinedOrNull(p.editors[c].propertyValidatorsMode)||"OR"!==p.editors[c].propertyValidatorsMode||(y.propertyValidatorsMode="OR"),o.addValidatorIdentifiersToFormElementProperty(t,p.editors[c].propertyValidators,p.editors[c].propertyPath,void 0,void 0,y)}return t}removeFormElement(t,i,n){r.isUndefinedOrNull(n)&&(n=!0),n=!!n,i=!!i,assert("object"===e.type(t),'Invalid parameter "formElement"',1475364957),assert("object"===e.type(t.get("__parentRenderable")),"Removing the root element is not allowed",1472553024)
const a=t.get("__parentRenderable").get("renderables")
a.splice(a.indexOf(t),1),t.get("__parentRenderable").set("renderables",a,n),i&&o.removeAllValidatorIdentifiersFromFormElement(t)}moveFormElement(t,i,n,o){let a,s,l
assert("object"===e.type(t),'Invalid parameter "formElementToMove"',1475364958),assert("after"===i||"before"===i||"inside"===i,'Invalid position "'+i+'"',1475364959),assert("object"===e.type(n),'Invalid parameter "referenceFormElement"',1475364960),r.isUndefinedOrNull(o)&&(o=!0),o=!!o
const d=this.getFormEditorDefinition("formElements",t.get("type")),p=this.getFormEditorDefinition("formElements",n.get("type"))
this.removeFormElement(t,!1)
const m=(t,i)=>{assert("object"===e.type(t),'Invalid parameter "formElement"',1475364961),assert(r.isNonEmptyString(i),'Invalid parameter "pathPrefix"',1475364962)
const n=t.get("__identifierPath"),a=i+"/"+t.get("identifier"),s=getApplicationStateStack().getCurrentState("propertyValidationServiceRegisteredValidators")
r.isUndefinedOrNull(s[n])||(s[a]=s[n],delete s[n]),getApplicationStateStack().setCurrentState("propertyValidationServiceRegisteredValidators",s),t.set("__identifierPath",a,o)
const l=t.get("renderables")
if("array"===e.type(l))for(let d=0,p=l.length;d<p;++d)m(l[d],t.get("__identifierPath"))}
return"inside"===i?(assert(!d._isTopLevelFormElement,"This move is not allowed",1476993731),assert(p._isCompositeFormElement,"This move is not allowed",1476993732),t.set("__parentRenderable",n,o),m(t,n.get("__identifierPath")),s=n.get("renderables"),r.isUndefinedOrNull(s)&&(s=[]),s.splice(0,0,t),n.set("renderables",s,o)):d._isTopLevelFormElement&&p._isTopLevelFormElement?(l=(a=n.get("__parentRenderable").get("renderables")).indexOf(n),"after"===i?a.splice(l+1,0,t):a.splice(l,0,t),n.get("__parentRenderable").set("renderables",a,o)):(t.get("__parentRenderable").get("identifier")===n.get("__parentRenderable").get("identifier")||(t.set("__parentRenderable",n.get("__parentRenderable"),o),m(t,n.get("__parentRenderable").get("__identifierPath"))),l=(a=n.get("__parentRenderable").get("renderables")).indexOf(n),"after"===i?a.splice(l+1,0,t):a.splice(l,0,t),n.get("__parentRenderable").set("renderables",a,o)),t}getIndexForEnclosingCompositeFormElementWhichIsOnTopLevelForFormElement(t){let r
assert("object"===e.type(t),'Invalid parameter "formElement"',1475364963)
const i=this.getFormEditorDefinition("formElements",t.get("type"))
return(r=i._isTopLevelFormElement&&i._isCompositeFormElement?t:t.get("__identifierPath")===getApplicationStateStack().getCurrentState("formDefinition").get("__identifierPath")?getApplicationStateStack().getCurrentState("formDefinition").get("renderables")[0]:this.findEnclosingCompositeFormElementWhichIsOnTopLevel(t)).get("__parentRenderable").get("renderables").indexOf(r)}findEnclosingCompositeFormElementWhichIsOnTopLevel(t){let r
for(assert("object"===e.type(t),'Invalid parameter "formElement"',1475364964),assert("object"===e.type(t.get("__parentRenderable")),"The root element is never encloused by anything",1472556223),r=this.getFormEditorDefinition("formElements",t.get("type"));!r._isTopLevelFormElement;)t=t.get("__parentRenderable"),r=this.getFormEditorDefinition("formElements",t.get("type"))
return t}findEnclosingGridRowFormElement(t){let r
for(assert("object"===e.type(t),'Invalid parameter "formElement"',1490520271),r=this.getFormEditorDefinition("formElements",t.get("type"));!r._isGridRowFormElement;){if(r._isTopLevelFormElement)return null
t=t.get("__parentRenderable"),r=this.getFormEditorDefinition("formElements",t.get("type"))}return r._isTopLevelFormElement?null:t}findEnclosingCompositeFormElementWhichIsNotOnTopLevel(t){let r
for(assert("object"===e.type(t),'Invalid parameter "formElement"',1475364965),r=this.getFormEditorDefinition("formElements",t.get("type"));!r._isCompositeFormElement;){if(r._isTopLevelFormElement)return null
t=t.get("__parentRenderable"),r=this.getFormEditorDefinition("formElements",t.get("type"))}return r._isTopLevelFormElement?null:t}getNonCompositeNonToplevelFormElements(){const t=[],r=i=>{assert("object"===e.type(i),'Invalid parameter "formElement"',1475364961)
const n=this.getFormEditorDefinition("formElements",i.get("type"))
n._isTopLevelFormElement||n._isCompositeFormElement||t.push(i)
const o=i.get("renderables")
if("array"===e.type(o))for(let a=0,s=o.length;a<s;++a)r(o[a])}
return r(this.getRootFormElement()),t}isFormElementIdentifierUsed(t){let i
assert(r.isNonEmptyString(t),'Invalid parameter "identifier"',1475364966)
const n=r=>{let o
if(r.get("identifier")===t&&(i=!0),!i&&(o=r.get("renderables"),"array"===e.type(o)))for(let a=0,s=o.length;a<s&&(n(o[a]),!i);++a);}
return n(getApplicationStateStack().getCurrentState("formDefinition")),i}getNextFreeFormElementIdentifier(e){let t
assert(r.isNonEmptyString(e),'Invalid parameter "formElementType"',1475373676)
const i=e.toLowerCase().replace(/[^a-z0-9]/g,"-")+"-"
for(t=1;this.isFormElementIdentifierUsed(i+t);)t++
return i+t}findFormElementByIdentifierPath(t){let i,n
assert(r.isNonEmptyString(t),'Invalid parameter "identifierPath"',1475373677)
let o=getApplicationStateStack().getCurrentState("formDefinition")
const a=t.split("/"),s=a.length
for(let l=0;l<s;++l){const d=a[l]
if(0!==l&&l!==s)if(n=o.get("renderables"),Array.isArray(n)){i=null
for(let p=0,m=n.length;p<m;++p)if(d===n[p].get("identifier")){i=n[p]
break}assert("null"!==e.type(i),'Could not find form element "'+d+'" in path "'+t+'"',1472424334),o=i}else assert(!1,"No form elements found",1472424330)
else assert(d===o.get("identifier"),'"'+d+'" does not exist in path "'+t+'"',1472424333)}return o}findFormElement(e){return"object"==typeof e&&(e=e.get("__identifierPath")),this.findFormElementByIdentifierPath(e)}findCollectionElementByIdentifierPath(t,i){assert(r.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475375281),assert("array"===e.type(i),'Invalid parameter "collection"',1475375282)
for(let n=0,o=i.length;n<o;++n)if(i[n].identifier===t)return i[n]}getIndexFromPropertyCollectionElementByIdentifier(t,i,n){assert(r.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475375283),assert("object"===e.type(n),'Invalid parameter "formElement"',1475375284),assert(r.isNonEmptyString(i),'Invalid parameter "collectionName"',1475375285)
const o=n.get(i)
if("array"===e.type(o))for(let a=0,s=o.length;a<s;++a)if(o[a].identifier===t)return a
return-1}addPropertyCollectionElement(i,n,a,s,l){let d,p
assert("object"===e.type(i),'Invalid parameter "collectionElementToAdd"',1475375686),assert("object"===e.type(a),'Invalid parameter "formElement"',1475375687),assert(r.isNonEmptyString(n),'Invalid parameter "collectionName"',1475375688),r.isUndefinedOrNull(l)&&(l=!0),l=!!l,d=a.get(n),"array"!==e.type(d)&&(t(a,[],n,!0),d=a.get(n)),r.isUndefinedOrNull(s)?p=0:assert(-1<(p=this.getIndexFromPropertyCollectionElementByIdentifier(s,n,a)+1),"Could not find collection element "+s+" within collection "+n,1477413154),d.splice(p,0,i),a.set(n,d,!0),o.removeValidatorIdentifiersFromFormElementProperty(a,n)
for(let m=0,c=d.length;m<c;++m)t(a,d[m],n+"."+m,!0)
return a.set(n,d,!0),o.addValidatorIdentifiersFromFormElementPropertyCollections(a),a.set(n,d,l),a}removePropertyCollectionElementByIdentifier(t,i,n,a){assert(r.isNonEmptyString(i),'Invalid parameter "collectionElementIdentifier"',1475375689),assert("object"===e.type(t),'Invalid parameter "formElement"',1475375690),assert(r.isNonEmptyString(n),'Invalid parameter "collectionName"',1475375691)
const s=t.get(n)
assert("array"===e.type(s),'The collection "'+n+'" does not exist',1475375692),r.isUndefinedOrNull(a)&&(a=!0),a=!!a,o.removeValidatorIdentifiersFromFormElementProperty(t,n)
const l=this.getIndexFromPropertyCollectionElementByIdentifier(i,n,t)
s.splice(l,1),t.set(n,s,a),o.addValidatorIdentifiersFromFormElementPropertyCollections(t)}movePropertyCollectionElement(t,i,n,o,a,s){let l
assert("after"===i||"before"===i,'Invalid position "'+i+'"',1477404485),assert("string"===e.type(n),'Invalid parameter "referenceCollectionElementIdentifier"',1477404486),assert("object"===e.type(a),'Invalid parameter "formElement"',1477404488)
const d=a.get(o)
assert("array"===e.type(d),'The collection "'+o+'" does not exist',1477404490)
const p=this.findCollectionElementByIdentifierPath(t,d)
assert("object"===e.type(p),'Invalid parameter "collectionElementToMove"',1477404484),this.removePropertyCollectionElementByIdentifier(a,t,o)
const m=this.getIndexFromPropertyCollectionElementByIdentifier(n,o,a)
assert(-1<m,"Could not find collection element "+n+" within collection "+o,1477404489),"before"===i&&(l=d[m-1],n=r.isUndefinedOrNull(l)?void 0:l.identifier),this.addPropertyCollectionElement(p,o,a,n,s)}}export class Factory{createFormElement(i,n,a,s,d){let p
assert("object"===e.type(i),'Invalid parameter "configuration"',1475375693),assert(r.isNonEmptyString(i.identifier),'"identifier" must not be empty',1475436040),assert(r.isNonEmptyString(i.type),'"type" must not be empty',1475604050),s=!!s,r.isUndefinedOrNull(d)&&(d=!0),d=!!d
const m=l.getFormEditorDefinition("formElements",i.type),c=i.renderables
delete i.renderables
const f={},y=m.predefinedDefaults||{}
for(const g of Object.keys(i))r.isUndefinedOrNull(l.formEditorDefinitions[g])||(y[g]=y[g]||{},f[g]=e.extend(y[g]||{},i[g]),delete y[g],delete i[g])
const u=""===(n=n||"")?i.identifier:n+"/"+i.identifier,h=function(e){e=e||{}
const r=new Model
return t(r,e,"",!0),r}({...y,...i,renderables:!!c||null,__parentRenderable:null,__identifierPath:u})
h.set("__parentRenderable",a||null,d)
for(const[g,collectionElementConfigurations]of Object.entries(f)){let E=0
for(const v of Object.values(collectionElementConfigurations)){let b
const S=this.createPropertyCollectionElement(v.identifier,v,g)
E>0&&(b=f[g][E-1].identifier),l.addPropertyCollectionElement(S,g,h,b,!0),++E}}if(s&&"array"===e.type(m.editors)){E=0
for(let I=m.editors.length;E<I;++E){if("array"!==e.type(m.editors[E].propertyValidators))continue
const _={propertyValidatorsMode:"AND"}
r.isUndefinedOrNull(m.editors[E].propertyValidatorsMode)||"OR"!==m.editors[E].propertyValidatorsMode||(_.propertyValidatorsMode="OR"),o.addValidatorIdentifiersToFormElementProperty(h,m.editors[E].propertyValidators,m.editors[E].propertyPath,void 0,void 0,_)}}if("array"===e.type(c)){p=[]
E=0
for(let F=c.length;E<F;++E)p.push(this.createFormElement(c[E],u,h,s,d))
h.set("renderables",p,d)}return h}createPropertyCollectionElement(t,i,n){let o
assert(r.isNonEmptyString(t),'Invalid parameter "collectionElementIdentifier"',1475377160),assert("object"===e.type(i),'Invalid parameter "collectionElementConfiguration"',1475377161),assert(r.isNonEmptyString(n),'Invalid parameter "collectionName"',1475377162),i.identifier=t
const a=l.getFormEditorDefinition(n,t)
return o="predefinedDefaults"in a&&a.predefinedDefaults?a.predefinedDefaults:{},e.extend(o,i)}}export class DataBackend{constructor(){this.endpoints={},this.prototypeName=null,this.persistenceIdentifier=null}setEndpoints(t){assert("object"===e.type(t),'Invalid parameter "endpoints"',1475377488),this.endpoints=t}setPrototypeName(e){assert(r.isNonEmptyString(e),'Invalid parameter "prototypeName"',1475928095),this.prototypeName=e}setPersistenceIdentifier(e){assert(r.isNonEmptyString(e),'Invalid parameter "persistenceIdentifier"',1475377489),this.persistenceIdentifier=e}saveFormDefinition(){assert(r.isNonEmptyString(this.endpoints.saveForm),'The endpoint "saveForm" is not configured',1475520918),n.saveForm&&n.saveForm.abort(),n.saveForm=e.post(this.endpoints.saveForm,{formPersistenceIdentifier:this.persistenceIdentifier,formDefinition:JSON.stringify(r.convertToSimpleObject(getApplicationStateStack().getCurrentState("formDefinition")))},((e,t,r)=>{n.saveForm===r&&(n.saveForm=null,"success"===e.status?s.publish("core/ajax/saveFormDefinition/success",[e]):s.publish("core/ajax/saveFormDefinition/error",[e]))})),n.saveForm.fail(((e,t,r)=>{s.publish("core/ajax/error",[e,t,r])}))}renderFormDefinitionPage(t){assert(e.isNumeric(t),'Invalid parameter "pageIndex"',1475377781),assert(r.isNonEmptyString(this.endpoints.formPageRenderer),'The endpoint "formPageRenderer" is not configured',1473447677),n.renderFormDefinitionPage&&n.renderFormDefinitionPage.abort(),n.renderFormDefinitionPage=e.post(this.endpoints.formPageRenderer,{formDefinition:JSON.stringify(r.convertToSimpleObject(getApplicationStateStack().getCurrentState("formDefinition"))),pageIndex:t,prototypeName:this.prototypeName},((e,r,i)=>{n.renderFormDefinitionPage===i&&(n.renderFormDefinitionPage=null,s.publish("core/ajax/renderFormDefinitionPage/success",[e,t]))})),n.renderFormDefinitionPage.fail(((e,t,r)=>{s.publish("core/ajax/error",[e,t,r])}))}}export class ApplicationStateStack{constructor(){this.stackSize=10,this.stackPointer=0,this.stack=[]}add(t,r){assert("object"===e.type(t),'Invalid parameter "applicationState"',1477847415),r=!!r,e.extend(t,{propertyValidationServiceRegisteredValidators:e.extend(!0,{},this.getCurrentState("propertyValidationServiceRegisteredValidators"))}),this.stack.splice(0,0,t),this.stack.length>this.stackSize&&this.stack.splice(this.stackSize-1,this.stack.length-this.stackSize),r||s.publish("core/applicationState/add",[t,this.getCurrentStackPointer(),this.getCurrentStackSize()])}addAndReset(t,r){assert("object"===e.type(t),'Invalid parameter "applicationState"',1477872641),this.stackPointer>0&&this.stack.splice(0,this.stackPointer),this.stackPointer=0,this.add(t,!0),r||s.publish("core/applicationState/add",[this.getCurrentState(),this.getCurrentStackPointer(),this.getCurrentStackSize()])}getCurrentState(t){return void 0===t?this.stack[this.stackPointer]||void 0:(assert("formDefinition"===t||"currentlySelectedPageIndex"===t||"currentlySelectedFormElementIdentifierPath"===t||"propertyValidationServiceRegisteredValidators"===t,'Invalid parameter "type"',1477932754),"undefined"!==e.type(this.stack[this.stackPointer])?this.stack[this.stackPointer][t]:void 0)}setCurrentState(e,t){assert("formDefinition"===e||"currentlySelectedPageIndex"===e||"currentlySelectedFormElementIdentifierPath"===e||"propertyValidationServiceRegisteredValidators"===e,'Invalid parameter "type"',1477934111),this.stack[this.stackPointer][e]=t}setMaximalStackSize(t){assert("number"===e.type(t),'Invalid parameter "size"',1477846933),this.stackSize=t}getMaximalStackSize(){return this.stackSize}getCurrentStackSize(){return this.stack.length}getCurrentStackPointer(){return this.stackPointer}setCurrentStackPointer(t){assert("number"===e.type(t),'Invalid parameter "size"',1477852138),t<0?this.stackPointer=0:t>this.stack.length-1?this.stackPointer=this.stack.length-1:this.stackPointer=t}decrementCurrentStackPointer(){this.setCurrentStackPointer(--this.stackPointer)}incrementCurrentStackPointer(){this.setCurrentStackPointer(++this.stackPointer)}}export function getRunningAjaxRequest(e){return assert(r.isNonEmptyString(e),'Invalid parameter "ajaxRequestIdentifier"',1475358064),n[e]||null}const r=new Utility,i=new DataBackend,n={},o=new PropertyValidationService,a=new ApplicationStateStack,s=new PublisherSubscriber,l=new Repository,d=new Factory
export function getUtility(){return r}export function getDataBackend(){return i}export function getPropertyValidationService(){return o}export function getApplicationStateStack(){return a}export function getPublisherSubscriber(){return s}export function getFactory(){return d}export function getRepository(){return l}