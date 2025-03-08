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
var e=function(e,t,o,r){var c,n=arguments.length,i=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,r)
else for(var a=e.length-1;a>=0;a--)(c=e[a])&&(i=(n<3?c(i):n>3?c(t,o,i):c(t,o))||i)
return n>3&&i&&Object.defineProperty(t,o,i),i}
import{html as t}from"lit"
import{customElement as o,property as r}from"lit/decorators.js"
import{BaseElement as c}from"@typo3/backend/settings/type/base.js"
export const componentName="typo3-backend-settings-type-bool"
let n=class extends c{render(){return t`<div class="form-check form-check-type-toggle"><input type="checkbox" id="${this.formid}" class="form-check-input" value="1" ?disabled="${this.readonly}" .checked="${this.value}" @change="${e=>this.value=e.target.checked}"></div>`}}
e([r({type:Boolean,converter:{toAttribute:e=>e?"1":"0",fromAttribute:e=>"1"===e||"true"===e}})],n.prototype,"value",void 0),n=e([o(componentName)],n)
export{n as BoolTypeElement}
