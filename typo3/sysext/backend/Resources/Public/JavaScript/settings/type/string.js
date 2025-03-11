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
var e=function(e,t,r,o){var l,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,o)
else for(var s=e.length-1;s>=0;s--)(l=e[s])&&(a=(n<3?l(a):n>3?l(t,r,a):l(t,r))||a)
return n>3&&a&&Object.defineProperty(t,r,a),a}
import{html as t,nothing as r}from"lit"
import{customElement as o,property as l}from"lit/decorators.js"
import{BaseElement as n}from"@typo3/backend/settings/type/base.js"
export const componentName="typo3-backend-settings-type-string"
let a=class extends n{renderEnum(){return t`<select id="${this.formid}" class="form-select" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.value=e.target.value}">${Object.entries(this.enum).map((([value,label])=>t`<option ?selected="${this.value===value}" value="${value}">${label}${this.debug?t`[${value}]`:r}</option>`))}</select>`}render(){return"object"==typeof this.enum?this.renderEnum():t`<input type="text" id="${this.formid}" class="form-control" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.value=e.target.value}">`}}
e([l({type:String})],a.prototype,"value",void 0),a=e([o(componentName)],a)
export{a as StringTypeElement}
