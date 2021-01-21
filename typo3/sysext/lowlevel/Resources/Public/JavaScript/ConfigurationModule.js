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
var __decorate=this&&this.__decorate||function(e,t,o,r){var a,l=arguments.length,i=l<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(i=(l<3?a(i):l>3?a(t,o,i):a(t,o))||i);return l>3&&i&&Object.defineProperty(t,o,i),i};define(["require","exports","lit-element","lit-html/directives/if-defined","lit-html/directives/repeat","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Element/Module","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,o,r,a,l,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigurationModule=void 0;let s=class extends o.LitElement{constructor(){super(...arguments),this.src="",this.search="",this.regex=!1,this.active=!1,this.data=null,this.loading=!1,this.load=!1}static get styles(){return o.css`
      :host {
        display: block;
        height: 100%;
      }
    `}createRenderRoot(){return this}render(){return null!==this.data&&!this.load||this.loading||this.loadData(),this.data?o.html`
      <typo3-backend-module>
        <h1>${l.lll("configuration")}</h1>
        ${this.renderData()}
      </typo3-backend-module>
    `:o.html`
        <typo3-backend-module>
          <typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>
        </typo3-backend-module>
      `}connectedCallback(){super.connectedCallback();const e=this.src;if(this.active){const t=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{module:"system_config",url:e,decorate:!1}});console.log("sending out config module load "+e),this.dispatchEvent(t)}this.addEventListener("click",e=>{if(console.log("click",e),e.defaultPrevented||0!==e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;const t=e.composedPath().filter(e=>"A"===e.tagName)[0];if(!t||t.target||t.hasAttribute("download")||"external"===t.getAttribute("rel"))return;const o=t.href;o&&-1===o.indexOf("mailto:")&&(e.preventDefault(),this.setAttribute("src",o),this.removeAttribute("search"),this.removeAttribute("regex"))})}attributeChangedCallback(e,t,o){super.attributeChangedCallback(e,t,o),"src"===e&&(this.load=!0)}shouldUpdate(e){return e.forEach((e,t)=>{"active"===t&&!0!==e&&(this.load=!0)}),this.active}updated(e){const t=this.src;console.error("config updated"),console.log("config updated",e),e.forEach((e,o)=>{if("active"===o&&!1===e){const e=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{module:"system_config",url:t,decorate:!1}});console.log("sending out config module load, because of active attr "+this.getAttribute("src")),this.dispatchEvent(e)}if("loading"===o&&!0===e){const e=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:t,module:"system_config"}});console.log("sending out config module loaded "+t),this.dispatchEvent(e)}})}async loadData(){let e=this.src;this.search&&(e+="&searchString="+encodeURIComponent(this.search)+"&regexSearch="+(this.regex?1:0)),this.loading=!0;const t=await new i(e).get({cache:"no-cache"}),o=await t.resolve();this.loading=!1,this.load=!1,this.data=o}renderData(){const e=this.data;return o.html`
      <span slot="docheader">
        <select @change="${({target:e})=>this.setAttribute("src",e.options[e.selectedIndex].value)}">
          ${a.repeat(e.items,e=>e.url,e=>o.html`<option value="${e.url}" selected="${r.ifDefined(!!e.active||void 0)}">${e.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>
      ${this.loading?o.html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>`:""}

      <h2>${e.treeName}</h2>
      <div id="lowlevel-config">
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
              <label for="lowlevel-searchString">${l.lll("enterSearchPhrase")}</label>
              <input class="form-control" type="search" id="lowlevel-searchString" name="searchString" .value="${e.searchString}" />
          </div>
          <div class="form-group">
              <div class="checkbox">
                  <label for="lowlevel-regexSearch">
                      <input
                          type="checkbox"
                          class="checkbox"
                          name="regexSearch"
                          id="lowlevel-regexSearch"
                          value="1"
                          checked="${r.ifDefined(e.regexSearch?"checked":void 0)}"
                      >
                      ${l.lll("useRegExp")}
                  </label>
              </div>
          </div>
          <div class="form-group">
              <input class="btn btn-default" type="submit" name="search" id="search" value="${l.lll("search")}"/>
          </div>
      </div>

      <div class="nowrap">
        ${this.renderTree(e.treeData)}
      </div>
    `}handleSubmit(e){e.preventDefault();const t=this.querySelector('input[type="search"]').value,o=this.querySelector('input[type="checkbox"][name="regexSearch"]').checked;t?this.setAttribute("search",t):this.removeAttribute("search"),o?this.setAttribute("regex",""):this.removeAttribute("regex")}renderTree(e){return o.html`
      <ul class="list-tree monospace">
        ${e.map(e=>this.renderElement(e))}
      </ul>
    `}renderElement(e){return o.html`
      <li class="${e.active?"active":""}">
        ${e.expandable?o.html`<a class="list-tree-control ${e.expanded?"list-tree-control-open":"list-tree-control-closed"}" id="${e.id}" href="${e.toggle}"><i class="fa"></i></a>`:""}
        <span class="list-tree-label">${e.label}</span>
        ${e.value?o.html` = <span class="list-tree-value">${e.value}</span>`:""}
        ${e.expanded?this.renderTree(e.children):""}
      </li>
    `}};__decorate([o.property({type:String})],s.prototype,"src",void 0),__decorate([o.property({type:String})],s.prototype,"search",void 0),__decorate([o.property({type:Boolean})],s.prototype,"regex",void 0),__decorate([o.property({type:Boolean})],s.prototype,"active",void 0),__decorate([o.internalProperty()],s.prototype,"data",void 0),__decorate([o.internalProperty()],s.prototype,"loading",void 0),__decorate([o.internalProperty()],s.prototype,"load",void 0),s=__decorate([o.customElement("typo3-lowlevel-configuration-module")],s),t.ConfigurationModule=s}));