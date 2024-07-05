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
var __decorate=function(e,t,r,o){var p,l=arguments.length,n=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,o);else for(var m=e.length-1;m>=0;m--)(p=e[m])&&(n=(l<3?p(n):l>3?p(t,r,n):p(t,r))||n);return l>3&&n&&Object.defineProperty(t,r,n),n};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{BaseElement}from"@typo3/backend/settings/type/base.js";let NumberTypeElement=class extends BaseElement{render(){return html`
      <input
        id=${this.key}
        type="number"
        step="0.01"
        .value=${this.value}
        @change=${e=>this.value=parseFloat(e.target.value)}
      />
    `}};__decorate([property({type:String})],NumberTypeElement.prototype,"key",void 0),__decorate([property({type:Number})],NumberTypeElement.prototype,"value",void 0),NumberTypeElement=__decorate([customElement("typo3-backend-settings-type-number")],NumberTypeElement);export{NumberTypeElement};