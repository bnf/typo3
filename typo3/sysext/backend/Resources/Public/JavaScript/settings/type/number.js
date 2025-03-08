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
var e=function(e,t,r,o){var n,a=arguments.length,p=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,r,o)
else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(p=(a<3?n(p):a>3?n(t,r,p):n(t,r))||p)
return a>3&&p&&Object.defineProperty(t,r,p),p}
import{html as t}from"lit"
import{customElement as r,property as o}from"lit/decorators.js"
import{BaseElement as n}from"@typo3/backend/settings/type/base.js"
export const componentName="typo3-backend-settings-type-number"
let a=class extends n{render(){return t`<input type="number" id="${this.formid}" class="form-control" step="0.01" ?readonly="${this.readonly}" .value="${this.value}" @change="${e=>this.value=parseFloat(e.target.value)}">`}}
e([o({type:Number})],a.prototype,"value",void 0),a=e([r(componentName)],a)
export{a as NumberTypeElement}
