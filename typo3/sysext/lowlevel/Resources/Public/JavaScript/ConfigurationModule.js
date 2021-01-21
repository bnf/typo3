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
var __decorate=this&&this.__decorate||function(e,t,r,o){var a,l=arguments.length,i=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(i=(l<3?a(i):l>3?a(t,r,i):a(t,r))||i);return l>3&&i&&Object.defineProperty(t,r,i),i};define(["require","exports","lit-element","lit-html/directives/if-defined","lit-html/directives/repeat","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Element/Module","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,r,o,a,l,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigurationModule=void 0;let s=class extends r.LitElement{constructor(){super(...arguments),this.src="",this.search="",this.regex=!1,this.active=!1,this.data=null,this.loading=!1}static get styles(){return r.css`
      :host {
        display: block;
        height: 100%;
      }
    `}createRenderRoot(){return this}render(){return this.data?r.html`
      <typo3-backend-module>
        <h1>${l.lll("configuration")}</h1>
        ${this.renderData()}
      </typo3-backend-module>
    `:r.html`
        <typo3-backend-module>
          <typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>
        </typo3-backend-module>
      `}connectedCallback(){super.connectedCallback();const e=this.src;if(null!==this.getAttribute("active")){const t=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,decorate:!1}});console.log("sending out config module load "+e),this.dispatchEvent(t)}this.addEventListener("click",e=>{if(console.log("click",e),e.defaultPrevented||0!==e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;const t=e.composedPath().filter(e=>"A"===e.tagName)[0];if(!t||t.target||t.hasAttribute("download")||"external"===t.getAttribute("rel"))return;const r=t.href;r&&-1===r.indexOf("mailto:")&&(e.preventDefault(),this.setAttribute("src",r.replace(/#.*/,"")),this.removeAttribute("search"),this.removeAttribute("regex"))}),this.loadData()}attributeChangedCallback(e,t,r){super.attributeChangedCallback(e,t,r),"active"!==e&&this.active&&(this.requestUpdate(),this.updateComplete.then(()=>this.loadData()))}shouldUpdate(e){let t=!0;return e.forEach((e,r)=>{"active"!==r||this.active||(t=!1)}),t}updated(e){e.forEach((e,t)=>{if("active"===t&&this.active){const e=this.src,t=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,decorate:!1}});console.log("sending out config module load, because of active attr "+this.getAttribute("src")),this.dispatchEvent(t),this.requestUpdate(),this.updateComplete.then(()=>this.loadData())}});const t=this.src,r=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:t,module:"system_config"}});console.log("sending out config module loaded "+t),this.dispatchEvent(r)}async loadData(){if(this.loading)return Promise.reject();let e=this.src;this.search&&(e+="&searchString="+encodeURIComponent(this.search)+"&regexSearch="+(this.regex?1:0)),this.loading=!0;const t=await new i(e).get({cache:"no-cache"}),r=await t.resolve();this.loading=!1,this.data=r}renderData(){const e=this.data;return r.html`
      <span slot="docheader">
        <select @change="${({target:e})=>this.setAttribute("src",e.options[e.selectedIndex].value)}">
          ${a.repeat(e.items,e=>e.url,e=>r.html`<option value="${e.url}" selected="${o.ifDefined(!!e.active||void 0)}">${e.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>
      <button slot="docheader-button-left">Left</button>
      <button slot="docheader-button-right">Right</button>
      ${this.loading?r.html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>`:""}

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
                          checked="${o.ifDefined(e.regexSearch?"checked":void 0)}"
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
    `}handleSubmit(e){e.preventDefault();const t=this.querySelector('input[type="search"]').value,r=this.querySelector('input[type="checkbox"][name="regexSearch"]').checked;t?this.setAttribute("search",t):this.removeAttribute("search"),r?this.setAttribute("regex",""):this.removeAttribute("regex")}renderTree(e){return r.html`
      <ul class="list-tree monospace">
        ${e.map(e=>this.renderElement(e))}
      </ul>
    `}renderElement(e){return r.html`
      <li class="${e.active?"active":""}">
        ${e.expandable?r.html`<a class="list-tree-control ${e.expanded?"list-tree-control-open":"list-tree-control-closed"}" id="${e.goto}" href="${e.toggle}"><i class="fa"></i></a>`:""}
        <span class="list-tree-label">${e.label}</span>
        ${e.value?r.html` = <span class="list-tree-value">${e.value}</span>`:""}
        ${e.expanded?this.renderTree(e.children):""}
      </li>
    `}};__decorate([r.property({type:String})],s.prototype,"src",void 0),__decorate([r.property({type:String})],s.prototype,"search",void 0),__decorate([r.property({type:Boolean})],s.prototype,"regex",void 0),__decorate([r.property({type:Boolean})],s.prototype,"active",void 0),__decorate([r.internalProperty()],s.prototype,"data",void 0),__decorate([r.internalProperty()],s.prototype,"loading",void 0),s=__decorate([r.customElement("typo3-lowlevel-configuration-module")],s),t.ConfigurationModule=s}));