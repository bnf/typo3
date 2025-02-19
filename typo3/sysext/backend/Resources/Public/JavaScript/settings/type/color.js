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
var e=function(e,t,o,r){var n,p=arguments.length,a=p<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var c=e.length-1;c>=0;c--)(n=e[c])&&(a=(p<3?n(a):p>3?n(t,o,a):n(t,o))||a);return p>3&&a&&Object.defineProperty(t,o,a),a};import{html as t}from"lit";import{customElement as o,property as r}from"lit/decorators.js";import{BaseElement as n}from"@typo3/backend/settings/type/base.js";import"@typo3/backend/color-picker.js";import p from"@typo3/core/event/regular-event.js";export const componentName="typo3-backend-settings-type-color";let a=class extends n{firstUpdated(){const e=this.getInputElement();e&&new p("blur",(e=>{this.updateValue(e.target.value)})).bindTo(e)}updateValue(e){this.value=e}render(){return t`<typo3-backend-color-picker><input type="text" id="${this.formid}" class="form-control" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.updateValue(e.target.value)}"></typo3-backend-color-picker>`}getInputElement(){return this.querySelector("input")}};e([r({type:String})],a.prototype,"value",void 0),a=e([o(componentName)],a);export{a as ColorTypeElement};