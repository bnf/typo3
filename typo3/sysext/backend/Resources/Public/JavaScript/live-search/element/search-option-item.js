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
var t=function(t,e,o,i){var r,n=arguments.length,c=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(c=(n<3?r(c):n>3?r(e,o,c):r(e,o))||c);return n>3&&c&&Object.defineProperty(e,o,c),c};import{customElement as e,property as o}from"lit/decorators.js";import{html as i,LitElement as r}from"lit";import n from"@typo3/backend/storage/browser-session.js";import{ifDefined as c}from"lit/directives/if-defined.js";let a=class extends r{constructor(){super(...arguments),this.active=!1}connectedCallback(){this.parentContainer=this.closest("typo3-backend-live-search"),super.connectedCallback()}createRenderRoot(){return this}render(){return i`<div class="form-check"><input type="checkbox" class="form-check-input" name="${this.optionName}[]" value="${this.optionId}" id="${this.optionId}" checked="${c(this.active?"checked":void 0)}" @input="${this.handleInput}"> <label class="form-check-label" for="${this.optionId}">${this.optionLabel}</label></div>`}getStorageKey(){return`livesearch-option-${this.optionName}-${this.optionId}`}handleInput(){this.active=!this.active,this.parentContainer.dispatchEvent(new CustomEvent("typo3:live-search:option-invoked",{detail:{active:this.active}})),n.set(this.getStorageKey(),this.active?"1":"0")}};t([o({type:Boolean})],a.prototype,"active",void 0),t([o({type:String})],a.prototype,"optionId",void 0),t([o({type:String})],a.prototype,"optionName",void 0),t([o({type:String})],a.prototype,"optionLabel",void 0),a=t([e("typo3-backend-live-search-option-item")],a);export{a as SearchOptionItem};