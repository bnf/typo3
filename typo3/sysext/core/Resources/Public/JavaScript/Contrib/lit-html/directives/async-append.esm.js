import{clearPart as p,insertPart as u,setChildPartValue as c$1}from"../directive-helpers.esm.js";import{directive as e,PartType as t}from"../directive.esm.js";import{AsyncReplaceDirective as o}from"./async-replace.esm.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const c=e(class extends o{constructor(r){if(super(r),r.type!==t.CHILD)throw Error("asyncAppend can only be used in child expressions")}update(r,e){return this._$CX=r,super.update(r,e)}commitValue(r,e){0===e&&p(this._$CX);const s=u(this._$CX);c$1(s,r)}});export{c as asyncAppend};
