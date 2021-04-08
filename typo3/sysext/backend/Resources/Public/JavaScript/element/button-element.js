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
var __decorate=function(t,e,o,n){var r,i=arguments.length,l=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(l=(i<3?r(l):i>3?r(e,o,l):r(e,o))||l);return i>3&&l&&Object.defineProperty(e,o,l),l};import{html,css,LitElement}from"lit-element";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/spinner-element.js";let ButtonElement=class extends LitElement{constructor(){super(...arguments),this.disabled=!1,this.icon="",this.label="",this.type="",this.containment="",this.size=null}render(){return html`
      <button ?type="${this.type}" ?disabled="${this.disabled}" ?aria-label="${this.label}">
        ${this.icon?`<typo3-backend-icon icon=${this.icon}></typo3-backend-icon>`:html`<slot name="icon"></slot>`}
        <span class="label">${this.label?this.label:html`<slot></slot>`}</span>
        <slot name="trailing-icon"></slot>
      </button>
    `}};ButtonElement.styles=css`
    :host([disabled]) {
      pointer-events: none;
    }
    button {
      display: inline-block;
      font-family: var(--t3-btn-font-family, inherit);
      font-weight: var(--t3-btn-font-weight, inherit);
      line-height: var(--t3-btn-line-height, inherit);
      color: var(--t3-body-color, inherit);
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      background-color: transparent;
      border: var(--t3-btn-border-width, currentColor) solid transparent;
    }
    button:hover {
    }
  `,__decorate([property({type:Boolean,reflect:!0})],ButtonElement.prototype,"disabled",void 0),__decorate([property({type:String})],ButtonElement.prototype,"icon",void 0),__decorate([property({type:String})],ButtonElement.prototype,"label",void 0),__decorate([property({type:String})],ButtonElement.prototype,"type",void 0),__decorate([property({type:String})],ButtonElement.prototype,"containment",void 0),__decorate([property({type:String,reflect:!0})],ButtonElement.prototype,"size",void 0),ButtonElement=__decorate([customElement("typo3-backend-button")],ButtonElement);export{ButtonElement};