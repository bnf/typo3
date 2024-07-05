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
var __decorate=function(e,t,r,l){var i,o=arguments.length,a=o<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,r):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,l);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(a=(o<3?i(a):o>3?i(t,r,a):i(t,r))||a);return o>3&&a&&Object.defineProperty(t,r,a),a};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{BaseElement}from"@typo3/backend/settings/type/base.js";import{live}from"lit/directives/live.js";let StringlistTypeElement=class extends BaseElement{updateValue(e,t){this.value[t]=e}addValue(e,t=""){this.value=this.value.toSpliced(e+1,0,t)}removeValue(e){this.value=this.value.toSpliced(e,1)}render(){return this.value.map(((e,t)=>html`
      <input
        id=${`${this.key}-${t}`}
        type="text"
        .value=${live(e)}
        @change=${e=>this.updateValue(e.target.value,t)}
      />
      <button @click=${()=>this.addValue(t)}>+</button>
      <button @click=${()=>this.removeValue(t)}>-</button>
      <br>
    `))}};__decorate([property({type:String})],StringlistTypeElement.prototype,"key",void 0),__decorate([property({type:Array})],StringlistTypeElement.prototype,"value",void 0),StringlistTypeElement=__decorate([customElement("typo3-backend-settings-type-stringlist")],StringlistTypeElement);export{StringlistTypeElement};