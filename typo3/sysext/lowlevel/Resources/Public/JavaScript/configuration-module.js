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
var __decorate=function(e,t,o,a){var s,r=arguments.length,l=r<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,a);else for(var n=e.length-1;n>=0;n--)(s=e[n])&&(l=(r<3?s(l):r>3?s(t,o,l):s(t,o))||l);return r>3&&l&&Object.defineProperty(t,o,l),l};import{html,css,nothing,LitElement}from"lit";import{customElement,property,state}from"lit/decorators.js";import{Task}from"@lit/task";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Loader from"@typo3/backend/viewport/loader.js";import"@typo3/backend/element/module.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";import"@typo3/backend/tree/tree-node-toggle.js";import"@typo3/backend/utility/collapse-state-persister.js";import"@typo3/backend/utility/collapse-state-search.js";export const componentName="typo3-lowlevel-configuration-module";let ConfigurationModule=class extends LitElement{constructor(){super(...arguments),this.active=!1,this.endpoint="",this.search="",this.data=null,this.task=new Task(this,{task:async([e],{signal:t})=>{const o=await new AjaxRequest(e).get({cache:"no-cache",signal:t});return await o.resolve()},args:()=>[this.endpoint]})}createRenderRoot(){return this}render(){const e=this.endpoint,t="system_config",o=this.task.render({pending:()=>{Loader.start();const o=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,module:t}});return this.dispatchEvent(o),html`<typo3-backend-spinner slot="docheader-button-left"></typo3-backend-size>`},complete:o=>(this.updateComplete.then((()=>{Loader.finish();const a=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:e,module:t,title:o?`${o.labels.moduleTitle}: ${o.treeName}`:void 0}});console.log("sending out config module loaded "+e,a),this.dispatchEvent(a)})),this.renderData(o)),error:()=>(this.updateComplete.then((()=>Loader.finish())),html`Failed to Load configuration module`)});return html`<typo3-backend-module>${o}</typo3-backend-module>`}shouldUpdate(){return this.active}updated(e){console.log("config updated",e),e.forEach(((e,t)=>{"active"===t&&!0!==e&&this.task.run()}))}createShortcut(e){return top.TYPO3.ShortcutMenu.createShortcut(e.shortcut.routeIdentifier,e.shortcut.routeArguments,e.shortcut.displayName,"Create a bookmark to this page",this.renderRoot.querySelector("#shortcut-button")),!1}renderData(e){this.data=e;const t=e.labels;return html`
      <form action="" id="ConfigurationView" method="post">
        <h1>${e.labels.moduleTitle}</h1>

        <h2>${e.treeName}</h2>

        <div id="lowlevel-config" class="form-row">
          <div class="form-group">
            <form>
              <label for="searchValue" class="form-label">
                ${t.enterSearchPhrase}
              </label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control form-control-clearable t3js-collapse-search-term"
                  name="searchValue"
                  id="searchValue"
                  data-persist-collapse-search-key="collapse-search-term-lowlevel-configuration-{treeLabelHash}"
                  value=""
                  minlength="3"
                />
                <button type="submit" class="btn btn-default" aria-label="${t.searchTitle}" disabled>
                  <typo3-backend-icon identifier="actions-search"></typo3-backend-icon>
                </button>
              </div>
            </form>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge badge-success hidden t3js-collapse-states-search-numberOfSearchMatches"></span>
          </div>
        </div>

        ${e.tree?html`
          <div class="t3js-collapse-states-search-tree">
            ${this.renderTree(e.tree,e.treeLabelHash)}
          </div>
        `:nothing}
      </form>
    `}handleSubmit(e){e.preventDefault();const t=this.querySelector('input[type="search"]').value;this.search=t||null,this.task.run()}renderTree(e,t,o=""){const a=(e,a)=>{if(null===a)return html`
          <li>
            <span class="treelist-group treelist-group-monospace">
              <span class="treelist-label">${e}</span>
              <span class="treelist-operator">=</span>
            </span>
          </li>
        `;if("object"==typeof a){const s="hash-"+hashCode(o+e);return html`
          <li>
            <typo3-backend-tree-node-toggle
              class="treelist-control collapsed"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-list-${s}"
              aria-expanded="false">
            </typo3-backend-tree-node-toggle>

            <span class="treelist-group treelist-group-monospace">
              <span class="treelist-label">${e}</span>
            </span>

            <div
              class="treelist-collapse collapse"
              data-persist-collapse-state="true"
              data-persist-collapse-state-suffix="lowlevel-configuration-${t}"
              data-persist-collapse-state-if-state="shown"
              data-persist-collapse-state-not-if-search="true"
              id="collapse-list-${s}"
              >
                ${this.renderTree(a,t,s)}
            </div>
          </li>
        `}return html`
        <li>
          <span class="treelist-group treelist-group-monospace">
            <span class="treelist-label">${e}</span>
            <span class="treelist-operator">=</span>
            <span class="treelist-value">${a}</span>
          </span>
        </li>
      `};console.log(e);const s=Array.isArray(e)?e.map(((e,t)=>a(t.toString(),e))):Object.entries(e).map((([e,t])=>a(e,t)));return html`<ul class="treelist">${s}</ul>`}};ConfigurationModule.styles=css`
    :host {
      display: block;
      height: 100%;
    }
  `,__decorate([property({type:Boolean})],ConfigurationModule.prototype,"active",void 0),__decorate([property({type:String,reflect:!0})],ConfigurationModule.prototype,"endpoint",void 0),__decorate([property({type:String,reflect:!0})],ConfigurationModule.prototype,"search",void 0),__decorate([state()],ConfigurationModule.prototype,"data",void 0),ConfigurationModule=__decorate([customElement(componentName)],ConfigurationModule);export{ConfigurationModule};function hashCode(e){let t=0;for(let o=0,a=e.length;o<a;o++){t=(t<<5)-t+e.charCodeAt(o),t|=0}return t}