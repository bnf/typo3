define(["@lit/reactive-element","lit-html","lit-html/hydrate"],(function(reactiveElement,litHtml,hydrate){"use strict";
/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */window.litElementHydrateSupport=({LitElement:s})=>{const o=s.prototype.createRenderRoot;s.prototype.createRenderRoot=function(){return this.shadowRoot?(this.G=!0,this.shadowRoot):o.call(this)},s.prototype.update=function(s){const o=this.render();reactiveElement.ReactiveElement.prototype.update.call(this,s),this.G?(this.G=!1,hydrate.hydrate(o,this.renderRoot,this.renderOptions)):litHtml.render(o,this.renderRoot,this.renderOptions)}}}));
