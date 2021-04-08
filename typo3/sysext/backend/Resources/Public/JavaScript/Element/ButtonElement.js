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
var __decorate=this&&this.__decorate||function(t,e,o,n){var r,i=arguments.length,l=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(l=(i<3?r(l):i>3?r(e,o,l):r(e,o))||l);return i>3&&l&&Object.defineProperty(e,o,l),l};define(["require","exports","lit-element","lit/decorators","TYPO3/CMS/Backend/Element/IconElement","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(t,e,o,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.ButtonElement=void 0;let r=class extends o.LitElement{constructor(){super(...arguments),this.disabled=!1,this.icon="",this.label="",this.type="",this.containment="",this.size=null}render(){return o.html`
      <button ?type="${this.type}" ?disabled="${this.disabled}" ?aria-label="${this.label}">
        ${this.icon?`<typo3-backend-icon icon=${this.icon}></typo3-backend-icon>`:o.html`<slot name="icon"></slot>`}
        <span class="label">${this.label?this.label:o.html`<slot></slot>`}</span>
        <slot name="trailing-icon"></slot>
      </button>
    `}};r.styles=o.css`
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
  `,__decorate([n.property({type:Boolean,reflect:!0})],r.prototype,"disabled",void 0),__decorate([n.property({type:String})],r.prototype,"icon",void 0),__decorate([n.property({type:String})],r.prototype,"label",void 0),__decorate([n.property({type:String})],r.prototype,"type",void 0),__decorate([n.property({type:String})],r.prototype,"containment",void 0),__decorate([n.property({type:String,reflect:!0})],r.prototype,"size",void 0),r=__decorate([n.customElement("typo3-backend-button")],r),e.ButtonElement=r}));