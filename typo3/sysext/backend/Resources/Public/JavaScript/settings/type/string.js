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
var __decorate=function(e,t,r,n){var o,i=arguments.length,p=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,r):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,r,n);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(p=(i<3?o(p):i>3?o(t,r,p):o(t,r))||p);return i>3&&p&&Object.defineProperty(t,r,p),p};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";let StringTypeElement=class extends LitElement{render(){return html`
      <input
        id=${this.key}
        type="text"
        name=${"data["+this.key+"]"}
        .value=${this.value}
      />
    `}};__decorate([property({type:String})],StringTypeElement.prototype,"key",void 0),__decorate([property({type:String})],StringTypeElement.prototype,"value",void 0),StringTypeElement=__decorate([customElement("typo3-backend-settings-type-string")],StringTypeElement);export{StringTypeElement};