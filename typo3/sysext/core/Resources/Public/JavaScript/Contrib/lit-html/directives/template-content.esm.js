import{noChange as T}from"../lit-html.esm.js";import{directive as e,Directive as i,PartType as t}from"../directive.esm.js";
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o=e(class extends i{constructor(t$1){if(super(t$1),t$1.type!==t.CHILD)throw Error("templateContent can only be used in child bindings")}render(r){return this.at===r?T:(this.at=r,document.importNode(r.content,!0))}});export{o as templateContent};
