import{isSingleExpression,setCommittedValue}from"lit-html/directive-helpers.js";import{directive,Directive,PartType}from"lit-html/directive.js";import{noChange,nothing}from"lit-html/lit-html.js";
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const l=directive(class extends Directive{constructor(r){if(super(r),r.type!==PartType.PROPERTY&&r.type!==PartType.ATTRIBUTE&&r.type!==PartType.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!isSingleExpression(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t]){if(t===noChange||t===nothing)return t;const o=i.element,l=i.name;if(i.type===PartType.PROPERTY){if(t===o[l])return noChange}else if(i.type===PartType.BOOLEAN_ATTRIBUTE){if(!!t===o.hasAttribute(l))return noChange}else if(i.type===PartType.ATTRIBUTE&&o.getAttribute(l)===t+"")return noChange;return setCommittedValue(i),t}});export{l as live};
