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
var __decorate=function(e,t,r,n){var o,p=arguments.length,l=p<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(p<3?o(l):p>3?o(t,r,l):o(t,r))||l);return p>3&&l&&Object.defineProperty(t,r,l),l};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{BaseElement}from"@typo3/backend/settings/type/base.js";let IntTypeElement=class extends BaseElement{render(){return html`
      <input
        id=${this.key}
        type="number"
        .value=${this.value}
        @change=${e=>this.value=parseInt(e.target.value,10)}
      />
    `}};__decorate([property({type:String})],IntTypeElement.prototype,"key",void 0),__decorate([property({type:Number})],IntTypeElement.prototype,"value",void 0),IntTypeElement=__decorate([customElement("typo3-backend-settings-type-int")],IntTypeElement);export{IntTypeElement};