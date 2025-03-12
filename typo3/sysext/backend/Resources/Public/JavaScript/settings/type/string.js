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
var e=function(e,t,r,o){var n,s=arguments.length,i=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(i=(s<3?n(i):s>3?n(t,r,i):n(t,r))||i);return s>3&&i&&Object.defineProperty(t,r,i),i};import{html as t,nothing as r}from"lit";import{customElement as o,property as n}from"lit/decorators.js";import{BaseElement as s}from"@typo3/backend/settings/type/base.js";export const componentName="typo3-backend-settings-type-string";let i=class extends s{renderEnum(){return t`<select id="${this.formid}" class="form-select" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.value=e.target.value}"> ${Object.entries(this.enum).map((([e,o])=>t`<option ?selected="${this.value===e}" value="${e}">${o}${this.debug?t`[${e}]`:r}</option>`))} </select>`}render(){return"object"==typeof this.enum?this.renderEnum():t`<input type="text" id="${this.formid}" class="form-control" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.value=e.target.value}">`}};e([n({type:String})],i.prototype,"value",void 0),i=e([o(componentName)],i);export{i as StringTypeElement};