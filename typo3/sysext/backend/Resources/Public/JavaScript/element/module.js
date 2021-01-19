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
var __decorate=function(e,o,t,d){var l,r=arguments.length,i=r<3?o:null===d?d=Object.getOwnPropertyDescriptor(o,t):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,o,t,d);else for(var a=e.length-1;a>=0;a--)(l=e[a])&&(i=(r<3?l(i):r>3?l(o,t,i):l(o,t))||i);return r>3&&i&&Object.defineProperty(o,t,i),i};import{html,css,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";let ModuleElement=class extends LitElement{constructor(){super(...arguments),this.size="small"}render(){return html`
      <div class="module">
        <div class="module-loading-indicator"></div>

        <div class="module-docheader">
          <div class="module-docheader-bar module-docheader-bar-navigation">
            <slot name="docheader"/>
          </div>
          <div class="module-docheader-bar module-docheader-bar-buttons">
            <div class="module-docheader-bar-buttons-column-left">
              <slot name="docheader-button-left"></slot>
            </div>
            <div class="module-docheader-bar-buttons-column-right">
              <slot name="docheader-button-right"></slot>
            </div>
          </div>
        </div>
        <div class="module-body">
          <slot></slot>
        </div>
      </div>
    `}};ModuleElement.styles=css`
    :host {
      display: block;
      height: 100%;
    }
    .module-docheader {
      position: sticky;
      top: 20px;
      width: 100%;
      min-height: 65px;
      z-index: 300;
      background-color: #eee;
      border-bottom: 1px solid #c3c3c3;
      padding: 0 24px;
      box-sizing: border-box;
      transition: margin-top .3s ease-in-out;
    }
    .module-docheader-bar {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .module-docheader-bar > * {
      box-sizing: border-box;
      min-height: 26px;
      margin: 4px 0;
      line-height: 26px;
    }
    .module-docheader-bar-navigation {
      min-height: 26px;
    }
    .module-docheader-bar > *:empty {
      display: none;
    }

    .module-docheader-bar-buttons-column-left,
    .module-docheader-bar-buttons-column-right {
      display: flex;
      flex-direction: row;
    }

    .module-body {
      padding: 24px 24px;
    }
  `,__decorate([property({type:String})],ModuleElement.prototype,"size",void 0),ModuleElement=__decorate([customElement("typo3-backend-module")],ModuleElement);export{ModuleElement};