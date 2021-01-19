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
var __decorate=this&&this.__decorate||function(e,t,o,a){var r,l=arguments.length,i=l<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,a);else for(var s=e.length-1;s>=0;s--)(r=e[s])&&(i=(l<3?r(i):l>3?r(t,o,i):r(t,o))||i);return l>3&&i&&Object.defineProperty(t,o,i),i};define(["require","exports","lit-element","lit-html/directives/if-defined","lit-html/directives/repeat","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Viewport/Loader","TYPO3/CMS/Backend/Element/Module","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,o,a,r,l,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigurationModule=void 0;let s=class extends o.LitElement{constructor(){super(...arguments),this.src="",this.search="",this.regex=!1,this.active=!1,this.data=null,this.loading=!1,this.load=!1}static get styles(){return o.css`
      :host {
        display: block;
        height: 100%;
      }
    `}createRenderRoot(){return this}render(){return null!==this.data&&!this.load||this.loading||this.loadData(),this.data?o.html`
      <typo3-backend-module>
        <h1>${this.data.labels.configuration}</h1>
        ${this.renderData()}
      </typo3-backend-module>
    `:o.html`
        <typo3-backend-module>
          <typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>
        </typo3-backend-module>
      `}attributeChangedCallback(e,t,o){super.attributeChangedCallback(e,t,o),"active"!==e&&(this.load=!0)}shouldUpdate(e){return e.forEach((e,t)=>{"active"===t&&!0!==e&&(this.load=!0)}),this.active}updated(e){const t=this.src;console.log("config updated",e),e.forEach((e,o)=>{if("active"===o&&!0!==e){const e=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{module:"system_config",url:t,decorate:!1}});console.log("sending out config module load, because of active attr "+this.src),this.dispatchEvent(e)}if("loading"===o&&!0!==e&&i.start(),"loading"===o&&!0===e){i.finish();const e=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:t,module:"system_config"}});console.log("sending out config module loaded "+t),this.dispatchEvent(e)}})}async loadData(){let e=this.src;this.search&&(e+="&searchString="+encodeURIComponent(this.search)+"&regexSearch="+(this.regex?1:0)),this.loading=!0;const t=await new l(e).get({cache:"no-cache"}),o=await t.resolve();this.loading=!1,this.load=!1,this.data=o}renderData(){const e=this.data,t=this.data.labels;return o.html`
      <span slot="docheader">
        <select @change="${({target:e})=>this.setAttribute("src",e.options[e.selectedIndex].value)}">
          ${r.repeat(e.items,e=>e.url,e=>o.html`<option value="${e.url}" selected="${a.ifDefined(!!e.active||void 0)}">${e.label}</option>`)}
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
              <label for="lowlevel-searchString">${t.enterSearchPhrase}</label>
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
                          checked="${a.ifDefined(e.regexSearch?"checked":void 0)}"
                      >
                      ${t.useRegExp}
                  </label>
              </div>
          </div>
          <div class="form-group">
              <input class="btn btn-default" type="submit" name="search" id="search" value="${t.search}"/>
          </div>
      </div>

      <div>
        ${this.renderTree(e.treeData)}
      </div>
    `}handleSubmit(e){e.preventDefault();const t=this.querySelector('input[type="search"]').value,o=this.querySelector('input[type="checkbox"][name="regexSearch"]').checked;this.search=t||null,this.regex=o,this.load=!0}renderTree(e){return o.html`
      <ul class="list-tree monospace">
        ${e.map(e=>this.renderElement(e))}
      </ul>
    `}renderElement(e){return o.html`
      <li class="${e.active?"active":""}">
        ${e.expandable?o.html`<a class="list-tree-control ${e.expanded?"list-tree-control-open":"list-tree-control-closed"}" id="${e.id}" href="${e.toggle}" @click="${this._linkClick}"><i class="fa"></i></a>`:""}
        <span class="list-tree-label">${e.label}</span>
        ${e.value?o.html` = <span class="list-tree-value">${e.value}</span>`:""}
        ${e.expanded?this.renderTree(e.children):""}
      </li>
    `}_linkClick(e){e.preventDefault();const t=e.target.getAttribute("href");this.setAttribute("src",t),this.removeAttribute("search"),this.removeAttribute("regex")}};__decorate([o.property({type:String,reflect:!0})],s.prototype,"src",void 0),__decorate([o.property({type:String,reflect:!0})],s.prototype,"search",void 0),__decorate([o.property({type:Boolean,reflect:!0})],s.prototype,"regex",void 0),__decorate([o.property({type:Boolean})],s.prototype,"active",void 0),__decorate([o.internalProperty()],s.prototype,"data",void 0),__decorate([o.internalProperty()],s.prototype,"loading",void 0),__decorate([o.internalProperty()],s.prototype,"load",void 0),s=__decorate([o.customElement("typo3-lowlevel-configuration-module")],s),t.ConfigurationModule=s}));