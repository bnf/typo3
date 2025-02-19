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
import{property as t,customElement as e}from"lit/decorators.js";import{LitElement as o,html as i}from"lit";import r from"@typo3/backend/storage/browser-session.js";var n=function(t,e,o,i){var r,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,i);else for(var c=t.length-1;c>=0;c--)(r=t[c])&&(a=(n<3?r(a):n>3?r(e,o,a):r(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a};let a=class extends o{constructor(){super(...arguments),this.active=!1}connectedCallback(){this.parentContainer=this.closest("typo3-backend-live-search"),super.connectedCallback()}createRenderRoot(){return this}render(){return i`<div class=form-check><input type=checkbox class=form-check-input name=${this.optionName}[] value=${this.optionId} id=${this.optionId} ?checked=${this.active} @input=${this.handleInput}> <label class=form-check-label for=${this.optionId}>${this.optionLabel}</label></div>`}getStorageKey(){return`livesearch-option-${this.optionName}-${this.optionId}`}handleInput(){this.active=!this.active,this.parentContainer.dispatchEvent(new CustomEvent("typo3:live-search:option-invoked",{detail:{active:this.active}})),r.set(this.getStorageKey(),this.active?"1":"0")}};n([t({type:Boolean})],a.prototype,"active",void 0),n([t({type:String})],a.prototype,"optionId",void 0),n([t({type:String})],a.prototype,"optionName",void 0),n([t({type:String})],a.prototype,"optionLabel",void 0),a=n([e("typo3-backend-live-search-option-item")],a);export{a as SearchOptionItem};