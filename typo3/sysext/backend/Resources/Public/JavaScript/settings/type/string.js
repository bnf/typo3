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
import{html as e,nothing as t}from"lit";import{property as r,customElement as o}from"lit/decorators.js";import{BaseElement as n}from"@typo3/backend/settings/type/base.js";var s=function(e,t,r,o){var n,s=arguments.length,i=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(i=(s<3?n(i):s>3?n(t,r,i):n(t,r))||i);return s>3&&i&&Object.defineProperty(t,r,i),i};const i="typo3-backend-settings-type-string";let l=class extends n{renderEnum(){return e`<select id=${this.formid} class=form-select ?readonly=${this.readonly} .value=${this.value} @change=${e=>this.value=e.target.value}>${Object.entries(this.enum).map((([r,o])=>e`<option ?selected=${this.value===r} value=${r}>${o}${this.debug?e`[${r}]`:t}</option>`))}</select>`}render(){return"object"==typeof this.enum?this.renderEnum():e`<input type=text id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${this.value} @change=${e=>this.value=e.target.value}>`}};s([r({type:String})],l.prototype,"value",void 0),l=s([o(i)],l);export{l as StringTypeElement,i as componentName};