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
var __decorate=function(e,t,o,a){var r,i=arguments.length,l=i<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,a);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(l=(i<3?r(l):i>3?r(t,o,l):r(t,o))||l);return i>3&&l&&Object.defineProperty(t,o,l),l};import{html,css,LitElement}from"lit";import{customElement,property,state}from"lit/decorators.js";import{ifDefined}from"lit/directives/if-defined.js";import{live}from"lit/directives/live.js";import{repeat}from"lit/directives/repeat.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Loader from"@typo3/backend/viewport/loader.js";import"@typo3/backend/element/module.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";export const componentName="typo3-lowlevel-configuration-module";const alwaysUpdate=(e,t)=>!0;let ConfigurationModule=class extends LitElement{constructor(){super(...arguments),this.endpoint="",this.search="",this.regex=!1,this.active=!1,this.data=null,this.loading=!1,this.load=!1}createRenderRoot(){return this}render(){return null!==this.data&&!this.load||this.loading||this.loadData(),html`
      <typo3-backend-module>
        ${this.data?html`
            <h1>${this.data.labels.configuration}</h1>
            ${this.renderData()}
        `:html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-spinner>`}
      </typo3-backend-module>
    `}shouldUpdate(){return this.active}updated(e){const t=this.endpoint,o="system_config";console.log("config updated",e);let a=!1;if(e.forEach((e,r)=>{if("active"===r&&!0!==e&&(this.load=!0,a=!0),"endpoint"===r&&(this.load=!0,a=!0),"loading"===r&&!0!==e&&Loader.start(),"loading"===r&&!0===e){Loader.finish();const e=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:t,module:o,title:this.data?`${this.data.labels.configuration}: ${this.data.treeName}`:void 0}});console.log("sending out config module loaded "+t),this.dispatchEvent(e)}}),a){const e=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:t,module:o}});this.dispatchEvent(e)}}async loadData(){let e=this.endpoint;this.search&&(e+="&searchString="+encodeURIComponent(this.search)+"&regexSearch="+(this.regex?1:0)),this.loading=!0;const t=await new AjaxRequest(e).get({cache:"no-cache"}),o=await t.resolve();this.loading=!1,this.load=!1,this.data=o}createShortcut(e){return top.TYPO3.ShortcutMenu.createShortcut(e.shortcut.routeIdentifier,e.shortcut.routeArguments,e.shortcut.displayName,"Create a bookmark to this page",this.renderRoot.querySelector("#shortcut-button")),!1}renderData(){const e=this.data,t=this.data.labels;return html`
      <span slot="docheader">
        <select .value=${live(e.self)}
                class="form-select form-select-sm"
                @change="${({target:e})=>this.endpoint=e.options[e.selectedIndex].value}">
          ${repeat(e.items,e=>e.url,e=>html`<option selected="${ifDefined(!!e.active||void 0)}" value="${e.url}">${e.label}</option>`)}
        </select>
      </span>
      <span slot="docheader">Path info</span>

      <a href="#" slot="docheader-button-right"
         id="shortcut-button"
         class="btn btn-default btn-sm"
         @click="${()=>this.createShortcut(e)}"
         title="Create a bookmark to this page">
        <typo3-backend-icon identifier="actions-system-shortcut-new" size="small"></typo3-backend-icon>
      </a>

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
                          checked="${ifDefined(e.regexSearch?"checked":void 0)}"
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
    `}handleSubmit(e){e.preventDefault();const t=this.querySelector('input[type="search"]').value,o=this.querySelector('input[type="checkbox"][name="regexSearch"]').checked;this.search=t||null,this.regex=o,this.load=!0}renderTree(e){return html`
      <ul class="list-tree monospace">
        ${e.map(e=>this.renderElement(e))}
      </ul>
    `}renderElement(e){return html`
      <li class="${e.active?"active":""}">
        <span class="list-tree-group">
          ${e.expandable?html`<a class="list-tree-control ${e.expanded?"list-tree-control-open":"list-tree-control-closed"}" id="${e.id}" href="${e.toggle}" @click="${this._linkClick}"><i class="fa"></i></a>`:""}
          <span class="list-tree-label">${e.label}</span>
          ${e.value?html` = <span class="list-tree-value">${e.value}</span>`:""}
          ${e.expanded?this.renderTree(e.children):""}
        </span>
      </li>
    `}_linkClick(e){e.preventDefault();const t=e.target.getAttribute("href");this.endpoint=t,this.removeAttribute("search"),this.removeAttribute("regex")}};ConfigurationModule.styles=css`
    :host {
      display: block;
      height: 100%;
    }
  `,__decorate([property({type:String,reflect:!0,hasChanged:alwaysUpdate})],ConfigurationModule.prototype,"endpoint",void 0),__decorate([property({type:String,reflect:!0})],ConfigurationModule.prototype,"search",void 0),__decorate([property({type:Boolean,reflect:!0})],ConfigurationModule.prototype,"regex",void 0),__decorate([property({type:Boolean})],ConfigurationModule.prototype,"active",void 0),__decorate([state()],ConfigurationModule.prototype,"data",void 0),__decorate([state()],ConfigurationModule.prototype,"loading",void 0),__decorate([state()],ConfigurationModule.prototype,"load",void 0),ConfigurationModule=__decorate([customElement(componentName)],ConfigurationModule);export{ConfigurationModule};