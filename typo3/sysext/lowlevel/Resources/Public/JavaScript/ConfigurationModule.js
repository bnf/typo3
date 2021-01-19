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
var __decorate=this&&this.__decorate||function(e,t,o,a){var l,r=arguments.length,n=r<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,a);else for(var s=e.length-1;s>=0;s--)(l=e[s])&&(n=(r<3?l(n):r>3?l(t,o,n):l(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};define(["require","exports","lit-element","lit-html/directives/if-defined","lit-html/directives/repeat","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Element/Module"],(function(e,t,o,a,l,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigurationModule=void 0;let n=class extends o.LitElement{constructor(){super(...arguments),this.src="",this.data=null}static get styles(){return o.css`
      :host {
        display: block;
        height: 100%;
      }
    `}createRenderRoot(){return this}render(){return this.data?o.html`
      <typo3-backend-module>
        ${this.renderData()}
      </typo3-backend-module>
    `:o.html`<typo3-backend-module>Loading…</typo3-backend-module>`}connectedCallback(){super.connectedCallback();const e=this.src,t=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,decorate:!1}});console.log("sending out config module load "+e),this.dispatchEvent(t),this.addEventListener("click",e=>{if(console.log("click",e),e.defaultPrevented||0!==e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;const t=e.composedPath().filter(e=>"A"===e.tagName)[0];if(!t||t.target||t.hasAttribute("download")||"external"===t.getAttribute("rel"))return;const o=t.href;o&&-1===o.indexOf("mailto:")&&(e.preventDefault(),this.setAttribute("src",o.replace(/#.*/,"")))}),this.loadData()}attributeChangedCallback(e,t,o){super.attributeChangedCallback(e,t,o),"src"===e&&this.loadData()}updated(){const e=this.src,t=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:e,module:"system_config"}});console.log("sending out config module loaded "+e),this.dispatchEvent(t)}async loadData(){const e=await new r(this.src).get({cache:"no-cache"}),t=await e.resolve();this.data=t}async getData(){const e=await new r(this.src).get({cache:"no-cache"}),t=await e.resolve();return console.log(t),o.html`
      <span slot="docheader">
        <select .value="${this.src}" @change="${({target:e})=>this.setAttribute("src",e.options[e.selectedIndex].value)}">
          ${l.repeat(t.items,e=>e.url,e=>o.html`<option value="${e.url}" selected="${a.ifDefined(!!e.active||void 0)}">${e.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>

      ${this.renderTree(t.treeData)}
    `}renderData(){const e=this.data;return o.html`
      <span slot="docheader">
        <select @change="${({target:e})=>this.setAttribute("src",e.options[e.selectedIndex].value)}">
          ${l.repeat(e.items,e=>e.url,e=>o.html`<option value="${e.url}" selected="${a.ifDefined(!!e.active||void 0)}">${e.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>

      ${this.renderTree(e.treeData)}
    `}renderTree(e){return o.html`
      <ul class="list-tree monospace">
        ${e.map(e=>this.renderElement(e))}
      </ul>
    `}renderElement(e){return o.html`
      <li class="${e.active?"active":""}">
        ${e.expandable?o.html`<a class="list-tree-control ${e.expanded?"list-tree-control-open":"list-tree-control-closed"}" id="${e.goto}" href="${e.toggle}"><i class="fa"></i></a>`:""}
        <span class="list-tree-label">${e.label}</span>
        ${e.value?o.html` = <span class="list-tree-value">${e.value}</span>`:""}
        ${e.expanded?this.renderTree(e.children):""}
      </li>
    `}};__decorate([o.property({type:String})],n.prototype,"src",void 0),__decorate([o.internalProperty()],n.prototype,"data",void 0),n=__decorate([o.customElement("typo3-lowlevel-configuration-module")],n),t.ConfigurationModule=n}));