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
var __decorate=function(e,t,r,o){var p,n=arguments.length,m=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)m=Reflect.decorate(e,t,r,o);else for(var l=e.length-1;l>=0;l--)(p=e[l])&&(m=(n<3?p(m):n>3?p(t,r,m):p(t,r))||m);return n>3&&m&&Object.defineProperty(t,r,m),m};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";let NumberTypeElement=class extends LitElement{render(){return html`
      <input
        id=${this.key}
        type="number"
        step="0.01"
        name=${"data["+this.key+"]"}
        .value=${this.value}
      />
    `}};__decorate([property({type:String})],NumberTypeElement.prototype,"key",void 0),__decorate([property({type:Number})],NumberTypeElement.prototype,"value",void 0),NumberTypeElement=__decorate([customElement("typo3-backend-settings-type-number")],NumberTypeElement);export{NumberTypeElement};