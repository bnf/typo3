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
var __decorate=function(e,t,r,l){var o,i=arguments.length,n=i<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,r):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,l);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(n=(i<3?o(n):i>3?o(t,r,n):o(t,r))||n);return i>3&&n&&Object.defineProperty(t,r,n),n};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{BaseElement}from"@typo3/backend/settings/type/base.js";import{live}from"lit/directives/live.js";export const componentName="typo3-backend-settings-type-stringlist";let StringlistTypeElement=class extends BaseElement{updateValue(e,t){this.value[t]=e}addValue(e,t=""){this.value=this.value.toSpliced(e+1,0,t)}removeValue(e){this.value=this.value.toSpliced(e,1)}render(){return(this.value||[]).map(((e,t)=>html`
      <input
        id=${`${this.key}-${t}`}
        type="text"
        class="form-control"
        .value=${live(e)}
        @change=${e=>this.updateValue(e.target.value,t)}
      />
      <button @click=${()=>this.addValue(t)}>+</button>
      <button @click=${()=>this.removeValue(t)}>-</button>
      <br>
    `))}};__decorate([property({type:String})],StringlistTypeElement.prototype,"key",void 0),__decorate([property({type:Array})],StringlistTypeElement.prototype,"value",void 0),StringlistTypeElement=__decorate([customElement(componentName)],StringlistTypeElement);export{StringlistTypeElement};