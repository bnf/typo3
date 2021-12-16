import{directive,Directive,PartType}from"lit-html/directive";import{noChange}from"lit-html/lit-html";
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o=directive(class extends Directive{constructor(t){if(super(t),t.type!==PartType.CHILD)throw Error("templateContent can only be used in child bindings")}render(r){return this.at===r?noChange:(this.at=r,document.importNode(r.content,!0))}});export{o as templateContent};
