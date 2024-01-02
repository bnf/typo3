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
var __decorate=function(e,t,i,s){var a,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(a=e[r])&&(n=(o<3?a(n):o>3?a(t,i,n):a(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};import{html,LitElement}from"lit";import{live}from"lit/directives/live.js";import{customElement,property,state}from"lit/decorators.js";import{Task}from"@lit/task";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Loader from"@typo3/backend/viewport/loader.js";import PersistentStorage from"@typo3/backend/storage/persistent.js";import"@typo3/backend/element/module.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";export const componentName="typo3-viewpage-module";const module="page_preview";let ViewPageModule=class extends LitElement{constructor(){super(...arguments),this.active=!1,this.endpoint="",this.size=null,this.custom=null,this.cache=null,this.storagePrefix="moduleData.page_preview.States.",this.task=new Task(this,{task:async([e],{signal:t})=>{this.dispatchLoad(e,"viewpage");const i=await new AjaxRequest(e).get({cache:"no-cache",signal:t}),s=await i.resolve();return this.task.taskComplete.then((async()=>{this.requestUpdate(),await this.updateComplete,this.dispatchLoaded(e,s)}),(()=>{Loader.finish()})),s},args:()=>[this.endpoint]}),this.handleOrientationChange=()=>{this.size={...this.size,width:this.size.height,height:this.size.width},this.persistCurrentPreset()},this.handleSizeInputChange=(e,t)=>{const i=e.target;i.valueAsNumber&&(this.size=this.custom={...this.size,label:this.custom.label,[t]:i.valueAsNumber},this.persistCustomPresetAfterChange())},this.handlePresetSelection=(e,t)=>{null===t&&(t={label:this.cache.labels.maximized,width:100,height:100});const{label:i,width:s,height:a}=t;this.size={label:i,width:s,height:a},this.persistCurrentPreset()},this.handleRefresh=()=>{const e=this.renderRoot.querySelector("iframe");e&&e.contentWindow.location.reload()}}createRenderRoot(){return this}dispatchLoad(e,t){Loader.start();const i=new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:{url:e,module:t}});this.dispatchEvent(i)}dispatchLoaded(e,t){Loader.finish();const i=new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail:{url:e,module:module,title:t.title}});this.dispatchEvent(i),console.log("sending out config module loaded "+e,i)}render(){const e=this.task.render({pending:()=>null===this.cache?html`<typo3-backend-spinner></typo3-backend-spinner>`:this.renderContent({...this.cache,title:"Loading"},!0),complete:e=>{const{url:t,labels:i,current:s,custom:a,presetGroups:o}=e;return null===this.size&&(this.size=s,this.custom=a),this.cache={url:t,labels:i,current:s,custom:a,presetGroups:o},this.renderContent(e,!1)},error:()=>html`<p>Failed to load viewpage module</p>`});return html`<typo3-backend-module>${e}</typo3-backend-module>`}renderContent(e,t){const{url:i,labels:s,presetGroups:a}=e,o=this.size,n=this.custom;return html`

      <button slot="docheader-button-right" class="btn btn-sm btn-default" title=${s.refresh} @click=${()=>this.handleRefresh()}>
        <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
      </button>

      <div class="viewpage-item">
        <div class="viewpage-topbar t3js-viewpage-topbar" data-loading="${t?"true":"false"}">
          <div class="viewpage-topbar-orientation t3js-viewpage-topbar-orientation">
            <a href="#" class="t3js-change-orientation" @click=${this.handleOrientationChange}>
              <typo3-backend-icon identifier="actions-device-orientation-change" size="small"></typo3-backend-icon>
            </a>
          </div>
          <div class="viewpage-topbar-preset">
            <span class="dropdown">
              <button type="button" id="viewpage-topbar-preset-button" class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <span class="t3js-viewpage-current-label">
                  ${o.label} (${n.width}px/${n.height}px)
                </span>
              </button>
              <ul class="dropdown-menu" aria-labelledby="viewpage-topbar-preset-button">
                <li>
                  <a href="#" class="dropdown-item t3js-preset-maximized t3js-change-preset" @click=${e=>this.handlePresetSelection(e,null)} data-key="maximized" data-label=${s.maximized} data-width data-height>
                    <span class="dropdown-item-columns">
                      <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                        <typo3-backend-icon identifier="actions-fullscreen" size="small"></typo3-backend-icon>
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-title">
                        ${s.maximized}
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-value">
                        100%/100%
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item t3js-preset-custom t3js-change-preset" @click=${e=>this.handlePresetSelection(e,this.custom)} data-key="custom" data-label=${s.custom} data-width="${n.width}" data-height="${n.height}">
                    <span class="dropdown-item-columns">
                      <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                        <typo3-backend-icon identifier="actions-expand" size="small"></typo3-backend-icon>
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-title t3js-preset-custom-label">
                        ${s.custom}
                      </span>
                      <span class="dropdown-item-column dropdown-item-column-value">
                        <span class="t3js-preset-custom-width">${n.width}</span>px/<span class="t3js-preset-custom-height">${n.height}</span>px
                      </span>
                    </span>
                  </a>
                </li>
                ${Object.values(a).filter((e=>Object.keys(e).length>0)).map((e=>html`
                  <li><hr class="dropdown-divider"></li>
                  ${Object.values(e).map((e=>html`
                    <li>
                      <a href="#" class="dropdown-item t3js-change-preset" @click=${t=>this.handlePresetSelection(t,e)} data-key="${e.key}" data-label="${e.label}" data-width="${e.width}" data-height="${e.height}">
                        <span class="dropdown-item-columns">
                          <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                            <typo3-backend-icon identifier="actions-device-${e.type?e.type:"unidentified"}" size="small"></typo3-backend-icon>
                          </span>
                          <span class="dropdown-item-column dropdown-item-column-title">
                            ${e.label}
                          </span>
                          <span class="dropdown-item-column dropdown-item-column-value">
                            ${e.width?e.width+"px":"100%"}/${e.height?e.height+"px":"100%"}
                          </span>
                        </span>
                      </a>
                    </li>
                  `))}
                `))}
              </ul>
            </span>
          </div>
          <div class="viewpage-topbar-size">
            <input class="t3js-viewpage-input-width" type="number" name="width" min="300" max="9999" .value="${live(o.width)}" @change=${e=>this.handleSizeInputChange(e,"width")}>
            x
            <input class="t3js-viewpage-input-height" type="number" name="height" min="300" max="9999" .value="${live(o.height)}" @change=${e=>this.handleSizeInputChange(e,"height")}>
          </div>
        </div>
        <div class="viewpage-resizeable t3js-viewpage-resizeable" style="width:${o.width}px;height:${o.height}px;">
          <iframe src=${i} width="100%" height="100%" id="tx_viewpage_iframe" frameborder="0" border="0" title=${s.iframeTitle}></iframe>
          <!-- support handles for interactjs -->
          <div class="resizable-w"></div>
          <div class="resizable-s"></div>
          <div class="resizable-e"></div>
        </div>
      </div>
    `}shouldUpdate(){return this.active}persistChanges(e,t){PersistentStorage.set(e,t)}persistCurrentPreset(){this.persistChanges(this.storagePrefix+"current",this.size)}persistCustomPreset(){this.persistChanges(this.storagePrefix+"current",this.size),this.persistChanges(this.storagePrefix+"custom",this.custom)}persistCustomPresetAfterChange(){clearTimeout(this.queueDelayTimer),this.queueDelayTimer=window.setTimeout((()=>{this.persistCustomPreset()}),1e3)}};__decorate([property({type:Boolean})],ViewPageModule.prototype,"active",void 0),__decorate([property({type:String,reflect:!0})],ViewPageModule.prototype,"endpoint",void 0),__decorate([state()],ViewPageModule.prototype,"size",void 0),__decorate([state()],ViewPageModule.prototype,"custom",void 0),ViewPageModule=__decorate([customElement(componentName)],ViewPageModule);export{ViewPageModule};