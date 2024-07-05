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
var __decorate=function(e,t,o,r){var l,c=arguments.length,n=c<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var p=e.length-1;p>=0;p--)(l=e[p])&&(n=(c<3?l(n):c>3?l(t,o,n):l(t,o))||n);return c>3&&n&&Object.defineProperty(t,o,n),n};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";let BoolTypeElement=class extends LitElement{render(){return html`
      <input
        type="hidden"
        name=${`data[${this.key}]`}
        value="0"
      />
      <div class="form-check form-check-type-toggle">
        <input
          type="checkbox"
          name=${`data[${this.key}]`}
          id=${this.key}
          class="form-check-input"
          value="1"
          .checked=${this.value}
        />
      </div>
    `}};__decorate([property({type:String})],BoolTypeElement.prototype,"key",void 0),__decorate([property({type:Boolean,converter:{fromAttribute:e=>"1"===e||"true"===e}})],BoolTypeElement.prototype,"value",void 0),BoolTypeElement=__decorate([customElement("typo3-backend-settings-type-bool")],BoolTypeElement);export{BoolTypeElement};