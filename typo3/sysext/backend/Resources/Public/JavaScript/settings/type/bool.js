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
var __decorate=function(e,t,o,r){var l,c=arguments.length,p=c<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,o,r);else for(var n=e.length-1;n>=0;n--)(l=e[n])&&(p=(c<3?l(p):c>3?l(t,o,p):l(t,o))||p);return c>3&&p&&Object.defineProperty(t,o,p),p};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{BaseElement}from"@typo3/backend/settings/type/base.js";let BoolTypeElement=class extends BaseElement{render(){return html`
      <div class="form-check form-check-type-toggle">
        <input
          type="checkbox"
          id=${this.key}
          class="form-check-input"
          value="1"
          .checked=${this.value}
          @change=${e=>this.value=!!e.target.checked}
        />
      </div>
    `}};__decorate([property({type:String})],BoolTypeElement.prototype,"key",void 0),__decorate([property({type:Boolean,converter:{toAttribute:e=>e?"1":"0",fromAttribute:e=>"1"===e||"true"===e}})],BoolTypeElement.prototype,"value",void 0),BoolTypeElement=__decorate([customElement("typo3-backend-settings-type-bool")],BoolTypeElement);export{BoolTypeElement};