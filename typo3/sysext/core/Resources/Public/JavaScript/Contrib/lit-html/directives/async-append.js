import{clearPart,insertPart,setChildPartValue}from"lit-html/directive-helpers.js";import{directive,PartType}from"lit-html/directive.js";import{AsyncReplaceDirective}from"lit-html/directives/async-replace.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const c=directive(class extends AsyncReplaceDirective{constructor(r){if(super(r),r.type!==PartType.CHILD)throw Error("asyncAppend can only be used in child expressions")}update(r,e){return this._$CX=r,super.update(r,e)}commitValue(r,e){0===e&&clearPart(this._$CX);const s=insertPart(this._$CX);setChildPartValue(s,r)}});export{c as asyncAppend};
